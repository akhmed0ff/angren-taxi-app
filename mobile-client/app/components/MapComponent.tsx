import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import type { Location } from '../types';
import { COLORS } from '../utils/constants';

interface MapComponentProps {
  mode: 'search' | 'assigned';
  userLocation?: Location;
  driverLocation?: Location;
  driversLocations?: Location[];
  destination?: Location;
  route?: Location[];
}

const ANGREN_REGION = {
  latitude: 41.0198,
  longitude: 70.1439,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const hasValidCoordinates = (
  location?: Partial<Location>,
): location is Location => (
  typeof location?.latitude === 'number'
  && Number.isFinite(location.latitude)
  && typeof location?.longitude === 'number'
  && Number.isFinite(location.longitude)
);

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

const getFilteredAndSortedDrivers = (
  drivers: Location[] | undefined,
  userLocation: Location | undefined,
): Location[] => {
  if (!drivers?.length) return [];

  let filtered = drivers.filter(hasValidCoordinates);

  if (userLocation && hasValidCoordinates(userLocation)) {
    filtered.sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.latitude,
        a.longitude,
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.latitude,
        b.longitude,
      );
      return distA - distB;
    });
  }

  return filtered.slice(0, 30);
};

const MapComponentBase: React.FC<MapComponentProps> = ({
  mode,
  userLocation,
  driverLocation,
  driversLocations,
  destination,
  route,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const prevModeRef = useRef(mode);
  const hadDestinationRef = useRef(Boolean(destination));
  const latestLocationsRef = useRef({ userLocation, driverLocation, driversLocations });
  const lastDriverUpdateRef = useRef(0);
  const lastFitUpdateRef = useRef(0);
  const hadInitialDataRef = useRef(Boolean(userLocation || driversLocations?.length));
  const previousDriversLocationsRef = useRef<Map<string, Location>>(new Map());

  useEffect(() => {
    latestLocationsRef.current = { userLocation, driverLocation, driversLocations };
  }, [userLocation, driverLocation, driversLocations]);

  useEffect(() => {
    const modeChanged = prevModeRef.current !== mode;
    const destinationAppeared = !hadDestinationRef.current && Boolean(destination);

    prevModeRef.current = mode;
    hadDestinationRef.current = Boolean(destination);

    if (mode === 'assigned') {
      previousDriversLocationsRef.current.clear();
    }

    if (!modeChanged && !destinationAppeared) return;

    const {
      userLocation: latestUserLocation,
      driverLocation: latestDriverLocation,
      driversLocations: latestDriversLocations,
    } = latestLocationsRef.current;

    const coords: { latitude: number; longitude: number }[] = [];
    if (latestUserLocation) coords.push(latestUserLocation);
    if (mode === 'assigned' && latestDriverLocation) coords.push(latestDriverLocation);
    if (mode === 'search' && latestDriversLocations?.length) {
      coords.push(...latestDriversLocations);
    }
    if (destination) coords.push(destination);

    if (coords.length < 2) return;

    const now = Date.now();
    const timeSinceLastFitUpdate = now - lastFitUpdateRef.current;

    if (timeSinceLastFitUpdate < 500) return;

    lastFitUpdateRef.current = now;
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [mode, destination]);

  useEffect(() => {
    if (mode !== 'search' || !userLocation || !mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [mode, userLocation]);

  useEffect(() => {
    if (mode !== 'assigned' || !hasValidCoordinates(driverLocation) || !mapRef.current) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastDriverUpdateRef.current;

    if (timeSinceLastUpdate < 2000) return;

    lastDriverUpdateRef.current = now;
    mapRef.current.animateToRegion({
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [mode, driverLocation]);

  useEffect(() => {
    const hasData = Boolean(userLocation || driversLocations?.length);
    const hadDataBefore = hadInitialDataRef.current;
    const dataJustAppeared = !hadDataBefore && hasData;

    hadInitialDataRef.current = hasData;

    if (dataJustAppeared && mapRef.current) {
      if (userLocation && hasValidCoordinates(userLocation)) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  }, [userLocation, driversLocations]);

  const renderDrivers = () => {
    const prevLocations = previousDriversLocationsRef.current;
    const allDrivers = getFilteredAndSortedDrivers(driversLocations, userLocation);
    const DISTANCE_THRESHOLD = 0.0001; // approximately 10 meters in degrees

    const filteredDrivers = allDrivers.filter((driver) => {
      const driverId = (driver as Location & { id?: string }).id;
      const key = driverId ?? `${driver.latitude}_${driver.longitude}`;
      const prevLocation = prevLocations.get(key);

      if (!prevLocation) {
        prevLocations.set(key, driver);
        return true;
      }

      const distance = calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        driver.latitude,
        driver.longitude,
      );

      if (distance >= DISTANCE_THRESHOLD) {
        prevLocations.set(key, driver);
        return true;
      }

      return false;
    });

    return (
      <>
        {mode === 'assigned' && hasValidCoordinates(driverLocation) ? (
          <Marker
            coordinate={driverLocation}
            title={t('map.driver')}
            pinColor={COLORS.secondary}
            tracksViewChanges={false}
          />
        ) : null}

        {mode === 'search' && filteredDrivers.map((driver) => {
          const driverId = (driver as Location & { id?: string }).id;

          return (
            <Marker
              key={driverId ?? `${driver.latitude}_${driver.longitude}`}
              coordinate={driver}
              title={t('map.driver')}
              pinColor={COLORS.secondary}
              tracksViewChanges={false}
            />
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : ANGREN_REGION
        }
        showsUserLocation
        showsMyLocationButton={false}
      >
        {renderDrivers()}

        {hasValidCoordinates(destination) ? (
          <Marker
            coordinate={destination}
            title={t('map.destination')}
            pinColor={COLORS.danger}
            tracksViewChanges={false}
          />
        ) : null}

        {(() => {
          const validRoute = route?.filter(hasValidCoordinates);
          return validRoute && validRoute.length >= 2 ? (
            <Polyline
              coordinates={validRoute}
              strokeColor={COLORS.primary}
              strokeWidth={4}
            />
          ) : null;
        })()}
      </MapView>
    </View>
  );
};

export const MapComponent = React.memo(MapComponentBase);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
});
