import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';

import { useTaxiStore, PaymentMethodType } from '../store/taxiStore';

interface PaymentMethodSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: (method: PaymentMethodType) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'cash' as PaymentMethodType,
    name: 'Наличные',
    icon: '💵',
    description: 'Оплата при прибытии',
  },
  {
    id: 'card' as PaymentMethodType,
    name: 'Карта',
    icon: '💳',
    description: 'Безопасная оплата',
  },
];

export const PaymentMethodSheet: React.FC<PaymentMethodSheetProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const { paymentMethod, setPayment } = useTaxiStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    paymentMethod,
  );

  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  };

  const handleConfirm = () => {
    setPayment(selectedMethod);
    onConfirm?.(selectedMethod);
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      />

      {/* Bottom Sheet */}
      <View style={styles.sheetContainer}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <Text style={styles.title}>Способ оплаты</Text>

        {/* Payment Methods */}
        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  isSelected && styles.methodCardSelected,
                ]}
                onPress={() => handleSelectMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.methodContent}>
                  <Text style={styles.methodIcon}>{method.icon}</Text>
                  <View style={styles.methodTextContainer}>
                    <Text
                      style={[
                        styles.methodName,
                        isSelected && styles.methodNameSelected,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text
                      style={[
                        styles.methodDescription,
                        isSelected && styles.methodDescriptionSelected,
                      ]}
                    >
                      {method.description}
                    </Text>
                  </View>
                </View>

                {/* Radio Button */}
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>Готово</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodsList: {
    marginBottom: 20,
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  methodCardSelected: {
    backgroundColor: '#FFFBF0',
    borderColor: '#F5C400',
  },
  methodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 2,
  },
  methodNameSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  methodDescription: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
  },
  methodDescriptionSelected: {
    color: '#666666',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: '#F5C400',
    backgroundColor: '#FFFBF0',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5C400',
  },
  confirmButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});
