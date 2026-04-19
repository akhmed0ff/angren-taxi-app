import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreSessionThunk } from '../store/slices/auth.slice';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/main/SplashScreen';

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSessionThunk());
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};
