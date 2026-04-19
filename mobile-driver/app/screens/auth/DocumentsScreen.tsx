import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/auth.service';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import Button from '../../components/Button';

type Nav = StackNavigationProp<AuthStackParamList, 'Documents'>;

type DocState = {
  driversLicense: string | null;
  vehicleRegistration: string | null;
  insurance: string | null;
};

const DOCUMENTS = [
  { key: 'driversLicense' as const, label: 'documents.driversLicense', emoji: '🪪' },
  { key: 'vehicleRegistration' as const, label: 'documents.vehicleRegistration', emoji: '📋' },
  { key: 'insurance' as const, label: 'documents.insurance', emoji: '🛡️' },
];

const DocumentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [docs, setDocs] = useState<DocState>({
    driversLicense: null,
    vehicleRegistration: null,
    insurance: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async (key: keyof DocState) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setDocs((prev) => ({ ...prev, [key]: result.assets[0].uri }));
    }
  };

  const handleUpload = async () => {
    if (!docs.driversLicense || !docs.vehicleRegistration || !docs.insurance) {
      Alert.alert(t('common.error'), 'Загрузите все документы');
      return;
    }
    setIsUploading(true);
    try {
      await authService.uploadDocuments(
        docs.driversLicense,
        docs.vehicleRegistration,
        docs.insurance,
      );
      Alert.alert(t('common.success'), t('documents.uploadSuccess'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('BankDetails') },
      ]);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.serverError'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('documents.upload')}</Text>
          <Text style={styles.subtitle}>{t('documents.verificationPending')}</Text>
        </View>

        {DOCUMENTS.map(({ key, label, emoji }) => (
          <TouchableOpacity
            key={key}
            style={styles.docCard}
            onPress={() => pickImage(key)}
            activeOpacity={0.7}
          >
            {docs[key] ? (
              <Image source={{ uri: docs[key]! }} style={styles.docImage} />
            ) : (
              <View style={styles.docPlaceholder}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.docLabel}>{t(label)}</Text>
                <Text style={styles.tapText}>{t('documents.tapToUpload')}</Text>
              </View>
            )}
            {docs[key] ? (
              <View style={styles.docOverlay}>
                <Text style={styles.docName}>{t(label)}</Text>
                <Text style={styles.changeText}>Нажмите для замены ✓</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}

        <Button
          title={t('documents.upload')}
          onPress={handleUpload}
          isLoading={isUploading}
          fullWidth
          size="lg"
          style={styles.button}
          disabled={!docs.driversLicense || !docs.vehicleRegistration || !docs.insurance}
        />

        <TouchableOpacity onPress={() => navigation.navigate('BankDetails')} style={styles.skip}>
          <Text style={styles.skipText}>Пропустить →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl, paddingTop: SPACING.md },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.gray[600], textAlign: 'center' },
  docCard: {
    height: 160,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  docImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  docPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  emoji: { fontSize: 40 },
  docLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  tapText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500] },
  docOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.sm,
  },
  docName: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  changeText: { color: COLORS.gray[300], fontSize: FONTS.sizes.xs },
  button: { marginTop: SPACING.md },
  skip: { alignItems: 'center', marginTop: SPACING.md },
  skipText: { color: COLORS.gray[500], fontSize: FONTS.sizes.md },
});

export default DocumentsScreen;
