import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { MapComponent } from '../../components/MapComponent';
import { DriverCard } from '../../components/DriverCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useTracking } from '../../hooks/useTracking';
import { useOrders } from '../../hooks/useOrders';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateCurrentOrderStatus } from '../../store/slices/orders.slice';
import { socketService } from '../../services/socket.service';
import { rateDriver } from '../../services/orders.service';
import { COLORS, ORDER_STATUS_COLORS } from '../../utils/constants';
import type { MainStackParamList } from '../../types';

type OrderTrackingNavProp = StackNavigationProp<MainStackParamList, 'OrderTracking'>;
type OrderTrackingRouteProp = RouteProp<MainStackParamList, 'OrderTracking'>;

interface Props {
  navigation: OrderTrackingNavProp;
  route: OrderTrackingRouteProp;
}

export const OrderTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { orderId } = route.params;
  const { cancelOrder, isLoading } = useOrders();
  const { currentOrder } = useAppSelector((s) => s.orders);
  const { driverLocation } = useTracking(currentOrder?.driver?.id);

  const [ratingVisible, setRatingVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    socketService.onOrderStatusChange(({ orderId: id, status }) => {
      if (id === orderId) {
        dispatch(updateCurrentOrderStatus(status as any));
        if (status === 'completed') setRatingVisible(true);
        if (status === 'cancelled') navigation.goBack();
      }
    });
    return () => { socketService.removeAllListeners(); };
  }, [orderId, dispatch, navigation]);

  const handleCancel = () => {
    Alert.alert(t('common.confirm'), t('tracking.cancelConfirm'), [
      { text: t('common.no') },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: async () => {
          await cancelOrder(orderId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSubmitRating = useCallback(async () => {
    setRatingSubmitting(true);
    try {
      await rateDriver(orderId, selectedRating);
    } catch { /* ignore */ }
    finally {
      setRatingSubmitting(false);
      setRatingVisible(false);
      navigation.goBack();
    }
  }, [orderId, selectedRating, navigation]);

  if (!currentOrder) return <LoadingSpinner fullscreen />;

  const statusColor = ORDER_STATUS_COLORS[currentOrder.status] ?? COLORS.textSecondary;
  const canCancel = ['pending', 'accepted'].includes(currentOrder.status);

  const statusMessages: Record<string, string> = {
    pending: t('order.status.pending'),
    accepted: t('order.status.accepted'),
    arrived: t('order.status.arrived'),
    inProgress: t('tracking.tripInProgress'),
    completed: t('order.status.completed'),
    cancelled: t('order.status.cancelled'),
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapComponent
          mode="assigned"
          driverLocation={driverLocation ?? currentOrder.driver?.location}
          destination={currentOrder.to}
        />
      </View>

      <View style={styles.sheet}>
        {/* Status bar */}
        <View style={[styles.statusBar, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusMessages[currentOrder.status] ?? currentOrder.status}
          </Text>
        </View>

        {/* Driver card */}
        {currentOrder.driver ? (
          <DriverCard driver={currentOrder.driver} />
        ) : (
          <View style={styles.waitingBox}>
            <LoadingSpinner size="large" />
            <Text style={styles.waitingText}>{t('order.status.pending')}</Text>
          </View>
        )}

        {canCancel && (
          <Button
            title={t('tracking.cancelOrder')}
            onPress={handleCancel}
            variant="danger"
            loading={isLoading}
            style={styles.btn}
          />
        )}
      </View>

      {/* Rating modal */}
      <Modal visible={ratingVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('tracking.rateTitle')}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setSelectedRating(s)}>
                  <Text style={[styles.star, s <= selectedRating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={t('tracking.submitRating')}
              onPress={handleSubmitRating}
              loading={ratingSubmitting}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { flex: 1 },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    gap: 12,
  },
  statusBar: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusText: { fontSize: 15, fontWeight: '700' },
  waitingBox: { alignItems: 'center', paddingVertical: 12 },
  waitingText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  btn: { marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  star: { fontSize: 36, color: COLORS.border },
  starActive: { color: COLORS.warning },
});
