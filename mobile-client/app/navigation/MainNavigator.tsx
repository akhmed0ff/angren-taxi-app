import React from 'react';
import { Text } from 'react-native';
import { createDrawerNavigator, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { MainScreen } from '../screens/main/MainScreen';
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
import { DetailsScreen } from '../screens/main/DetailsScreen';
import { TripDetailsScreen } from '../screens/main/TripDetailsScreen';
import { UserMenuScreen } from '../screens/main/UserMenuScreen';
import { DrawerContent } from './DrawerContent';

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

function MainStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="OrderCreate" component={OrderCreateScreen} />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="UserMenu" component={UserMenuScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="MyPlaces" component={MyPlacesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ─── Drawer navigator (side menu) ─────────────────────────────────────────────

type DrawerParamList = {
  MainStack: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export const MainNavigator: React.FC = () => (
  <Drawer.Navigator
    useLegacyImplementation={false}
    drawerContent={(props: DrawerContentComponentProps) => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: 'front',
      drawerPosition: 'left',
      overlayColor: 'rgba(0, 0, 0, 0.32)',
      drawerStyle: {
        width: '75%',
      },
    }}
  >
    <Drawer.Screen name="MainStack" component={MainStackNavigator} />
  </Drawer.Navigator>
);
