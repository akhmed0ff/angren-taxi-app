import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../utils/constants';
import type { PaymentMethod } from '../types';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

type MethodOption = {
  method: PaymentMethod;
  labelKey: string;
  icon: string;
};

const OPTIONS: MethodOption[] = [
  { method: 'cash', labelKey: 'payment.cash', icon: '💵' },
  { method: 'card', labelKey: 'payment.card', icon: '💳' },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const isSelected = selected === opt.method;
        return (
          <TouchableOpacity
            key={opt.method}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(opt.method)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{opt.icon}</Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {t(opt.labelKey)}
            </Text>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
});
