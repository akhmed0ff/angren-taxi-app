import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import type { Location } from '../types';
import { COLORS } from '../utils/constants';

interface MapComponentProps {
  userLocation?: Location;
  driverLocation?: Location;
  driversLocations?: Location[];
  destination?: Location;
  route?: Location[];
  mode?: 'search' | 'assigned';
}

const ANGREN_REGION = {
  latitude: 41.0198,
  longitude: 70.1439,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DRIVER_TRACK_THROTTLE_MS = 2000;
const MAX_DRIVER_MARKERS = 30;
const FIT_DEBOUNCE_MS = 500;

/** Расстояние между двумя точками в метрах (формула Haversine) */
function getDistance(a: Location, b: Location): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  driverLocation,
  driversLocations,
  destination,
  mode = 'search',
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const fitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleDriverLocations = useMemo<Location[]>(() => {
    if (!driversLocations || driversLocations.length === 0) return [];
    const sorted = userLocation
      ? [...driversLocations].sort(
          (a, b) => getDistance(userLocation, a) - getDistance(userLocation, b),
        )
      : driversLocations;
    return sorted.slice(0, MAX_DRIVER_MARKERS);
  }, [driversLocations, userLocation]);

  useEffect(() => {
    if (mode !== 'search') return;

    const coords: Location[] = [];
    if (userLocation) coords.push(userLocation);
    if (driverLocation) coords.push(driverLocation);
    if (destination) coords.push(destination);

    if (fitDebounceRef.current) {
      clearTimeout(fitDebounceRef.current);
    }

    fitDebounceRef.current = setTimeout(() => {
      if (!mapRef.current) return;
      if (coords.length >= 2) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
      } else if (coords.length === 1) {
        mapRef.current.animateToRegion(
          { latitude: coords[0].latitude, longitude: coords[0].longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          400,
        );
      }
    }, FIT_DEBOUNCE_MS);

    return () => {
      if (fitDebounceRef.current) clearTimeout(fitDebounceRef.current);
    };
  }, [mode, userLocation, driverLocation, destination]);

  useEffect(() => {
    if (mode !== 'assigned' || !driverLocation || !mapRef.current) return;
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < DRIVER_TRACK_THROTTLE_MS) return;
    lastUpdateTimeRef.current = now;
    mapRef.current.animateToRegion(
      { latitude: driverLocation.latitude, longitude: driverLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
  }, [mode, driverLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          userLocation
            ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : ANGREN_REGION
        }
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title={t('map.you')}
            pinColor={COLORS.primary}
            tracksViewChanges={false}
          />
        ) : null}

        {visibleDriverLocations.map((loc, index) => (
          <Marker
            key={`driver-${index}-${loc.latitude}-${loc.longitude}`}
            coordinate={loc}
            title={t('map.driver')}
            pinColor={COLORS.secondary}
            tracksViewChanges={false}
          />
        ))}

        {driverLocation ? (
          <Marker
            coordinate={driverLocation}
            title={t('map.driver')}
            pinColor={COLORS.secondary}
            tracksViewChanges={false}
          />
        ) : null}

        {destination ? (
          <Marker
            coordinate={destination}
            title={t('map.destination')}
            pinColor={COLORS.danger}
            tracksViewChanges={false}
          />
        ) : null}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 12 },
});