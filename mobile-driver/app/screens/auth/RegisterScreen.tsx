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
import { AuthStackParamList, VehicleCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPhone, isValidPassword, isValidYear } from '../../utils/validators';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, VEHICLE_CATEGORIES } from '../../utils/constants';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Nav = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { register, isLoading, error } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleCategory: 'economy' as VehicleCategory,
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    vehicleColor: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.firstName.trim()) errs.firstName = 'Введите имя';
    if (!form.lastName.trim()) errs.lastName = 'Введите фамилию';
    if (!isValidEmail(form.email.trim())) errs.email = 'Введите корректный email';
    if (!isValidPhone(form.phone.trim())) errs.phone = 'Введите корректный телефон (+998...)';
    if (!isValidPassword(form.password)) errs.password = 'Минимум 6 символов';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    if (!form.vehicleMake.trim()) errs.vehicleMake = 'Введите марку';
    if (!form.vehicleModel.trim()) errs.vehicleModel = 'Введите модель';
    const year = parseInt(form.vehicleYear, 10);
    if (!isValidYear(year)) errs.vehicleYear = 'Введите корректный год';
    if (!form.vehiclePlate.trim()) errs.vehiclePlate = 'Введите номерной знак';
    if (!form.vehicleColor.trim()) errs.vehicleColor = 'Введите цвет';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        vehicleCategory: form.vehicleCategory,
        vehicleMake: form.vehicleMake.trim(),
        vehicleModel: form.vehicleModel.trim(),
        vehicleYear: parseInt(form.vehicleYear, 10),
        vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
        vehicleColor: form.vehicleColor.trim(),
      });
      navigation.navigate('Documents');
    } catch {
      Alert.alert(t('common.error'), error ?? t('errors.unknown'));
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('auth.register')}</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Personal Info */}
          <Text style={styles.sectionTitle}>👤 Личная информация</Text>
          <Input
            label={t('auth.firstName')}
            value={form.firstName}
            onChangeText={(v) => setField('firstName', v)}
            error={errors.firstName}
          />
          <Input
            label={t('auth.lastName')}
            value={form.lastName}
            onChangeText={(v) => setField('lastName', v)}
            error={errors.lastName}
          />
          <Input
            label={t('auth.email')}
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label={t('auth.phone')}
            value={form.phone}
            onChangeText={(v) => setField('phone', v)}
            keyboardType="phone-pad"
            placeholder="+998901234567"
            error={errors.phone}
          />
          <Input
            label={t('auth.password')}
            value={form.password}
            onChangeText={(v) => setField('password', v)}
            isPassword
            error={errors.password}
          />
          <Input
            label={t('auth.confirmPassword')}
            value={form.confirmPassword}
            onChangeText={(v) => setField('confirmPassword', v)}
            isPassword
            error={errors.confirmPassword}
          />

          {/* Vehicle Info */}
          <Text style={styles.sectionTitle}>🚗 {t('vehicle.category')}</Text>

          <View style={styles.categoryRow}>
            {VEHICLE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  form.vehicleCategory === cat && styles.categoryBtnActive,
                ]}
                onPress={() => setField('vehicleCategory', cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    form.vehicleCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {t(`vehicle.${cat}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={t('vehicle.make')}
            value={form.vehicleMake}
            onChangeText={(v) => setField('vehicleMake', v)}
            placeholder="Chevrolet"
            error={errors.vehicleMake}
          />
          <Input
            label={t('vehicle.model')}
            value={form.vehicleModel}
            onChangeText={(v) => setField('vehicleModel', v)}
            placeholder="Cobalt"
            error={errors.vehicleModel}
          />
          <Input
            label={t('vehicle.year')}
            value={form.vehicleYear}
            onChangeText={(v) => setField('vehicleYear', v)}
            keyboardType="numeric"
            placeholder="2022"
            error={errors.vehicleYear}
          />
          <Input
            label={t('vehicle.plate')}
            value={form.vehiclePlate}
            onChangeText={(v) => setField('vehiclePlate', v)}
            autoCapitalize="characters"
            placeholder="01A123BC"
            error={errors.vehiclePlate}
          />
          <Input
            label={t('vehicle.color')}
            value={form.vehicleColor}
            onChangeText={(v) => setField('vehicleColor', v)}
            placeholder="Белый"
            error={errors.vehicleColor}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            size="lg"
            style={styles.button}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              {t('auth.hasAccount')} <Text style={styles.link}>{t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  container: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  back: { fontSize: 24, color: COLORS.primary, width: 32 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.primary },
  sectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
  },
  categoryBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[700],
    fontWeight: '600',
  },
  categoryTextActive: { color: COLORS.white },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  button: { marginTop: SPACING.md, marginBottom: SPACING.md },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: FONTS.sizes.md, color: COLORS.gray[600] },
  link: { color: COLORS.primary, fontWeight: '700' },
});

export default RegisterScreen;
