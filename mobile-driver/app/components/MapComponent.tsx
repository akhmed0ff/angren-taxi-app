import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { Coordinates } from '../types';
import { COLORS, FONTS } from '../utils/constants';

interface MapComponentProps {
  driverLocation?: Coordinates;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  routeCoordinates?: Coordinates[];
  style?: object;
}

/** Проверяет, что координата валидна (не NaN, не Infinity, в допустимых диапазонах) */
function isValidCoord(c: Coordinates): boolean {
  return (
    typeof c.latitude === 'number' &&
    typeof c.longitude === 'number' &&
    isFinite(c.latitude) &&
    isFinite(c.longitude) &&
    c.latitude >= -90 &&
    c.latitude <= 90 &&
    c.longitude >= -180 &&
    c.longitude <= 180
  );
}

const MapComponent: React.FC<MapComponentProps> = ({
  driverLocation,
  pickupLocation,
  destinationLocation,
  routeCoordinates = [],
  style,
}) => {
  const { t } = useTranslation();

  const initialRegion = driverLocation
    ? {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        // Default: Angren, Uzbekistan
        latitude: 41.017,
        longitude: 70.146,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  // Фильтруем невалидные координаты перед рендером Polyline
  const validRouteCoordinates = routeCoordinates.filter(isValidCoord);

  return (
    <MapView
      style={[styles.map, style]}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
    >
      {driverLocation ? (
        <Marker coordinate={driverLocation} title={t('map.yourLocation')} pinColor={COLORS.primary} />
      ) : null}

      {pickupLocation ? (
        <Marker coordinate={pickupLocation} title={t('map.pickup')} pinColor={COLORS.success} />
      ) : null}

      {destinationLocation ? (
        <Marker coordinate={destinationLocation} title={t('map.destination')} pinColor={COLORS.danger} />
      ) : null}

      {/* Рендерим Polyline только если есть минимум 2 валидные точки */}
      {validRouteCoordinates.length >= 2 ? (
        <Polyline
          coordinates={validRouteCoordinates}
          strokeColor={COLORS.info}
          strokeWidth={4}
        />
      ) : null}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.gray[600],
    fontSize: FONTS.sizes.md,
    marginTop: 20,
  },
});

export default MapComponent;