import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import { useAppSelector } from '../../store/hooks';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>angrentaxi</Text>
      <ActivityIndicator
        style={styles.spinner}
        size="small"
        color="#000000"
      />
    </View>
  );
};

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
