import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setOnlineStatus, setUpdatingStatus, setStats } from '../../store/slices/driver.slice';
import { driverService } from '../../services/driver.service';
import { useLocation } from '../../hooks/useLocation';
import { MainStackParamList } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import DriverStats from '../../components/DriverStats';
import OnlineToggle from '../../components/OnlineToggle';

type Nav = StackNavigationProp<MainStackParamList>;

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { isOnline, stats, isUpdatingStatus } = useAppSelector((state) => state.driver);
  const { user } = useAppSelector((state) => state.auth);
  const { activeOrder } = useAppSelector((state) => state.orders);
  useLocation();

  const loadStats = useCallback(async () => {
    try {
      const s = await driverService.getStats();
      dispatch(setStats(s));
    } catch {
      // silent fail
    }
  }, [dispatch]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleToggleOnline = async (value: boolean) => {
    dispatch(setUpdatingStatus(true));
    try {
      const result = await driverService.toggleOnline(value);
      dispatch(setOnlineStatus(result.isOnline));
    } catch {
      Alert.alert(t('common.error'), t('errors.serverError'));
    } finally {
      dispatch(setUpdatingStatus(false));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.greeting}>Привет, {user?.firstName}! 👋</Text>
          <Text style={styles.subGreeting}>АНГРЕН ТАКСИ</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadStats} />}
      >
        <OnlineToggle
          isOnline={isOnline}
          onToggle={handleToggleOnline}
          isLoading={isUpdatingStatus}
        />

        {/* Active order banner */}
        {activeOrder ? (
          <TouchableOpacity
            style={styles.activeOrderBanner}
            onPress={() => navigation.navigate('ActiveOrder', { orderId: activeOrder.id })}
          >
            <Text style={styles.bannerTitle}>🚗 Активный заказ</Text>
            <Text style={styles.bannerSubtitle}>
              {activeOrder.pickupAddress.title} → {activeOrder.destinationAddress.title}
            </Text>
            <Text style={styles.bannerPrice}>{formatCurrency(activeOrder.price)}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Stats */}
        {stats ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Статистика</Text>
            <DriverStats stats={stats} />
          </View>
        ) : null}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Быстрые действия</Text>
          <View style={styles.actions}>
            <QuickAction
              emoji="📋"
              label={t('orders.available')}
              onPress={() => navigation.navigate('AvailableOrders')}
              color={COLORS.info}
            />
            <QuickAction
              emoji="📜"
              label={t('orders.history')}
              onPress={() => navigation.navigate('OrderHistory')}
              color={COLORS.warning}
            />
            <QuickAction
              emoji="⭐"
              label={t('ratings.title')}
              onPress={() => navigation.navigate('Ratings')}
              color={COLORS.accent}
            />
          </View>
        </View>

        {/* Earnings today */}
        {stats ? (
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Заработок сегодня</Text>
            <Text style={styles.earningsValue}>{formatCurrency(stats.todayEarnings)}</Text>
            <Text style={styles.earningsSub}>
              {stats.todayOrders} заказов · Рейтинг: ⭐ {stats.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

interface QuickActionProps {
  emoji: string;
  label: string;
  onPress: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ emoji, label, onPress, color }) => (
  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color + '20' }]} onPress={onPress}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  headerBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  greeting: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  subGreeting: { color: COLORS.gray[400], fontSize: FONTS.sizes.sm },
  settingsIcon: { fontSize: 24 },
  container: { padding: SPACING.base, gap: SPACING.md },
  activeOrderBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
  },
  bannerTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.base,
    marginBottom: SPACING.xs,
  },
  bannerSubtitle: { color: COLORS.gray[300], fontSize: FONTS.sizes.sm },
  bannerPrice: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  section: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[700] },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', textAlign: 'center' },
  earningsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  earningsLabel: { color: COLORS.gray[400], fontSize: FONTS.sizes.sm, marginBottom: SPACING.xs },
  earningsValue: { color: COLORS.white, fontSize: FONTS.sizes.xxxl, fontWeight: '800' },
  earningsSub: { color: COLORS.gray[400], fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
});

export default DashboardScreen;
