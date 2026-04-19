import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from '../screens/main/HomeScreen';
import { OrderHistoryScreen } from '../screens/main/OrderHistoryScreen';
import { BonusesScreen } from '../screens/main/BonusesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { OrderCreateScreen } from '../screens/main/OrderCreateScreen';
import { OrderTrackingScreen } from '../screens/main/OrderTrackingScreen';
import { PaymentScreen } from '../screens/main/PaymentScreen';
import { MyPlacesScreen } from '../screens/main/MyPlacesScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

import { COLORS } from '../utils/constants';
import type { MainTabParamList, MainStackParamList } from '../types';

// ─── Bottom tab navigator ─────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  OrderHistory: '📋',
  Bonuses: '⭐',
  Profile: '👤',
};

const TAB_LABEL_KEYS: Record<keyof MainTabParamList, string> = {
  Home: 'navigation.home',
  OrderHistory: 'navigation.orders',
  Bonuses: 'navigation.bonuses',
  Profile: 'navigation.profile',
};

function TabNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: t(TAB_LABEL_KEYS[route.name]),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.surface,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Tab.Screen name="Bonuses" component={BonusesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Main stack navigator (wraps tabs + modal screens) ───────────────────────

const Stack = createStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="OrderCreate" component={OrderCreateScreen} />
    <Stack.Screen
      name="OrderTracking"
      component={OrderTrackingScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="MyPlaces" component={MyPlacesScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);
