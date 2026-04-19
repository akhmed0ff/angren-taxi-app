import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/Header';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useOrders } from '../../hooks/useOrders';
import { COLORS } from '../../utils/constants';
import type { Order, OrderStatus, MainStackParamList } from '../../types';

type HistoryNavProp = StackNavigationProp<MainStackParamList>;

const STATUS_FILTERS: Array<OrderStatus | 'all'> = ['all', 'completed', 'cancelled'];

export const OrderHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HistoryNavProp>();
  const { orderHistory, isLoading, fetchHistory } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory({ page: 1, limit: 20 });
  }, [fetchHistory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory({ page: 1, limit: 20 });
    setRefreshing(false);
  }, [fetchHistory]);

  const filtered = statusFilter === 'all'
    ? orderHistory
    : orderHistory.filter((o) => o.status === statusFilter);

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  const filterLabel = (f: OrderStatus | 'all'): string => {
    if (f === 'all') return t('history.allStatuses');
    if (f === 'completed') return t('history.completed');
    if (f === 'cancelled') return t('history.cancelled');
    return f;
  };

  return (
    <View style={styles.container}>
      <Header title={t('history.title')} />

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, statusFilter === f && styles.chipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>
              {filterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} onPress={handleOrderPress} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>{t('history.noOrders')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.surface, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyBox: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
