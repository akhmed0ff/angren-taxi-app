import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useUiStore } from '../../store/useUiStore';
import { changeLanguage } from '../../i18n/i18n';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList, Language } from '../../types';

type SettingsNavProp = StackNavigationProp<MainStackParamList>;

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsNavProp>();
  const { language, setLanguage } = useUiStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleLanguage = async () => {
    const newLang: Language = language === 'ru' ? 'uz' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
  };

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clearCache', { defaultValue: 'Очистить кэш' }),
      t('settings.clearCacheConfirm', { defaultValue: 'Вы уверены что хотите очистить кэш?' }),
      [
        { text: t('common.no', { defaultValue: 'Нет' }) },
        {
          text: t('common.yes', { defaultValue: 'Да' }),
          style: 'destructive',
          onPress: () =>
            Alert.alert('', t('settings.cacheCleared', { defaultValue: 'Кэш очищен' })),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('settings.title', { defaultValue: 'Настройки' })}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Language section */}
        <Text style={styles.sectionTitle}>
          {t('settings.general', { defaultValue: 'Основные' })}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🌐</Text>
            <Text style={styles.rowLabel}>
              {t('profile.language', { defaultValue: 'Язык' })}
            </Text>
            <Button
              title={language === 'ru' ? 'RU' : 'UZ'}
              onPress={toggleLanguage}
              variant="outline"
              style={styles.langBtn}
            />
          </View>
        </View>

        {/* Notifications section */}
        <Text style={styles.sectionTitle}>
          {t('settings.notifications', { defaultValue: 'Уведомления' })}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🔔</Text>
            <Text style={styles.rowLabel}>
              {t('settings.pushNotifications', { defaultValue: 'Push-уведомления' })}
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.surface}
            />
          </View>
        </View>

        {/* Appearance section */}
        <Text style={styles.sectionTitle}>
          {t('settings.appearance', { defaultValue: 'Внешний вид' })}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🌙</Text>
            <Text style={styles.rowLabel}>
              {t('settings.darkTheme', { defaultValue: 'Тёмная тема' })}
            </Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              disabled
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.surface}
            />
          </View>
        </View>

        {/* Storage section */}
        <Text style={styles.sectionTitle}>
          {t('settings.storage', { defaultValue: 'Хранилище' })}
        </Text>
        <View style={styles.card}>
          <Button
            title={t('settings.clearCache', { defaultValue: 'Очистить кэш' })}
            onPress={handleClearCache}
            variant="outline"
          />
        </View>

        {/* About section */}
        <Text style={styles.sectionTitle}>
          {t('settings.about', { defaultValue: 'О приложении' })}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>ℹ️</Text>
            <Text style={styles.rowLabel}>
              {t('settings.version', { defaultValue: 'Версия приложения' })}
            </Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: { fontSize: 20 },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  langBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
