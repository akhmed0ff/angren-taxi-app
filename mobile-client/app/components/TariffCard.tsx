import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TariffCardProps {
  name: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

export const TariffCard: React.FC<TariffCardProps> = ({ name, icon, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.name, isSelected && styles.nameSelected]}>{name}</Text>
      {isSelected && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selected: {
    borderColor: '#F5C400',
    backgroundColor: '#FFFBF0',
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  nameSelected: {
    color: '#000',
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5C400',
  },
});
