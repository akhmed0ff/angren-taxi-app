import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEarningsStore } from '../../store/useEarningsStore';
import { earningsService } from '../../services/earnings.service';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

const EarningsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { summary, isLoading, isRequestingPayout, setSummary, setLoading, addPayout } =
    useEarningsStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await earningsService.getEarnings(period);
      setSummary(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [period, setLoading, setSummary]);

  useEffect(() => {
    void loadEarnings();
  }, [loadEarnings]);

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount.replace(/[^\d.]/g, ''));
    if (!amount || amount <= 0) {
      Alert.alert(t('common.error'), t('earnings.enterAmount'));
      return;
    }
    if (summary && amount > summary.pendingPayout) {
      Alert.alert(t('common.error'), 'Недостаточно средств');
      return;
    }
    try {
      const payout = await earningsService.requestPayout(amount);
      addPayout(payout);
      setShowPayoutModal(false);
      setPayoutAmount('');
      Alert.alert(t('common.success'), 'Запрос на выплату отправлен');
    } catch {
      Alert.alert(t('common.error'), t('errors.serverError'));
    }
  };

  const PERIODS: Array<{ key: typeof period; label: string }> = [
    { key: 'week', label: t('earnings.week') },
    { key: 'month', label: t('earnings.month') },
    { key: 'all', label: 'За всё время' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('earnings.title')} />

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadEarnings} />}
        >
          {/* Period selector */}
          <View style={styles.periodRow}>
            {PERIODS.map(({ key, label }) => (
              <Button
                key={key}
                title={label}
                onPress={() => setPeriod(key)}
                variant={period === key ? 'primary' : 'outline'}
                size="sm"
                style={styles.periodBtn}
              />
            ))}
          </View>

          {summary ? (
            <>
              {/* Total card */}
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>{t('earnings.total')}</Text>
                <Text style={styles.totalValue}>{formatCurrency(summary.totalEarnings)}</Text>
                <View style={styles.totalRow}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalItemValue}>{formatCurrency(summary.weekEarnings)}</Text>
                    <Text style={styles.totalItemLabel}>{t('earnings.week')}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalItem}>
                    <Text style={styles.totalItemValue}>{formatCurrency(summary.monthEarnings)}</Text>
                    <Text style={styles.totalItemLabel}>{t('earnings.month')}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalItem}>
                    <Text style={styles.totalItemValue}>{formatCurrency(summary.pendingPayout)}</Text>
                    <Text style={styles.totalItemLabel}>К выплате</Text>
                  </View>
                </View>
              </View>

              {/* Payout button */}
              {summary.pendingPayout > 0 ? (
                <Button
                  title={`💳 ${t('earnings.requestPayout')} (${formatCurrency(summary.pendingPayout)})`}
                  onPress={() => setShowPayoutModal(true)}
                  isLoading={isRequestingPayout}
                  fullWidth
                  size="lg"
                  variant="success"
                />
              ) : null}

              {/* Daily breakdown */}
              {summary.dailyBreakdown.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📅 По дням</Text>
                  {summary.dailyBreakdown.map((day) => (
                    <View key={day.date} style={styles.dayRow}>
                      <View>
                        <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                        <Text style={styles.dayMeta}>{day.orders} заказов · {day.hours.toFixed(1)} ч</Text>
                      </View>
                      <Text style={styles.dayEarnings}>{formatCurrency(day.earnings)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Payouts history */}
              {summary.payouts.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💸 {t('earnings.payoutHistory')}</Text>
                  {summary.payouts.map((payout) => (
                    <View key={payout.id} style={styles.payoutRow}>
                      <View>
                        <Text style={styles.payoutAmount}>{formatCurrency(payout.amount)}</Text>
                        <Text style={styles.payoutDate}>{formatDate(payout.requestedAt)}</Text>
                      </View>
                      <Text
                        style={[
                          styles.payoutStatus,
                          payout.status === 'completed' ? styles.statusCompleted : styles.statusPending,
                        ]}
                      >
                        {t(`earnings.${payout.status}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💰</Text>
              <Text style={styles.emptyText}>{t('earnings.noEarnings')}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t('earnings.requestPayout')}</Text>
            <Text style={styles.modalSub}>
              Доступно: {formatCurrency(summary?.pendingPayout ?? 0)}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder={t('earnings.enterAmount')}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowPayoutModal(false)}
                variant="outline"
                style={styles.modalBtn}
              />
              <Button
                title={t('common.confirm')}
                onPress={handlePayout}
                isLoading={isRequestingPayout}
                variant="success"
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  container: { padding: SPACING.base, gap: SPACING.md },
  periodRow: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'center' },
  periodBtn: { flex: 1 },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  totalLabel: { color: COLORS.gray[400], fontSize: FONTS.sizes.sm },
  totalValue: { color: COLORS.white, fontSize: FONTS.sizes.xxxl, fontWeight: '800' },
  totalRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalItemValue: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '700' },
  totalItemLabel: { color: COLORS.gray[400], fontSize: FONTS.sizes.xs, marginTop: 2 },
  divider: { width: 1, backgroundColor: COLORS.gray[700] },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[800] },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  dayDate: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray[800] },
  dayMeta: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500], marginTop: 2 },
  dayEarnings: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.success },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  payoutAmount: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[800] },
  payoutDate: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500] },
  payoutStatus: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  statusCompleted: { color: COLORS.success },
  statusPending: { color: COLORS.warning },
  empty: { alignItems: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.gray[600], textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray[900], textAlign: 'center' },
  modalSub: { fontSize: FONTS.sizes.md, color: COLORS.gray[600], textAlign: 'center' },
  amountInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.lg,
    textAlign: 'center',
  },
  modalButtons: { flexDirection: 'row', gap: SPACING.sm },
  modalBtn: { flex: 1 },
});

export default EarningsScreen;
