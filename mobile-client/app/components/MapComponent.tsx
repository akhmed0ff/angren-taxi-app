import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import type { Location } from '../types';
import { COLORS } from '../utils/constants';

interface MapComponentProps {
  userLocation?: Location;
  driverLocation?: Location;
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

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  driverLocation,
  destination,
  mode = 'search',
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Анимируем карту только в режиме поиска,
    // чтобы не конфликтовать с fitToCoordinates в режиме assigned
    if (mode !== 'search') return;

    const coords: { latitude: number; longitude: number }[] = [];
    if (userLocation) coords.push(userLocation);
    if (driverLocation) coords.push(driverLocation);
    if (destination) coords.push(destination);

    if (coords.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } else if (coords.length === 1 && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400,
      );
    }
  }, [mode, userLocation, driverLocation, destination]);

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
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title={t('map.you')}
            pinColor={COLORS.primary}
          />
        ) : null}

        {driverLocation ? (
          <Marker
            coordinate={driverLocation}
            title={t('map.driver')}
            pinColor={COLORS.secondary}
          />
        ) : null}

        {destination ? (
          <Marker
            coordinate={destination}
            title={t('map.destination')}
            pinColor={COLORS.danger}
          />
        ) : null}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
});