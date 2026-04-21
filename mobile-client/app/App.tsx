import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from './navigation/RootNavigator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initI18n } from './i18n/i18n';

function AppContent(): React.JSX.Element {
  useEffect(() => {
    initI18n().catch((err) => {
      if (__DEV__) console.error('[i18n] Init failed', err);
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
