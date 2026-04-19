import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

import { MapComponent } from '../../components/MapComponent';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAvailableDriversThunk } from '../../store/slices/drivers.slice';
import { COLORS } from '../../utils/constants';
import type { MainStackParamList, Order } from '../../types';

type HomeNavProp = StackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavProp>();
  const dispatch = useAppDispatch();

  const { availableDrivers, isLoading: driversLoading } = useAppSelector((s) => s.drivers);
  const { currentOrder } = useAppSelector((s) => s.orders);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | undefined>();
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchDrivers = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Use Angren city center as fallback
      dispatch(fetchAvailableDriversThunk({ location: { latitude: 41.0198, longitude: 70.1439 } }));
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    dispatch(
      fetchAvailableDriversThunk({
        location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDrivers();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapComponent
          userLocation={userLocation}
          driverLocation={availableDrivers[0]?.location}
        />
        {driversLoading && <LoadingSpinner fullscreen />}
      </View>

      {/* Bottom sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.sectionTitle}>{t('home.title')}</Text>

        <TouchableOpacity
          style={styles.orderBtn}
          onPress={() => navigation.navigate('OrderCreate')}
          activeOpacity={0.85}
        >
          <Text style={styles.orderBtnText}>🚖 {t('home.orderTaxi')}</Text>
        </TouchableOpacity>

        <Text style={styles.driverCount}>
          {t('home.availableDrivers', { count: availableDrivers.length })}
        </Text>

        {currentOrder &&
          ['pending', 'accepted', 'arrived', 'inProgress'].includes(currentOrder.status) && (
            <View style={styles.currentOrderSection}>
              <Text style={styles.sectionLabel}>{t('home.currentOrder')}</Text>
              <OrderCard order={currentOrder} onPress={handleOrderPress} />
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { flex: 1, minHeight: 280 },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    maxHeight: 360,
  },
  sheetContent: { padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  orderBtnText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  driverCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  currentOrderSection: { marginTop: 8 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
});
