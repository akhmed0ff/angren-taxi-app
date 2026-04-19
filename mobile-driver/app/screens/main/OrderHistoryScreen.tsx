import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatus, Order } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import OrderCard from '../../components/OrderCard';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_FILTERS: Array<{ key: OrderStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'cancelled', label: 'Отменённые' },
  { key: 'in_progress', label: 'В пути' },
];

const OrderHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { orderHistory, isLoadingHistory, historyTotal, historyPage, loadOrderHistory } = useOrders();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  const load = useCallback(
    (page = 1) => {
      const status = activeFilter === 'all' ? undefined : activeFilter;
      void loadOrderHistory(page, status);
    },
    [activeFilter, loadOrderHistory],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleLoadMore = () => {
    if (orderHistory.length < historyTotal && !isLoadingHistory) {
      load(historyPage + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('orders.history')} showBack />

      {/* Filters */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, activeFilter === key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterText, activeFilter === key && styles.filterTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoadingHistory && orderHistory.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Order }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoadingHistory} onRefresh={() => load(1)} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>{t('orders.noHistory')}</Text>
            </View>
          }
          ListFooterComponent={isLoadingHistory && orderHistory.length > 0 ? <LoadingSpinner /> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  filters: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray[200],
  },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: FONTS.sizes.xs, color: COLORS.gray[700], fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  list: { padding: SPACING.base },
  empty: { alignItems: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.gray[600], textAlign: 'center' },
});

export default OrderHistoryScreen;
