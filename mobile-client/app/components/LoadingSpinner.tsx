import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

import { COLORS } from '../utils/constants';

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  color?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullscreen = false,
  color = COLORS.primary,
  size = 'large',
  style,
}) => {
  if (fullscreen) {
    return (
      <View style={[styles.overlay, style]}>
        <ActivityIndicator color={color} size={size} />
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
