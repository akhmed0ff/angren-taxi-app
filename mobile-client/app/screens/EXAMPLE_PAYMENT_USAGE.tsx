import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { PaymentMethodSheet } from '../components/PaymentMethodSheet';
import { useTaxiStore } from '../store/taxiStore';

/**
 * Пример экрана с использованием PaymentMethodSheet
 * Скопируй этот код и адаптируй под свои нужды
 */
export const ExamplePaymentScreen: React.FC = () => {
  const [isPaymentSheetVisible, setIsPaymentSheetVisible] = useState(false);
  const { paymentMethod } = useTaxiStore();

  const handleOpenPaymentSheet = () => {
    setIsPaymentSheetVisible(true);
  };

  const handleClosePaymentSheet = () => {
    setIsPaymentSheetVisible(false);
  };

  const handlePaymentConfirm = (method: string) => {
    console.log('Payment method selected:', method);
    // Идеально для сохранения в Zustand и отправки на сервер
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Выбор способа оплаты</Text>

        <View style={styles.currentSelection}>
          <Text style={styles.selectionLabel}>Текущий способ:</Text>
          <Text style={styles.selectionValue}>
            {paymentMethod === 'cash' ? '💵 Наличные' : '💳 Карта'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.openButton}
          onPress={handleOpenPaymentSheet}
          activeOpacity={0.8}
        >
          <Text style={styles.openButtonText}>Изменить способ оплаты</Text>
        </TouchableOpacity>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Доступные способы:</Text>
          <Text style={styles.descriptionText}>
            💵 Наличные — оплата при прибытии{'\n'}
            💳 Карта — безопасная оплата
          </Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <PaymentMethodSheet
        isVisible={isPaymentSheetVisible}
        onClose={handleClosePaymentSheet}
        onConfirm={handlePaymentConfirm}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
    marginTop: 16,
  },
  currentSelection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectionLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selectionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  openButton: {
    backgroundColor: '#F5C400',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#F5C400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  description: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
});
