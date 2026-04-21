import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import { useTaxiStore } from '../store/taxiStore';

interface RouteInputProps {
  onRoutesUpdate?: (from: string, to: string) => void;
}

export const RouteSelector: React.FC<RouteInputProps> = ({ onRoutesUpdate }) => {
  const { from, to, setRoute } = useTaxiStore();
  const [fromInput, setFromInput] = useState(from);
  const [toInput, setToInput] = useState(to);

  // Sync with Zustand when inputs change
  const handleFromChange = (text: string) => {
    setFromInput(text);
    setRoute(text, toInput);
    onRoutesUpdate?.(text, toInput);
  };

  const handleToChange = (text: string) => {
    setToInput(text);
    setRoute(fromInput, text);
    onRoutesUpdate?.(fromInput, text);
  };

  // Sync external Zustand changes to local state
  useEffect(() => {
    setFromInput(from);
  }, [from]);

  useEffect(() => {
    setToInput(to);
  }, [to]);

  const handleSwapRoutes = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    setRoute(toInput, temp);
    onRoutesUpdate?.(toInput, temp);
  };

  const handleClearFrom = () => {
    setFromInput('');
    setRoute('', toInput);
    onRoutesUpdate?.('', toInput);
  };

  const handleClearTo = () => {
    setToInput('');
    setRoute(fromInput, '');
    onRoutesUpdate?.(fromInput, '');
  };

  return (
    <View style={styles.container}>
      {/* From Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Text style={styles.icon}>📍</Text>
          <TextInput
            style={styles.input}
            placeholder="Откуда?"
            placeholderTextColor="#CCCCCC"
            value={fromInput}
            onChangeText={handleFromChange}
            clearButtonMode="while-editing"
          />
          {fromInput && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFrom}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Swap Button */}
      <TouchableOpacity
        style={styles.swapButton}
        onPress={handleSwapRoutes}
        activeOpacity={0.7}
      >
        <Text style={styles.swapIcon}>⇅</Text>
      </TouchableOpacity>

      {/* To Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Text style={styles.icon}>🎯</Text>
          <TextInput
            style={styles.input}
            placeholder="Куда?"
            placeholderTextColor="#CCCCCC"
            value={toInput}
            onChangeText={handleToChange}
            clearButtonMode="while-editing"
          />
          {toInput && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearTo}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    paddingVertical: 12,
    paddingRight: 8,
  },
  clearButton: {
    padding: 8,
    marginLeft: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  swapButton: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5C400',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  swapIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});
