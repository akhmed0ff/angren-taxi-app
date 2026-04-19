import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmailOrPhone, isValidPassword } from '../../utils/validators';
import { COLORS, FONTS, SPACING } from '../../utils/constants';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error } = useAuth();

  const [login_val, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!isValidEmailOrPhone(login_val.trim())) {
      newErrors.login = 'Введите корректный email или номер телефона';
    }
    if (!isValidPassword(password)) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ login: login_val.trim(), password });
    } catch {
      Alert.alert(t('common.error'), error ?? t('auth.invalidCredentials'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🚗</Text>
            <Text style={styles.appName}>АНГРЕН ТАКСИ</Text>
            <Text style={styles.subtitle}>Панель водителя</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.emailOrPhone')}
              placeholder="+998 XX XXX-XX-XX"
              value={login_val}
              onChangeText={setLoginVal}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.login}
            />
            <Input
              label={t('auth.password')}
              placeholder="••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={errors.password}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title={t('auth.login')}
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>{t('auth.register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[600],
  },
  link: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
