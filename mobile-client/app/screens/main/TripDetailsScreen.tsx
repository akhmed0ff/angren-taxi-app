import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTaxiStore } from '../../store/taxiStore';
import type { MainStackParamList } from '../../types';

interface TripOption {
  id: string;
  name: string;
  price: number;
}

const TRIP_OPTIONS: TripOption[] = [
  { id: 'passengers', name: '5 пассажиров', price: 0 },
  { id: 'trunk', name: 'Багаж в багажнике', price: 1500 },
  { id: 'cabin', name: 'Багаж в салоне', price: 1000 },
  { id: 'roofRack', name: 'Багажник на крыше', price: 2000 },
  { id: 'ac', name: 'Кондиционер', price: 500 },
  { id: 'mail', name: 'Почта', price: 800 },
];

export const TripDetailsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { tariff, setOrderStatus, from, to } = useTaxiStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['passengers']);
  const basPrice = 3300;

  const calculateTotal = (): number => {
    return (
      basPrice +
      selectedOptions.reduce((sum, optionId) => {
        const option = TRIP_OPTIONS.find((opt) => opt.id === optionId);
        return sum + (option?.price || 0);
      }, 0)
    );
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const total = calculateTotal();

  const handleGoPress = () => {
    setOrderStatus('searching');
    console.log('Order created:', {
      from,
      to,
      tariff,
      options: selectedOptions,
      total,
    });
    // Navigate to tracking or next screen
    // navigation.navigate('OrderTracking');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Car Card */}
        <View style={styles.carCard}>
          <Text style={styles.carIcon}>🚗</Text>
          <View style={styles.carInfo}>
            <Text style={styles.carModel}>Chevrolet Nexia</Text>
            <Text style={styles.carNumber}>02A123AA</Text>
          </View>
          <View style={styles.driverRating}>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.driverName}>Алексей</Text>
          </View>
        </View>

        {/* Price and Time Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Цена</Text>
            <Text style={styles.infoValue}>От {basPrice.toLocaleString('ru-RU')} сум</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Время прибытия</Text>
            <Text style={styles.infoValue}>1 мин</Text>
          </View>
        </View>

        {/* Options Section */}
        <View style={styles.optionsSection}>
          <Text style={styles.optionsTitle}>Опции</Text>

          {TRIP_OPTIONS.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <View key={option.id} style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  {option.price > 0 && (
                    <Text style={styles.optionPrice}>
                      +{option.price.toLocaleString('ru-RU')} сум
                    </Text>
                  )}
                </View>

                <Switch
                  value={isSelected}
                  onValueChange={() => toggleOption(option.id)}
                  trackColor={{ false: '#EFEFEF', true: '#F5C400' }}
                  thumbColor={isSelected ? '#FFD700' : '#FFFFFF'}
                  style={styles.toggle}
                />
              </View>
            );
          })}
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalPrice}>
            {total.toLocaleString('ru-RU')} сум
          </Text>
        </View>
      </ScrollView>

      {/* Ride Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rideButton} onPress={handleGoPress} activeOpacity={0.85}>
          <Text style={styles.rideButtonText}>Поехали</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  carIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  carInfo: {
    flex: 1,
  },
  carModel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  carNumber: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  driverRating: {
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 14,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#EFEFEF',
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 12,
    color: '#F5C400',
    fontWeight: '600',
  },
  toggle: {
    marginLeft: 12,
  },
  totalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  rideButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  rideButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
