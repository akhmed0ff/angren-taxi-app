import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

import { COLORS } from '../utils/constants';
import type { Driver } from '../types';

interface DriverCardProps {
  driver: Driver;
  eta?: number; // minutes
}

export const DriverCard: React.FC<DriverCardProps> = ({ driver, eta }) => {
  const handleCall = (): void => {
    Linking.openURL(`tel:${driver.phone}`).catch(() => undefined);
  };

  const stars = '★'.repeat(Math.round(driver.rating)) + '☆'.repeat(5 - Math.round(driver.rating));

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {driver.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.rating}>{stars} {driver.rating.toFixed(1)}</Text>
        <Text style={styles.vehicle}>
          {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
        </Text>
        <Text style={styles.plate}>{driver.vehicle.plateNumber}</Text>
        {eta !== undefined ? (
          <Text style={styles.eta}>Прибудет через ~{eta} мин</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
        <Text style={styles.callIcon}>📞</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.surface,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  rating: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 2,
  },
  vehicle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  plate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  eta: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
  },
});
