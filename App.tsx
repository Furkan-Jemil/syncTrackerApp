import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import AppProviders from '@/providers/AppProviders';
import RootNavigator from '@/navigation/RootNavigator';
import NotificationBanner from '@/components/common/NotificationBanner';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry before first render
initSentry();

function RootApp() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <NotificationBanner />
      <RootNavigator />
    </AppProviders>
  );
}

export default Sentry.wrap(RootApp);
