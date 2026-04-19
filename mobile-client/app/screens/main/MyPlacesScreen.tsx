import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList } from '../../types';

type MyPlacesNavProp = StackNavigationProp<MainStackParamList>;

interface SavedPlace {
  id: string;
  icon: string;
  name: string;
  address: string;
}

const INITIAL_PLACES: SavedPlace[] = [
  { id: '1', icon: '🏠', name: 'Дом', address: '' },
  { id: '2', icon: '💼', name: 'Работа', address: '' },
];

export const MyPlacesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MyPlacesNavProp>();
  const [places, setPlaces] = useState<SavedPlace[]>(INITIAL_PLACES);

  const handleEdit = (place: SavedPlace) => {
    Alert.alert(place.name, t('myPlaces.editHint', { defaultValue: 'Редактирование мест появится в следующей версии.' }));
  };

  const handleAdd = () => {
    Alert.alert(t('myPlaces.addPlace', { defaultValue: 'Добавить место' }), t('myPlaces.addHint', { defaultValue: 'Функция добавления мест появится в следующей версии.' }));
  };

  return (
    <View style={styles.container}>
      <Header title={t('myPlaces.title', { defaultValue: 'Мои места' })} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {places.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>{t('myPlaces.empty', { defaultValue: 'У вас нет сохранённых мест' })}</Text>
          </View>
        ) : (
          places.map((place) => (
            <View key={place.id} style={styles.card}>
              <Text style={styles.placeIcon}>{place.icon}</Text>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeAddress}>
                  {place.address || t('myPlaces.noAddress', { defaultValue: 'Адрес не указан' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(place)}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={t('myPlaces.addPlace', { defaultValue: 'Добавить место' })}
          onPress={handleAdd}
          style={styles.addBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 24 },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  placeIcon: { fontSize: 24 },
  placeInfo: { flex: 1 },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  editBtn: {
    padding: 8,
  },
  editBtnText: { fontSize: 18 },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addBtn: {},
});
