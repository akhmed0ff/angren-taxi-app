import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { useTaxiStore } from '../../store/taxiStore';
import { useRideStore } from '../../store/useRideStore';
import type { MainStackParamList } from '../../types';

const ANGREN_COORDS = {
  latitude: 41.0198,
  longitude: 70.1439,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MainScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userLocation, setLocation, bonusBalance, orderStatus, setOrderStatus } = useTaxiStore();
  const { ride, driverLocation } = useRideStore();

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapRegion, setMapRegion] = useState(ANGREN_COORDS);
  const [animatedDriverCoordinate, setAnimatedDriverCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const driverMarkerRef = useRef<any>(null);
  const driverAnimationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Destination coords from active ride (convert lat/lng → latitude/longitude)
  const destination = ride?.to
    ? { latitude: ride.to.lat, longitude: ride.to.lng }
    : null;

  // Route polyline: user location → destination
  const routeCoords =
    userLocation && destination ? [userLocation, destination] : null;

  // Active ride status drives whether to show the driver marker
  const showDriverMarker =
    (orderStatus === 'driver_found' || orderStatus === 'on_the_way' || orderStatus === 'in_progress') &&
    driverLocation !== null;

  // Request location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (orderStatus !== 'searching') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setOrderStatus('driver_found');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [orderStatus, setOrderStatus]);

  useEffect(() => {
    if (!driverLocation) {
      setAnimatedDriverCoordinate(null);
      return;
    }

    const nextPoint = {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    };

    if (!animatedDriverCoordinate) {
      setAnimatedDriverCoordinate(nextPoint);
      return;
    }

    if (driverAnimationTimerRef.current) {
      clearInterval(driverAnimationTimerRef.current);
      driverAnimationTimerRef.current = null;
    }

    if (Platform.OS === 'android' && typeof driverMarkerRef.current?.animateMarkerToCoordinate === 'function') {
      driverMarkerRef.current.animateMarkerToCoordinate(nextPoint, 1200);
    }

    const startPoint = animatedDriverCoordinate;
    const steps = 12;
    let step = 0;

    driverAnimationTimerRef.current = setInterval(() => {
      step += 1;
      const progress = Math.min(step / steps, 1);

      setAnimatedDriverCoordinate({
        latitude: startPoint.latitude + (nextPoint.latitude - startPoint.latitude) * progress,
        longitude: startPoint.longitude + (nextPoint.longitude - startPoint.longitude) * progress,
      });

      if (progress >= 1) {
        if (driverAnimationTimerRef.current) {
          clearInterval(driverAnimationTimerRef.current);
          driverAnimationTimerRef.current = null;
        }
      }
    }, 100);
  }, [driverLocation, animatedDriverCoordinate]);

  useEffect(() => {
    return () => {
      if (driverAnimationTimerRef.current) {
        clearInterval(driverAnimationTimerRef.current);
        driverAnimationTimerRef.current = null;
      }
    };
  }, []);

  const requestUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        // Use fallback location (Angren center)
        setLocation(ANGREN_COORDS);
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLocation(userCoords);
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error getting location:', error);
      // Use fallback location
      setLocation({
        latitude: ANGREN_COORDS.latitude,
        longitude: ANGREN_COORDS.longitude,
      });
      setIsLoadingLocation(false);
    }
  };

  const handleMenuPress = () => {
    // Open drawer menu
    navigation.openDrawer?.();
  };

  const handleLocateMe = async () => {
    setIsLoadingLocation(true);
    await requestUserLocation();
  };

  const handleRidePress = () => {
    navigation.navigate('Details');
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Вы находитесь здесь"
            description="Ваше текущее местоположение"
            tracksViewChanges={false}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot} />
              <View style={styles.markerPulse} />
            </View>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Пункт назначения"
            pinColor="#E53935"
            tracksViewChanges={false}
          />
        )}

        {/* Route polyline: user location → destination */}
        {routeCoords && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#F5C400"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Driver marker — only shown when driver location arrives from socket */}
        {showDriverMarker && animatedDriverCoordinate && (
          <Marker
            ref={driverMarkerRef}
            coordinate={animatedDriverCoordinate}
            title="Водитель"
            description="Водитель едет к вам"
            tracksViewChanges={false}
          >
            <View style={styles.driverMarkerContainer}>
              <View style={styles.driverMarkerInner}>
                <Text style={styles.driverMarkerIcon}>🚕</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Top Bar - Menu & Balance */}
      <View style={styles.topBar}>
        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Баланс</Text>
          <Text style={styles.balanceAmount}>
            {bonusBalance.toFixed(0)} сум
          </Text>
        </View>
      </View>

      {/* Locate Me Button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={handleLocateMe}
        activeOpacity={0.8}
      >
        <Text style={styles.locateIcon}>📍</Text>
      </TouchableOpacity>

      {/* Bottom Overlay Panel (Empty for now) */}
      <View style={styles.bottomPanel}>
        <View style={styles.handleBar} />
        <Text style={styles.panelText}>Готовы к поездке</Text>
        <TouchableOpacity
          style={styles.rideButton}
          onPress={handleRidePress}
          activeOpacity={0.85}
        >
          <Text style={styles.rideButtonText}>Поехали</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {isLoadingLocation && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Определяю местоположение...</Text>
        </View>
      )}

      {orderStatus === 'searching' && (
        <View style={styles.searchOverlay}>
          <View style={styles.searchCard}>
            <ActivityIndicator
              size="large"
              color="#F5C400"
              style={styles.searchLoader}
            />
            <Text style={styles.searchTitle}>Ищем водителя...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  balanceCard: {
    backgroundColor: '#F5C400',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  locateButton: {
    position: 'absolute',
    bottom: 130,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  locateIcon: {
    fontSize: 20,
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5C400',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F5C400',
    opacity: 0.5,
  },
  driverMarkerContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  driverMarkerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5C400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarkerIcon: {
    fontSize: 18,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  panelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 18,
  },
  rideButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  rideButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  searchCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 12,
  },
  searchLoader: {
    marginBottom: 18,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
});
