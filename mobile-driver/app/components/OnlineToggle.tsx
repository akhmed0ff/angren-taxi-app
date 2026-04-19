import React from 'react';
import {
  View,
  Switch,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
  isLoading?: boolean;
}

const OnlineToggle: React.FC<OnlineToggleProps> = ({ isOnline, onToggle, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <View style={styles.statusDot} />
      <Text style={styles.statusText}>
        {isOnline ? t('dashboard.online') : t('dashboard.offline')}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.white} style={styles.loader} />
      ) : (
        <Switch
          value={isOnline}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.gray[400], true: COLORS.success }}
          thumbColor={COLORS.white}
          ios_backgroundColor={COLORS.gray[400]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.sm,
  },
  online: {
    backgroundColor: COLORS.success,
  },
  offline: {
    backgroundColor: COLORS.gray[500],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  statusText: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
  loader: {
    marginRight: SPACING.xs,
  },
});

export default OnlineToggle;
