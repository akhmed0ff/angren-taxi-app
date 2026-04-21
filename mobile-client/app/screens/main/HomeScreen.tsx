import React, { useEffect, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

import { MapComponent } from '../../components/MapComponent';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TopBar } from '../../components/TopBar';
import { BottomOrderPanel } from '../../components/BottomOrderPanel';
import { useTaxiStore } from '../../store/taxiStore';
import { useDriversStore } from '../../store/useDriversStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getAvailableDrivers } from '../../services/drivers.service';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList } from '../../types';

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Разрешение на геолокацию',
        message: 'Приложению нужен доступ к вашему местоположению',
        buttonPositive: 'Разрешить',
        buttonNegative: 'Отказать',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { setLocation, setTariff, setRoute, userLocation } = useTaxiStore();
  const { availableDrivers, isLoading: driversLoading, setDrivers, setLoading, setError } =
    useDriversStore();
  const bonusBalance = useAuthStore((s) => s.user?.bonusBalance ?? 0);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      // Use Angren city center as fallback
      const fallbackLocation = { latitude: 41.0198, longitude: 70.1439 };
      setLocation(fallbackLocation);
      try {
        const drivers = await getAvailableDrivers(fallbackLocation);
        setDrivers(drivers);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const loc = await new Promise<any>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });

    const location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setLocation(location);
    try {
      const drivers = await getAvailableDrivers(location);
      setDrivers(drivers);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setDrivers, setError, setLoading, setLocation]);

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
