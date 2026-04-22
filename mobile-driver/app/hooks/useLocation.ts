import { useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundFetch from 'react-native-background-fetch';
import { useDriverStore } from '../store/useDriverStore';
import { useAuthStore } from '../store/useAuthStore';
import { useOrdersStore } from '../store/useOrdersStore';
import { driverService } from '../services/driver.service';
import { socketService } from '../services/socket.service';
import { LOCATION_UPDATE_INTERVAL } from '../utils/constants';
import { DriverLocation } from '../types';

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

function getCurrentPosition(): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
}

export const useLocation = () => {
  const isOnline = useDriverStore((state) => state.isOnline);
  const setCurrentLocation = useDriverStore((state) => state.setCurrentLocation);
  const driverId = useAuthStore((state) => state.user?.id);
  const activeOrder = useOrdersStore((state) => state.activeOrder);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    return requestLocationPermission();
  }, []);

  const pushLocationUpdate = useCallback(async () => {
    const location = await getCurrentPosition();
    const loc: DriverLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading ?? undefined,
      speed: location.coords.speed ?? undefined,
      timestamp: location.timestamp,
    };

    setCurrentLocation(loc);
    if (driverId) {
      socketService.send('driver:location', {
        driverId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        rideId: activeOrder?.id ?? undefined,
      });
    }
    await driverService.updateLocation(loc);
  }, [activeOrder?.id, driverId, setCurrentLocation]);

  const startTracking = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      },
      async (taskId: string) => {
        try {
          await pushLocationUpdate();
        } catch (err) {
          console.warn('[Location] Background fetch failed:', err);
        } finally {
          BackgroundFetch.finish(taskId);
        }
      },
      (error) => {
        console.warn('[Location] Background fetch configure failed:', error);
      }
    );

    await BackgroundFetch.start();

    // Foreground interval update
    intervalRef.current = setInterval(async () => {
      try {
        await pushLocationUpdate();
      } catch (err) {
        console.warn('[Location] Failed to get location:', err);
      }
    }, LOCATION_UPDATE_INTERVAL);
  }, [pushLocationUpdate, requestPermissions]);

  const stopTracking = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await BackgroundFetch.stop();
  }, []);

  useEffect(() => {
    if (isOnline) {
      void startTracking();
    } else {
      void stopTracking();
    }
    return () => {
      void stopTracking();
    };
  }, [isOnline, startTracking, stopTracking]);

  return { requestPermissions, startTracking, stopTracking };
};
