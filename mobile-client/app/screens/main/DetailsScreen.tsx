import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTaxiStore } from '../../store/taxiStore';
import type { MainStackParamList } from '../../types';

type DetailsNavigationProp = StackNavigationProp<MainStackParamList, 'Details'>;

const TARIFF_META = {
  standard: {
    title: 'Стандарт',
    subtitle: 'Быстрая поездка по городу',
    price: 'от 12 000 сум',
    icon: '🚕',
  },
  comfort: {
    title: 'Комфорт',
    subtitle: 'Больше места и удобства',
    price: 'от 18 000 сум',
    icon: '🚘',
  },
  delivery: {
    title: 'Доставка',
    subtitle: 'Для посылок и небольших грузов',
    price: 'от 15 000 сум',
    icon: '📦',
  },
} as const;

export const DetailsScreen: React.FC = () => {
  const navigation = useNavigation<DetailsNavigationProp>();
  const {
    tariff,
    baggage,
    airConditioner,
    setOrderStatus,
    setBaggage,
    setAirConditioner,
  } = useTaxiStore();

  const tariffMeta = TARIFF_META[tariff];

  const handleGoPress = () => {
    setOrderStatus('searching');
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Детали поездки</Text>

        <View style={styles.tariffCard}>
          <View style={styles.tariffIconWrap}>
            <Text style={styles.tariffIcon}>{tariffMeta.icon}</Text>
          </View>

          <View style={styles.tariffInfo}>
            <Text style={styles.tariffTitle}>{tariffMeta.title}</Text>
            <Text style={styles.tariffSubtitle}>{tariffMeta.subtitle}</Text>
          </View>

          <Text style={styles.tariffPrice}>{tariffMeta.price}</Text>
        </View>

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Опции</Text>

          <View style={styles.optionRow}>
            <View style={styles.optionTextBlock}>
              <Text style={styles.optionTitle}>Багаж</Text>
              <Text style={styles.optionSubtitle}>Добавить место для вещей</Text>
            </View>
            <Switch
              value={baggage}
              onValueChange={setBaggage}
              trackColor={{ false: '#E5E5E5', true: '#F5C400' }}
              thumbColor={baggage ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionTextBlock}>
              <Text style={styles.optionTitle}>Кондиционер</Text>
              <Text style={styles.optionSubtitle}>Комфортная поездка в жару</Text>
            </View>
            <Switch
              value={airConditioner}
              onValueChange={setAirConditioner}
              trackColor={{ false: '#E5E5E5', true: '#F5C400' }}
              thumbColor={airConditioner ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.goButton}
          onPress={handleGoPress}
          activeOpacity={0.85}
        >
          <Text style={styles.goButtonText}>Поехали</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 18,
  },
  tariffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tariffIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF6CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tariffIcon: {
    fontSize: 28,
  },
  tariffInfo: {
    flex: 1,
  },
  tariffTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  tariffSubtitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  tariffPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  optionsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionTextBlock: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  goButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  goButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});