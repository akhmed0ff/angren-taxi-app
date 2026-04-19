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
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
} from '../../utils/validators';
import { COLORS } from '../../utils/constants';
import type { AuthStackParamList } from '../../types';

type RegisterNavProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterNavProp;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { register, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const nameErr = validateRequired(name, t('auth.name'));
    if (nameErr) newErrors.name = nameErr;
    if (!validateEmail(email)) newErrors.email = 'Введите корректный email';
    if (!validatePhone(phone)) newErrors.phone = 'Введите корректный номер телефона Узбекистана';
    const pwdErr = validatePassword(password);
    if (pwdErr) newErrors.password = pwdErr;
    if (password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordsNotMatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validate()) return;
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
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
        <Text style={styles.title}>{t('auth.register')}</Text>

        <Input
          label={t('auth.name')}
          value={name}
          onChangeText={setName}
          placeholder="Иван Иванов"
          error={errors.name}
        />
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
          label={t('auth.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="+998901234567"
          keyboardType="phone-pad"
          error={errors.phone}
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
        <Input
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          error={errors.confirmPassword}
        />

        <Button
          title={t('auth.registerButton')}
          onPress={handleRegister}
          loading={isLoading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.haveAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 24, paddingTop: 60 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  submitBtn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  eye: { fontSize: 18 },
});
