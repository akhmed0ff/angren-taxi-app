import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, ORDER_TIMER_SECONDS } from '../utils/constants';
import { formatCurrency, formatDistance, formatDuration } from '../utils/formatters';

interface AvailableOrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

const AvailableOrderCard: React.FC<AvailableOrderCardProps> = ({ order, onAccept, onReject }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(ORDER_TIMER_SECONDS);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: ORDER_TIMER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, [order.id, onReject, progressAnim]);

  const timerColor = timeLeft > 10 ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.container}>
      {/* Timer bar */}
      <Animated.View
        style={[
          styles.timerBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: timerColor,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Passenger info */}
        <View style={styles.row}>
          <View>
            <Text style={styles.passengerName}>
              {order.passenger.firstName} {order.passenger.lastName}
            </Text>
            <Text style={styles.passengerRating}>
              ⭐ {order.passenger.rating.toFixed(1)} · {order.passenger.totalTrips} {t('orders.history')}
            </Text>
          </View>
          <View style={styles.timerCircle}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.routeItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {order.pickupAddress.title}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {order.destinationAddress.title}
            </Text>
          </View>
        </View>

        {/* Meta info */}
        <View style={styles.meta}>
          <Text style={styles.metaItem}>
            {formatDistance(order.distance)}
          </Text>
          <Text style={styles.metaDivider}>·</Text>
          <Text style={styles.metaItem}>
            {formatDuration(order.duration)}
          </Text>
          <Text style={styles.metaDivider}>·</Text>
          <Text style={styles.paymentMethod}>
            {t(`orders.${order.paymentMethod}`)}
          </Text>
        </View>

        {/* Price + Actions */}
        <View style={styles.actions}>
          <Text style={styles.price}>{formatCurrency(order.price)}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => onReject(order.id)}
            >
              <Text style={styles.rejectText}>{t('orders.reject')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => onAccept(order.id)}
            >
              <Text style={styles.acceptText}>{t('orders.accept')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  timerBar: {
    height: 4,
  },
  content: {
    padding: SPACING.base,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  passengerName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  passengerRating: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  timerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
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
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: COLORS.gray[300],
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[800],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  metaDivider: {
    marginHorizontal: SPACING.xs,
    color: COLORS.gray[400],
  },
  paymentMethod: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btn: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  rejectBtn: {
    backgroundColor: COLORS.gray[200],
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  rejectText: {
    color: COLORS.gray[700],
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
  },
  acceptText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
});

export default AvailableOrderCard;
