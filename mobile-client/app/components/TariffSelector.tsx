import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { useTaxiStore, TariffType } from '../store/taxiStore';

interface Tariff {
  id: TariffType;
  name: string;
  price: number;
  icon: string;
  description: string;
}

interface TariffSelectorProps {
  onSelect?: (tariff: TariffType) => void;
  horizontal?: boolean;
}

const TARIFFS: Tariff[] = [
  { 
    id: 'standard', 
    name: 'Стандарт', 
    price: 2500, 
    icon: '🚖',
    description: 'Эконом класс'
  },
  { 
    id: 'comfort', 
    name: 'Комфорт', 
    price: 3500, 
    icon: '🚗',
    description: 'Премиум класс'
  },
  { 
    id: 'delivery', 
    name: 'Доставка', 
    price: 1500, 
    icon: '📦',
    description: 'Для груза'
  },
];

export const TariffSelector: React.FC<TariffSelectorProps> = ({
  onSelect,
  horizontal = true,
}) => {
  const { tariff, setTariff } = useTaxiStore();

  const handleSelectTariff = (selectedTariff: TariffType) => {
    setTariff(selectedTariff);
    onSelect?.(selectedTariff);
  };

  return horizontal ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.containerHorizontal}
      contentContainerStyle={styles.contentHorizontal}
    >
      {TARIFFS.map((item) => {
        const isSelected = tariff === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              isSelected ? styles.cardActive : styles.cardInactive,
            ]}
            onPress={() => handleSelectTariff(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.name, isSelected && styles.nameActive]}>
              {item.name}
            </Text>
            <Text style={[styles.description, isSelected && styles.descriptionActive]}>
              {item.description}
            </Text>
            <Text style={[styles.price, isSelected && styles.priceActive]}>
              от {item.price.toLocaleString('ru-RU')} sum
            </Text>
            {isSelected && <View style={styles.selectedBadge} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ) : (
    <View style={styles.containerVertical}>
      {TARIFFS.map((item) => {
        const isSelected = tariff === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              isSelected ? styles.cardActive : styles.cardInactive,
            ]}
            onPress={() => handleSelectTariff(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.name, isSelected && styles.nameActive]}>
              {item.name}
            </Text>
            <Text style={[styles.description, isSelected && styles.descriptionActive]}>
              {item.description}
            </Text>
            <Text style={[styles.price, isSelected && styles.priceActive]}>
              от {item.price.toLocaleString('ru-RU')} sum
            </Text>
            {isSelected && <View style={styles.selectedBadge} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  containerHorizontal: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  contentHorizontal: {
    gap: 12,
  },
  containerVertical: {
    gap: 12,
  },
  card: {
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    backgroundColor: '#F5C400',
  },
  cardInactive: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  nameActive: {
    color: '#000000',
  },
  description: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  descriptionActive: {
    color: '#333333',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    textAlign: 'center',
  },
  priceActive: {
    color: '#000000',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#F5C400',
  },
});
