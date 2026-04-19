import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { formatCurrency, formatDateTime, formatDistance, formatDuration } from '../utils/formatters';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { t } = useTranslation();

  const statusColor = {
    pending: COLORS.warning,
    accepted: COLORS.info,
    driver_en_route: COLORS.info,
    arrived: COLORS.info,
    in_progress: COLORS.primary,
    completed: COLORS.success,
    cancelled: COLORS.danger,
  }[order.status] ?? COLORS.gray[500];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {t(`orders.status.${order.status}`)}
          </Text>
        </View>
        <Text style={styles.price}>{formatCurrency(order.price)}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeItem}>
          <View style={[styles.dot, styles.pickupDot]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.pickupAddress.title}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <View style={[styles.dot, styles.destDot]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.destinationAddress.title}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.meta}>
          {formatDistance(order.distance)} · {formatDuration(order.duration)}
        </Text>
        <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  price: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  route: {
    marginBottom: SPACING.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickupDot: {
    backgroundColor: COLORS.success,
  },
  destDot: {
    backgroundColor: COLORS.danger,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.gray[300],
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[800],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
});

export default OrderCard;
