import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TopBarProps {
  onMenuPress: () => void;
  balance: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuPress, balance }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>{balance.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#000',
  },
  balanceContainer: {
    backgroundColor: '#F5C400',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
