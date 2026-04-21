import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/main/SplashScreen';
import type { RootStackParamList } from '../types';

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Splash" component={SplashScreen} />
    <RootStack.Screen name="Main" component={MainNavigator} />
  </RootStack.Navigator>
);
