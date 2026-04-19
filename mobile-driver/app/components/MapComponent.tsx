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

      {routeCoordinates.length > 1 ? (
        <Polyline
          coordinates={routeCoordinates}
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
