import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import type { Location } from '../types';
import { COLORS } from '../utils/constants';

interface MapComponentProps {
  mode?: 'search' | 'assigned';
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

const DRIVER_TRACK_THROTTLE_MS = 2000;
const MAX_DRIVER_MARKERS = 30;

const hasValidCoordinates = (location?: Partial<Location>): location is Location => (
  typeof location?.latitude === 'number'
  && Number.isFinite(location.latitude)
  && typeof location?.longitude === 'number'
  && Number.isFinite(location.longitude)
);

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

const MapComponentBase: React.FC<MapComponentProps> = ({
  mode = 'search',
  userLocation,
  driverLocation,
  driversLocations,
  destination,
  route,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const visibleDriverLocations = useMemo<Location[]>(() => {
    if (!driversLocations || driversLocations.length === 0) return [];
    const validDrivers = driversLocations.filter(hasValidCoordinates);
    const sorted = userLocation
      ? [...validDrivers].sort((a, b) => getDistance(userLocation, a) - getDistance(userLocation, b))
      : validDrivers;
    return sorted.slice(0, MAX_DRIVER_MARKERS);
  }, [driversLocations, userLocation]);

  useEffect(() => {
    if (mode !== 'assigned' || !driverLocation || !mapRef.current) return;
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < DRIVER_TRACK_THROTTLE_MS) return;
    lastUpdateTimeRef.current = now;

    mapRef.current.animateToRegion(
      {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
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
        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title={t('map.you')}
            pinColor={COLORS.primary}
            tracksViewChanges={false}
          />
        ) : null}

        {mode === 'assigned' && driverLocation ? (
          <Marker
            coordinate={driverLocation}
            title={t('map.driver')}
            pinColor={COLORS.secondary}
            tracksViewChanges={false}
          />
        ) : null}

        {mode === 'search'
          ? visibleDriverLocations.map((loc, index) => (
              <Marker
                key={`driver-${index}-${loc.latitude}-${loc.longitude}`}
                coordinate={loc}
                title={t('map.driver')}
                pinColor={COLORS.secondary}
                tracksViewChanges={false}
              />
            ))
          : null}

        {destination && hasValidCoordinates(destination) ? (
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
  container: { flex: 1, overflow: 'hidden', borderRadius: 12 },
});