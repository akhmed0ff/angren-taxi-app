import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DriverStats as DriverStatsType } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { formatCurrency, formatRating } from '../utils/formatters';

interface DriverStatsProps {
  stats: DriverStatsType;
}

const DriverStats: React.FC<DriverStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatItem label={t('dashboard.todayEarnings')} value={formatCurrency(stats.todayEarnings)} highlight />
      <View style={styles.divider} />
      <StatItem label={t('dashboard.todayOrders')} value={String(stats.todayOrders)} />
      <View style={styles.divider} />
      <StatItem label={t('dashboard.rating')} value={`⭐ ${formatRating(stats.rating)}`} />
      <View style={styles.divider} />
      <StatItem label={t('dashboard.totalOrders')} value={String(stats.totalOrders)} />
    </View>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight = false }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, highlight && styles.highlight]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  highlight: {
    color: COLORS.success,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.gray[200],
  },
});

export default DriverStats;
