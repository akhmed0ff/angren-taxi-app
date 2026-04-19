import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { PaymentMethodSelector } from '../../components/PaymentMethodSelector';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useOrders } from '../../hooks/useOrders';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPaymentMethod } from '../../store/slices/payments.slice';
import { calculatePrice } from '../../services/orders.service';
import { COLORS, CAR_CLASSES } from '../../utils/constants';
import { formatPrice, formatDuration, formatDistance } from '../../utils/formatters';
import type { CarClass, PaymentMethod, Location as AppLocation, MainStackParamList } from '../../types';

type OrderCreateNavProp = StackNavigationProp<MainStackParamList, 'OrderCreate'>;

export const OrderCreateScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<OrderCreateNavProp>();
  const dispatch = useAppDispatch();
  const { createOrder, isLoading } = useOrders();
  const { paymentMethod } = useAppSelector((s) => s.payments);

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [carClass, setCarClass] = useState<CarClass>('economy');
  const [estimate, setEstimate] = useState<{ price: number; distance: number; duration: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [userLocation, setUserLocation] = useState<AppLocation | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const coords: AppLocation = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        const geocode = await Location.reverseGeocodeAsync(loc.coords);
        if (geocode[0]) {
          setFromAddress(`${geocode[0].street ?? ''} ${geocode[0].streetNumber ?? ''}`.trim());
        }
      }
    })();
  }, []);

  const handleEstimate = async () => {
    if (!fromAddress || !toAddress) {
      Alert.alert(t('common.error'), 'Введите адреса отправления и назначения');
      return;
    }
    setEstimating(true);
    try {
      const from: AppLocation = userLocation ?? { latitude: 41.0198, longitude: 70.1439, address: fromAddress };
      const to: AppLocation = { latitude: 41.03, longitude: 70.16, address: toAddress };
      const result = await calculatePrice(from, to, carClass);
      setEstimate(result);
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message);
    } finally {
      setEstimating(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!estimate) { await handleEstimate(); return; }
    const from: AppLocation = userLocation ?? { latitude: 41.0198, longitude: 70.1439, address: fromAddress };
    const to: AppLocation = { latitude: 41.03, longitude: 70.16, address: toAddress };
    const order = await createOrder({ from, to, carClass, paymentMethod });
    if (order) {
      navigation.replace('OrderTracking', { orderId: order.id });
    }
  };

  return (
    <View style={styles.flex}>
      <Header title={t('order.selectRoute')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Input
          label={t('order.from')}
          value={fromAddress}
          onChangeText={(v) => { setFromAddress(v); setEstimate(null); }}
          placeholder={t('order.addressPlaceholder')}
          leftIcon={<Text>📍</Text>}
        />
        <Input
          label={t('order.to')}
          value={toAddress}
          onChangeText={(v) => { setToAddress(v); setEstimate(null); }}
          placeholder={t('order.addressPlaceholder')}
          leftIcon={<Text>🏁</Text>}
        />

        {/* Car class selector */}
        <Text style={styles.sectionTitle}>{t('order.carClass')}</Text>
        <View style={styles.classRow}>
          {(Object.keys(CAR_CLASSES) as CarClass[]).map((cls) => {
            const info = CAR_CLASSES[cls];
            const selected = carClass === cls;
            return (
              <TouchableOpacity
                key={cls}
                style={[styles.classCard, selected && styles.classCardSelected]}
                onPress={() => { setCarClass(cls); setEstimate(null); }}
                activeOpacity={0.8}
              >
                <Text style={styles.classIcon}>{info.icon}</Text>
                <Text style={[styles.classLabel, selected && styles.classLabelSelected]}>
                  {info.label}
                </Text>
                <Text style={styles.classMultiplier}>×{info.multiplier}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Estimate */}
        {estimating && <LoadingSpinner size="small" />}
        {estimate && !estimating && (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateRow}>
              💰 {t('order.estimatedPrice', { price: formatPrice(estimate.price) })}
            </Text>
            <Text style={styles.estimateRow}>
              ⏱ {t('order.estimatedTime', { time: formatDuration(estimate.duration) })}
            </Text>
            <Text style={styles.estimateRow}>
              📏 {formatDistance(estimate.distance)}
            </Text>
          </View>
        )}

        {/* Payment method */}
        <Text style={styles.sectionTitle}>{t('payment.selectMethod')}</Text>
        <PaymentMethodSelector
          selected={paymentMethod}
          onSelect={(m: PaymentMethod) => dispatch(setPaymentMethod(m))}
        />

        <Button
          title={estimate ? t('order.createOrder') : 'Рассчитать стоимость'}
          onPress={handleCreateOrder}
          loading={isLoading || estimating}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 12 },
  classRow: { flexDirection: 'row', gap: 10 },
  classCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  classCardSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  classIcon: { fontSize: 26, marginBottom: 4 },
  classLabel: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  classLabelSelected: { color: COLORS.primary },
  classMultiplier: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  estimateBox: {
    backgroundColor: `${COLORS.secondary}12`,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 6,
  },
  estimateRow: { fontSize: 15, color: COLORS.text },
  submitBtn: { marginTop: 24 },
});
