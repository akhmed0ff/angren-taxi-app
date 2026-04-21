import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>Ангрен такси</Text>
    <ActivityIndicator style={styles.spinner} size="small" color="#000000" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  spinner: {
    position: 'absolute',
    bottom: 80,
  },
});
