import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { validateEmail } from '../../utils/validators';
import * as authService from '../../services/auth.service';
import { COLORS } from '../../utils/constants';
import type { AuthStackParamList } from '../../types';

type ForgotNavProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotNavProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      return;
    }
    setEmailError(null);
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={t('auth.forgotPassword')} onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successText}>{t('auth.resetEmailSent')}</Text>
            <Button
              title={t('common.back')}
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.btn}
            />
          </View>
        ) : (
          <>
            <Text style={styles.description}>
              Введите email, и мы отправим инструкции по восстановлению пароля.
            </Text>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
            <Button
              title={t('auth.sendCode')}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.btn}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 24, paddingTop: 32 },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  btn: { marginTop: 8 },
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  successIcon: { fontSize: 56 },
  successText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
