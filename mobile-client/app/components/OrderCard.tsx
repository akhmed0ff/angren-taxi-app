import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS, ORDER_STATUS_COLORS, CAR_CLASSES } from '../utils/constants';
import { formatPrice, formatDate } from '../utils/formatters';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onPress?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const statusColor = ORDER_STATUS_COLORS[order.status] ?? COLORS.textSecondary;
  const carClass = CAR_CLASSES[order.carClass];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(order)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.dot} />
        <Text style={styles.address} numberOfLines={1}>
          {order.from.address ?? `${order.from.latitude}, ${order.from.longitude}`}
        </Text>
      </View>
      <View style={styles.routeLine} />
      <View style={styles.route}>
        <View style={[styles.dot, styles.dotDest]} />
        <Text style={styles.address} numberOfLines={1}>
          {order.to.address ?? `${order.to.latitude}, ${order.to.longitude}`}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.carClass}>
          {carClass.icon} {carClass.label}
        </Text>
        <Text style={styles.price}>{formatPrice(order.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  dotDest: {
    backgroundColor: COLORS.danger,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  carClass: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
