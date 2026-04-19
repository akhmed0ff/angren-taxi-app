import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/auth.service';
import { COLORS, FONTS, SPACING } from '../../utils/constants';
import { isValidAccountNumber } from '../../utils/validators';
import Button from '../../components/Button';
import Input from '../../components/Input';

const BankDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [form, setForm] = useState({
    bankName: '',
    accountNumber: '',
    cardNumber: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isSaving, setIsSaving] = useState(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.bankName.trim()) errs.bankName = 'Введите название банка';
    if (!isValidAccountNumber(form.accountNumber)) errs.accountNumber = 'Введите корректный номер счёта (минимум 16 цифр)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await authService.updateBankDetails({
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim().replace(/\s/g, ''),
        cardNumber: form.cardNumber.trim() || undefined,
      });
      Alert.alert(t('common.success'), t('bankDetails.saved'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch {
      Alert.alert(t('common.error'), t('errors.serverError'));
    } finally {
      setIsSaving(false);
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
            <Text style={styles.emoji}>🏦</Text>
            <Text style={styles.title}>{t('bankDetails.title')}</Text>
            <Text style={styles.subtitle}>Данные для получения выплат</Text>
          </View>

          <Input
            label={t('bankDetails.bankName')}
            value={form.bankName}
            onChangeText={(v) => setField('bankName', v)}
            placeholder="Uzcard, Payme, Click..."
            error={errors.bankName}
          />
          <Input
            label={t('bankDetails.accountNumber')}
            value={form.accountNumber}
            onChangeText={(v) => setField('accountNumber', v)}
            keyboardType="numeric"
            placeholder="0000 0000 0000 0000"
            error={errors.accountNumber}
          />
          <Input
            label={t('bankDetails.cardNumber')}
            value={form.cardNumber}
            onChangeText={(v) => setField('cardNumber', v)}
            keyboardType="numeric"
            placeholder="8600 0000 0000 0000"
            error={errors.cardNumber}
          />

          <Button
            title={t('common.save')}
            onPress={handleSave}
            isLoading={isSaving}
            fullWidth
            size="lg"
            style={styles.button}
          />

          <Button
            title="Пропустить"
            onPress={() => navigation.navigate('Main' as never)}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.skipButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  container: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl, paddingTop: SPACING.md },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.gray[600], textAlign: 'center' },
  button: { marginTop: SPACING.xl },
  skipButton: { marginTop: SPACING.sm },
});

export default BankDetailsScreen;
