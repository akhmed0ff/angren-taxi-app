import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>angrentaxi</Text>
    <ActivityIndicator size="large" color="#000" style={styles.spinner} />
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
    color: '#000',
    letterSpacing: 1,
  },
  spinner: {
    position: 'absolute',
    bottom: 80,
  },
});
