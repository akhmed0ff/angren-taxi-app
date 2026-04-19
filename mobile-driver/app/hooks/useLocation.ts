import { useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentLocation } from '../store/slices/driver.slice';
import { driverService } from '../services/driver.service';
import { socketService } from '../services/socket.service';
import { LOCATION_TASK_NAME, LOCATION_UPDATE_INTERVAL } from '../utils/constants';
import { DriverLocation } from '../types';

// Register background location task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error('[Location Task]', error);
    return;
  }
  const locations = (data as { locations: Location.LocationObject[] }).locations;
  if (locations?.length) {
    const { latitude, longitude } = locations[0].coords;
    const loc: DriverLocation = {
      latitude,
      longitude,
      heading: locations[0].coords.heading ?? undefined,
      speed: locations[0].coords.speed ?? undefined,
      timestamp: locations[0].timestamp,
    };
    // Note: cannot dispatch from here — send via socket
    socketService.send('location_updated', loc);
  }
});

export const useLocation = () => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.driver.isOnline);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return false;

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    return bgStatus === 'granted';
  }, []);

  const startTracking = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    // Start background location task
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(
      () => false,
    );
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 20,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'АНГРЕН ТАКСИ',
          notificationBody: 'Отслеживание геолокации активно',
          notificationColor: '#1a1a2e',
        },
      });
    }

    // Foreground interval update
    intervalRef.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const loc: DriverLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading ?? undefined,
          speed: location.coords.speed ?? undefined,
          timestamp: location.timestamp,
        };
        dispatch(setCurrentLocation(loc));
        await driverService.updateLocation(loc);
      } catch (err) {
        console.warn('[Location] Failed to get location:', err);
      }
    }, LOCATION_UPDATE_INTERVAL);
  }, [dispatch, requestPermissions]);

  const stopTracking = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(
      () => false,
    );
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
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
