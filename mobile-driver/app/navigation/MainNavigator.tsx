import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MainTabParamList, MainStackParamList } from '../types';
import { COLORS } from '../utils/constants';

import DashboardScreen from '../screens/main/DashboardScreen';
import AvailableOrdersScreen from '../screens/main/AvailableOrdersScreen';
import ActiveOrderScreen from '../screens/main/ActiveOrderScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EarningsScreen from '../screens/main/EarningsScreen';
import RatingsScreen from '../screens/main/RatingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const TabNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('dashboard.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={AvailableOrdersScreen}
        options={{
          tabBarLabel: t('orders.available'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarLabel: t('earnings.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen} />
      <Stack.Screen name="ActiveOrder" component={ActiveOrderScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Ratings" component={RatingsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
