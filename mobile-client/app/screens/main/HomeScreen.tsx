import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';

import { MapComponent } from '../../components/MapComponent';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TopBar } from '../../components/TopBar';
import { BottomOrderPanel } from '../../components/BottomOrderPanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useTaxiStore } from '../../store/taxiStore';
import { fetchAvailableDriversThunk } from '../../store/slices/drivers.slice';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList } from '../../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const { setLocation, setTariff, setRoute, userLocation } = useTaxiStore();

  const { availableDrivers, isLoading: driversLoading } = useAppSelector((s) => s.drivers);
  const bonusBalance = useAppSelector((s) => s.auth.user?.bonusBalance ?? 0);

  const fetchDrivers = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Use Angren city center as fallback
      const fallbackLocation = { latitude: 41.0198, longitude: 70.1439 };
      setLocation(fallbackLocation);
      dispatch(fetchAvailableDriversThunk({ location: fallbackLocation }));
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setLocation(location);
    dispatch(
      fetchAvailableDriversThunk({
        location,
      }),
    );
  }, [dispatch, setLocation]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleMenuPress = () => {
    (navigation as NavigationProp<MainStackParamList> & { openDrawer?: () => void }).openDrawer?.();
  };

  const handleRidePress = (destination: string, tariff: string) => {
    setRoute('Текущее местоположение', destination);
    setTariff(tariff as 'standard' | 'comfort' | 'delivery');
    navigation.navigate('TripDetails');
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapComponent
          mode="search"
          userLocation={userLocation ?? undefined}
          driversLocations={availableDrivers.map((driver) => ({
            ...driver.location,
            id: driver.id,
          }))}
        />
        {driversLoading && <LoadingSpinner fullscreen />}
      </View>

      {/* Top Bar */}
      <TopBar
        onMenuPress={handleMenuPress}
        balance={bonusBalance}
      />

      {/* Bottom Order Panel */}
      <BottomOrderPanel onRidePress={handleRidePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  mapContainer: { 
    flex: 1, 
    minHeight: 280 
  },
});
