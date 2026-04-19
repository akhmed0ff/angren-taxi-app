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
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validators';
import { COLORS } from '../../utils/constants';
import type { AuthStackParamList } from '../../types';

type LoginScreenNavProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!validateEmail(email)) newErrors.email = t('validators.invalidEmail');
    const pwdKey = validatePassword(password);
    if (pwdKey) newErrors.password = t(pwdKey);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validate()) return;
    try {
      await login(email.trim(), password);
    } catch {
      Alert.alert(t('common.error'), error ?? t('common.unknownError'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🚖</Text>
        <Text style={styles.appName}>АНГРЕН ТАКСИ</Text>
        <Text style={styles.title}>{t('auth.login')}</Text>

        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="example@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          error={errors.password}
          rightIcon={<Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>}
          onRightIconPress={() => setShowPassword((v) => !v)}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotLink}
        >
          <Text style={styles.link}>{t('auth.forgotPasswordLink')}</Text>
        </TouchableOpacity>

        <Button
          title={t('auth.loginButton')}
          onPress={handleLogin}
          loading={isLoading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  submitBtn: { marginTop: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  eye: { fontSize: 18 },
});
