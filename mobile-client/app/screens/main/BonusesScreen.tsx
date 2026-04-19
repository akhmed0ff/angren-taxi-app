import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBonusBalanceThunk, fetchBonusHistoryThunk } from '../../store/slices/bonuses.slice';
import { COLORS, BONUS_CASHBACK_PERCENT } from '../../utils/constants';
import { formatDate, formatPrice } from '../../utils/formatters';
import type { BonusTransaction } from '../../types';

export const BonusesScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { balance, history, isLoading } = useAppSelector((s) => s.bonuses);

  useEffect(() => {
    dispatch(fetchBonusBalanceThunk());
    dispatch(fetchBonusHistoryThunk(undefined));
  }, [dispatch]);

  const renderItem = ({ item }: { item: BonusTransaction }) => {
    const isEarned = item.type === 'earned';
    return (
      <View style={styles.txRow}>
        <View style={styles.txIcon}>
          <Text style={styles.txIconText}>{isEarned ? '➕' : '➖'}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={[styles.txAmount, { color: isEarned ? COLORS.secondary : COLORS.danger }]}>
          {isEarned ? '+' : '-'}{item.amount}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t('bonuses.title')} />

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('bonuses.balance')}</Text>
        <Text style={styles.balanceValue}>{balance.toLocaleString('ru-RU')}</Text>
        <Text style={styles.balanceUnit}>баллов</Text>
        <View style={styles.cashbackBadge}>
          <Text style={styles.cashbackText}>
            {t('bonuses.cashback', { percent: BONUS_CASHBACK_PERCENT })}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>{t('bonuses.history')}</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('bonuses.noHistory')}</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: 16,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 },
  balanceValue: { color: COLORS.surface, fontSize: 52, fontWeight: '800', lineHeight: 60 },
  balanceUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 12 },
  cashbackBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cashbackText: { color: COLORS.surface, fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconText: { fontSize: 18 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, color: COLORS.text },
  txDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 32, fontSize: 15 },
});
