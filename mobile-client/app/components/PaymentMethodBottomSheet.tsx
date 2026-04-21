import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

interface PaymentMethod {
  id: string;
  name: string;
  isSelectable: boolean;
  isDefault?: boolean;
}

interface PaymentMethodBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectPayment: (paymentMethodId: string) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bonus', name: 'Бонусы', isSelectable: false },
  { id: 'cash', name: 'Наличные', isSelectable: true, isDefault: true },
  { id: 'card', name: 'Добавить карту', isSelectable: true },
];

const { height: screenHeight } = Dimensions.get('window');
const SHEET_HEIGHT = 360;

export const PaymentMethodBottomSheet: React.FC<PaymentMethodBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelectPayment,
}) => {
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [bonusToggle, setBonusToggle] = useState(false);
  
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
  };

  const handleDone = () => {
    onSelectPayment(selectedPayment);
    onClose();
  };

  const handleOverlayPress = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <Text style={styles.title}>Способ оплаты</Text>

        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map((method) => (
            <View key={method.id} style={styles.methodItem}>
              <TouchableOpacity
                style={styles.methodButton}
                onPress={() => method.isSelectable && handlePaymentSelect(method.id)}
                disabled={!method.isSelectable}
                activeOpacity={method.isSelectable ? 0.6 : 1}
              >
                <View style={styles.methodContent}>
                  <Text
                    style={[
                      styles.methodName,
                      selectedPayment === method.id && styles.methodNameSelected,
                      !method.isSelectable && styles.methodNameDisabled,
                    ]}
                  >
                    {method.name}
                  </Text>
                </View>

                {method.isSelectable ? (
                  <View
                    style={[
                      styles.radio,
                      selectedPayment === method.id && styles.radioSelected,
                    ]}
                  >
                    {selectedPayment === method.id && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                ) : (
                  <Switch
                    value={bonusToggle}
                    onValueChange={setBonusToggle}
                    trackColor={{ false: '#E0E0E0', true: '#F5C400' }}
                    thumbColor={bonusToggle ? '#FFD700' : '#FFFFFF'}
                    style={styles.toggle}
                  />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Готово</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
  },
  methodsList: {
    flex: 1,
    marginBottom: 16,
  },
  methodItem: {
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  methodNameSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  methodNameDisabled: {
    color: '#999999',
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
  toggle: {
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
