import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/Header';
import { COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { MainStackParamList } from '../../types';

type NotificationsNavProp = StackNavigationProp<MainStackParamList>;

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Добро пожаловать!',
    body: 'Спасибо за регистрацию в Ангрен Такси. Желаем приятных поездок!',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
];

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NotificationsNavProp>();

  return (
    <View style={styles.container}>
      <Header
        title={t('notifications.title', { defaultValue: 'Уведомления' })}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              {t('notifications.empty', { defaultValue: 'Нет уведомлений' })}
            </Text>
          </View>
        ) : (
          MOCK_NOTIFICATIONS.map((item) => (
            <View key={item.id} style={[styles.card, !item.isRead && styles.cardUnread]}>
              <View style={styles.iconWrapper}>
                <Text style={styles.icon}>🔔</Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 24 },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 24 },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  info: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: COLORS.disabled,
  },
});
