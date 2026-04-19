import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../../hooks/useOrders';
import { useAppSelector } from '../../store/hooks';
import { MainStackParamList } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency, formatDistance, formatDuration, formatPhone } from '../../utils/formatters';
import MapComponent from '../../components/MapComponent';
import Button from '../../components/Button';
import Header from '../../components/Header';

type RouteProps = RouteProp<MainStackParamList, 'ActiveOrder'>;

const ActiveOrderScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { activeOrder, isProcessing, arriveAtPickup, startOrder, completeOrder, cancelOrder } =
    useOrders();
  const driverLocation = useAppSelector((state) => state.driver.currentLocation);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const order = activeOrder;

  useEffect(() => {
    if (!order) {
      navigation.goBack();
    }
  }, [order, navigation]);

  const handleCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      Alert.alert(t('common.error'), 'Укажите причину отмены');
      return;
    }
    setShowCancelModal(false);
    await cancelOrder(cancelReason.trim());
    navigation.goBack();
  }, [cancelReason, cancelOrder, navigation, t]);

  const handleComplete = useCallback(async () => {
    Alert.alert('Завершить поездку?', 'Вы уверены, что хотите завершить поездку?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('orders.complete'),
        onPress: async () => {
          await completeOrder();
          navigation.goBack();
        },
      },
    ]);
  }, [completeOrder, navigation, t]);

  if (!order) return null;

  const pickupCoords = order.pickupAddress.coordinates;
  const destCoords = order.destinationAddress.coordinates;
  const driverCoords = driverLocation
    ? { latitude: driverLocation.latitude, longitude: driverLocation.longitude }
    : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('orders.active')} showBack />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapComponent
          driverLocation={driverCoords}
          pickupLocation={pickupCoords}
          destinationLocation={destCoords}
          routeCoordinates={[pickupCoords, destCoords]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.details}>
        {/* Status badge */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t(`orders.status.${order.status}`)}</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(order.price)}</Text>
        </View>

        {/* Passenger */}
        <View style={styles.passengerCard}>
          <Text style={styles.avatar}>👤</Text>
          <View style={styles.passengerInfo}>
            <Text style={styles.passengerName}>
              {order.passenger.firstName} {order.passenger.lastName}
            </Text>
            <Text style={styles.passengerRating}>⭐ {order.passenger.rating.toFixed(1)}</Text>
            <Text style={styles.passengerPhone}>{formatPhone(order.passenger.phone)}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{formatDistance(order.distance)}</Text>
            <Text style={styles.metaText}>{formatDuration(order.duration)}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{t('orders.pickup')}</Text>
              <Text style={styles.addressText}>{order.pickupAddress.title}</Text>
            </View>
          </View>
          <View style={styles.addressDivider} />
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{t('orders.destination')}</Text>
              <Text style={styles.addressText}>{order.destinationAddress.title}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {order.status === 'accepted' ? (
            <Button
              title={t('orders.arrived')}
              onPress={arriveAtPickup}
              isLoading={isProcessing}
              fullWidth
              size="lg"
              variant="primary"
            />
          ) : null}
          {order.status === 'arrived' ? (
            <Button
              title={t('orders.startRide')}
              onPress={startOrder}
              isLoading={isProcessing}
              fullWidth
              size="lg"
              variant="success"
            />
          ) : null}
          {order.status === 'in_progress' ? (
            <Button
              title={t('orders.complete')}
              onPress={handleComplete}
              isLoading={isProcessing}
              fullWidth
              size="lg"
              variant="success"
            />
          ) : null}

          {order.status !== 'completed' && order.status !== 'cancelled' ? (
            <Button
              title={t('orders.cancel')}
              onPress={() => setShowCancelModal(true)}
              variant="outline"
              fullWidth
              size="md"
              style={styles.cancelBtn}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t('orders.cancelReason')}</Text>
            <TextInput
              style={styles.reasonInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Укажите причину..."
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowCancelModal(false)}
                variant="outline"
                style={styles.modalBtn}
              />
              <Button
                title={t('orders.cancel')}
                onPress={handleCancel}
                variant="danger"
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  mapContainer: { height: 280 },
  details: { padding: SPACING.base, gap: SPACING.md },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  price: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.primary },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  avatar: { fontSize: 40 },
  passengerInfo: { flex: 1 },
  passengerName: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[900] },
  passengerRating: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], marginTop: 2 },
  passengerPhone: { fontSize: FONTS.sizes.sm, color: COLORS.info, marginTop: 2 },
  meta: { alignItems: 'flex-end' },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600] },
  addressCard: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500], marginBottom: 2 },
  addressText: { fontSize: FONTS.sizes.md, color: COLORS.gray[900], fontWeight: '600' },
  addressDivider: { height: 20, width: 2, backgroundColor: COLORS.gray[300], marginLeft: 5, marginVertical: 4 },
  actionButtons: { gap: SPACING.sm },
  cancelBtn: { marginTop: SPACING.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: { flexDirection: 'row', gap: SPACING.sm },
  modalBtn: { flex: 1 },
});

export default ActiveOrderScreen;
