import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/useAuthStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/main/SplashScreen';
import type { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setIsReady(true));
  }, [restoreSession]);

  if (!isReady || isLoading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
