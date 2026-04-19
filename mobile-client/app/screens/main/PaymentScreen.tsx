import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { PaymentMethodSelector } from '../../components/PaymentMethodSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPaymentMethod } from '../../store/slices/payments.slice';
import { processPaymentThunk } from '../../store/slices/payments.slice';
import { formatPrice } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList, PaymentMethod } from '../../types';

type PaymentNavProp = StackNavigationProp<MainStackParamList, 'Payment'>;
type PaymentRouteProp = RouteProp<MainStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentNavProp;
  route: PaymentRouteProp;
}

export const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { orderId, amount } = route.params;
  const { paymentMethod, isLoading } = useAppSelector((s) => s.payments);

  const handlePayment = async () => {
    const result = await dispatch(
      processPaymentThunk({ orderId, method: paymentMethod, amount }),
    );
    if (processPaymentThunk.fulfilled.match(result)) {
      Alert.alert('✅', t('payment.paymentSuccess'), [
        { text: t('common.ok'), onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(t('common.error'), result.payload as string);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={t('payment.title')} onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t('payment.title')}</Text>
          <Text style={styles.amount}>{formatPrice(amount)}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('payment.selectMethod')}</Text>
        <PaymentMethodSelector
          selected={paymentMethod}
          onSelect={(m: PaymentMethod) => dispatch(setPaymentMethod(m))}
        />

        <Button
          title={t('payment.confirm')}
          onPress={handlePayment}
          loading={isLoading}
          style={styles.btn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20 },
  amountCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 },
  amount: { color: COLORS.surface, fontSize: 32, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  btn: { marginTop: 28 },
});
