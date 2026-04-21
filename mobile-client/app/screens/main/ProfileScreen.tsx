import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/useUiStore';
import { changeLanguage } from '../../i18n/i18n';
import { COLORS } from '../../utils/constants';
import { formatPhone } from '../../utils/formatters';
import type { MainStackParamList, Language } from '../../types';

type ProfileNavProp = StackNavigationProp<MainStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNavProp>();
  const { user, logout, isLoading, updateProfile } = useAuth();
  const { language, setLanguage } = useUiStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const handleSave = async () => {
    await updateProfile({ name, email });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(t('common.confirm'), t('profile.logoutConfirm'), [
      { text: t('common.no') },
      { text: t('common.yes'), style: 'destructive', onPress: logout },
    ]);
  };

  const toggleLanguage = async () => {
    const newLang: Language = language === 'ru' ? 'uz' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('profile.title')}
        rightIcon={<Text style={styles.editIcon}>{editing ? '💾' : '✏️'}</Text>}
        rightAction={editing ? handleSave : () => setEditing(true)}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRating}>⭐ {user?.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          {editing ? (
            <>
              <Input label={t('profile.name')} value={name} onChangeText={setName} />
              <Input label={t('profile.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </>
          ) : (
            <>
              <InfoRow label={t('profile.email')} value={user?.email ?? '—'} />
              <InfoRow label={t('profile.phone')} value={formatPhone(user?.phone ?? '')} />
              <InfoRow label={t('profile.bonuses')} value={`${user?.bonusBalance ?? 0} ${t('bonuses.points')}`} />
            </>
          )}
        </View>

        {/* Quick links */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory' as any)}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuLabel}>{t('profile.orderHistory')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Bonuses' as any)}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuLabel}>{t('profile.bonuses')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyPlaces')}>
          <Text style={styles.menuIcon}>📍</Text>
          <Text style={styles.menuLabel}>{t('profile.myPlaces', { defaultValue: 'Мои места' })}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuLabel}>{t('profile.notifications', { defaultValue: 'Новости и уведомления' })}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuLabel}>{t('profile.settings', { defaultValue: 'Настройки' })}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Language toggle */}
        <View style={styles.languageRow}>
          <Text style={styles.menuIcon}>🌐</Text>
          <Text style={styles.menuLabel}>{t('profile.language')}</Text>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <Button title={t('profile.logout')} onPress={handleLogout} variant="danger" loading={isLoading} style={styles.logoutBtn} />

        {editing && (
          <Button title={t('profile.saveChanges')} onPress={handleSave} loading={isLoading} style={styles.saveBtn} />
        )}
      </ScrollView>
    </View>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: COLORS.surface },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  userRating: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  chevron: { fontSize: 20, color: COLORS.textSecondary },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  langToggle: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: { color: COLORS.surface, fontWeight: '700', fontSize: 13 },
  logoutBtn: { marginTop: 16 },
  saveBtn: { marginTop: 8 },
  editIcon: { fontSize: 20 },
});
