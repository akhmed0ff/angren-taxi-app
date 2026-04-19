import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLanguage, setNotificationsEnabled, setSoundEnabled } from '../../store/slices/ui.slice';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import Header from '../../components/Header';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { language, notificationsEnabled, soundEnabled } = useAppSelector((state) => state.ui);
  const { logout } = useAuth();

  const handleLanguageChange = (lng: 'ru' | 'uz') => {
    dispatch(setLanguage(lng));
    void i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.yes'), style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('settings.title')} showBack />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            {(['ru', 'uz'] as const).map((lng) => (
              <TouchableOpacity
                key={lng}
                style={[styles.langBtn, language === lng && styles.langBtnActive]}
                onPress={() => handleLanguageChange(lng)}
              >
                <Text style={[styles.langText, language === lng && styles.langTextActive]}>
                  {lng === 'ru' ? '🇷🇺 ' + t('settings.russian') : '🇺🇿 ' + t('settings.uzbek')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 {t('settings.notifications')}</Text>
          <SettingRow
            label={t('settings.notifications')}
            value={notificationsEnabled}
            onToggle={(v) => dispatch(setNotificationsEnabled(v))}
          />
          <SettingRow
            label={t('settings.sound')}
            value={soundEnabled}
            onToggle={(v) => dispatch(setSoundEnabled(v))}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ {t('settings.about')}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutAppName}>🚗 АНГРЕН ТАКСИ</Text>
            <Text style={styles.aboutVersion}>{t('settings.version')} 1.0.0</Text>
            <Text style={styles.aboutText}>Панель водителя</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 {t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SettingRowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, onToggle }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
      thumbColor={COLORS.white}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  container: { padding: SPACING.base, gap: SPACING.md },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  langRow: { flexDirection: 'row', gap: SPACING.sm },
  langBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
  },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  langText: { fontSize: FONTS.sizes.md, color: COLORS.gray[700], fontWeight: '600' },
  langTextActive: { color: COLORS.white },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  settingLabel: { fontSize: FONTS.sizes.md, color: COLORS.gray[800] },
  aboutCard: { alignItems: 'center', padding: SPACING.md, gap: SPACING.xs },
  aboutAppName: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.primary },
  aboutVersion: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600] },
  aboutText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500] },
  logoutBtn: {
    backgroundColor: COLORS.danger + '20',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
});

export default SettingsScreen;
