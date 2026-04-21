import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TariffCard } from './TariffCard';

interface BottomOrderPanelProps {
  onRidePress: (destination: string, tariff: string) => void;
}

const TARIFFS = [
  { id: 'standard', name: 'Стандарт', icon: '🚖' },
  { id: 'comfort', name: 'Комфорт', icon: '🚗' },
  { id: 'delivery', name: 'Доставка', icon: '📦' },
];

export const BottomOrderPanel: React.FC<BottomOrderPanelProps> = ({ onRidePress }) => {
  const [destination, setDestination] = useState('');
  const [selectedTariff, setSelectedTariff] = useState('standard');

  const handleRidePress = () => {
    if (destination.trim()) {
      onRidePress(destination, selectedTariff);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with 1 min indicator */}
      <View style={styles.header}>
        <View style={styles.timeCircle}>
          <Text style={styles.timeText}>1 мин</Text>
        </View>
      </View>

      {/* Destination input */}
      <TextInput
        style={styles.input}
        placeholder="Куда едем?"
        placeholderTextColor="#999999"
        value={destination}
        onChangeText={setDestination}
      />

      {/* Tariff selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tariffsContainer}
        contentContainerStyle={styles.tariffsContent}
      >
        {TARIFFS.map((tariff) => (
          <TariffCard
            key={tariff.id}
            name={tariff.name}
            icon={tariff.icon}
            isSelected={selectedTariff === tariff.id}
            onPress={() => setSelectedTariff(tariff.id)}
          />
        ))}
      </ScrollView>

      {/* Ride button */}
      <TouchableOpacity
        style={[styles.rideBtn, !destination.trim() && styles.rideBtnDisabled]}
        onPress={handleRidePress}
        disabled={!destination.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.rideBtnText}>Поехали</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5C400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  tariffsContainer: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tariffsContent: {
    gap: 0,
  },
  rideBtn: {
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
  rideBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  rideBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
