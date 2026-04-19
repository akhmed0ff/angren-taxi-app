import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../../hooks/useOrders';
import { useAppSelector } from '../../store/hooks';
import { COLORS, FONTS, SPACING } from '../../utils/constants';
import { Order } from '../../types';
import AvailableOrderCard from '../../components/AvailableOrderCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Header from '../../components/Header';

const AvailableOrdersScreen: React.FC = () => {
  const { t } = useTranslation();
  const { availableOrders, isLoadingAvailable, isProcessing, loadAvailableOrders, acceptOrder, rejectOrder } = useOrders();
  const isOnline = useAppSelector((state) => state.driver.isOnline);

  useEffect(() => {
    if (isOnline) {
      void loadAvailableOrders();
    }
  }, [isOnline, loadAvailableOrders]);

  const handleAccept = useCallback(
    async (orderId: string) => {
      try {
        await acceptOrder(orderId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('errors.serverError');
        Alert.alert(t('common.error'), message);
      }
    },
    [acceptOrder, t],
  );

  const handleReject = useCallback(
    async (orderId: string) => {
      await rejectOrder(orderId);
    },
    [rejectOrder],
  );

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <AvailableOrderCard order={item} onAccept={handleAccept} onReject={handleReject} />
    ),
    [handleAccept, handleReject],
  );

  if (!isOnline) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title={t('orders.available')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.offlineEmoji}>😴</Text>
          <Text style={styles.emptyTitle}>{t('dashboard.offline')}</Text>
          <Text style={styles.emptyText}>{t('dashboard.goOnline')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('orders.available')} />
      {isLoadingAvailable ? (
        <LoadingSpinner fullScreen message={t('common.loading')} />
      ) : (
        <FlatList
          data={availableOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingAvailable}
              onRefresh={loadAvailableOrders}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.offlineEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('dashboard.noOrdersNearby')}</Text>
              <Text style={styles.emptyText}>Потяните вниз для обновления</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  list: { padding: SPACING.base },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  offlineEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.gray[700],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});

export default AvailableOrdersScreen;
