import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import { useAppDispatch } from '../../store/hooks';
import { setStats } from '../../store/slices/driver.slice';
import { driverService } from '../../services/driver.service';
import { useAuth } from '../../hooks/useAuth';
import { MainStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatRating } from '../../utils/formatters';
import Button from '../../components/Button';
import Header from '../../components/Header';

type Nav = StackNavigationProp<MainStackParamList>;

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { vehicle, stats, documentsStatus, isVerified } = useAppSelector((state) => state.driver);

  const loadStats = useCallback(async () => {
    try {
      const s = await driverService.getStats();
      dispatch(setStats(s));
    } catch {
      // silent
    }
  }, [dispatch]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.yes'), style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const docStatusColor = {
    verified: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.danger,
    missing: COLORS.gray[500],
  }[documentsStatus];

  const docStatusLabel = {
    verified: t('documents.verified'),
    pending: t('documents.verificationPending'),
    rejected: t('documents.rejected'),
    missing: 'Не загружены',
  }[documentsStatus];

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={t('profile.title')}
        rightComponent={
          <Text onPress={handleLogout} style={styles.logoutBtn}>{t('common.logout')}</Text>
        }
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadStats} />}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Верифицирован</Text>
            </View>
          ) : null}
        </View>

        {/* Stats */}
        {stats ? (
          <View style={styles.statsRow}>
            <StatBox label="Рейтинг" value={`⭐ ${formatRating(stats.rating)}`} />
            <StatBox label="Заказов" value={String(stats.totalOrders)} />
            <StatBox label="Принятие" value={`${stats.acceptanceRate}%`} />
          </View>
        ) : null}

        {/* Vehicle */}
        {vehicle ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚗 {t('profile.vehicle')}</Text>
            <InfoRow label={t('vehicle.make')} value={vehicle.make} />
            <InfoRow label={t('vehicle.model')} value={vehicle.model} />
            <InfoRow label={t('vehicle.year')} value={String(vehicle.year)} />
            <InfoRow label={t('vehicle.plate')} value={vehicle.plate} />
            <InfoRow label={t('vehicle.color')} value={vehicle.color} />
            <InfoRow label={t('vehicle.category')} value={t(`vehicle.${vehicle.category}`)} />
          </View>
        ) : null}

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📄 {t('profile.documents')}</Text>
          <View style={styles.docStatusRow}>
            <View style={[styles.docStatusDot, { backgroundColor: docStatusColor }]} />
            <Text style={[styles.docStatusText, { color: docStatusColor }]}>{docStatusLabel}</Text>
          </View>
          <Button
            title="Загрузить документы"
            onPress={() => navigation.navigate('AvailableOrders')}
            variant="outline"
            fullWidth
            size="sm"
            style={styles.smallBtn}
          />
        </View>

        <Button
          title={`${t('common.logout')} 👋`}
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

interface StatBoxProps { label: string; value: string }
const StatBox: React.FC<StatBoxProps> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface InfoRowProps { label: string; value: string }
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  container: { padding: SPACING.base, gap: SPACING.md },
  logoutBtn: { color: COLORS.danger, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  name: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray[900] },
  email: { fontSize: FONTS.sizes.md, color: COLORS.gray[600], marginTop: 4 },
  verifiedBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: SPACING.sm,
  },
  verifiedText: { color: COLORS.success, fontWeight: '700', fontSize: FONTS.sizes.sm },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray[600], marginTop: 2 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.xs,
  },
  cardTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[900], marginBottom: SPACING.xs },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: FONTS.sizes.md, color: COLORS.gray[600] },
  infoValue: { fontSize: FONTS.sizes.md, color: COLORS.gray[900], fontWeight: '600' },
  docStatusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  docStatusDot: { width: 10, height: 10, borderRadius: 5 },
  docStatusText: { fontSize: FONTS.sizes.md, fontWeight: '600' },
  smallBtn: { marginTop: SPACING.sm },
  logoutButton: { marginTop: SPACING.sm },
});

export default ProfileScreen;
