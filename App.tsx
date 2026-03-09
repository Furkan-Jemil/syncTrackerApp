import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import AppProviders from '@/providers/AppProviders';
import useAuthStore from '@/stores/authStore';
import { initSentry } from '@/lib/sentry';
import HomeScreen from '@/screens/tasks/HomeScreen';

// Initialize Sentry at app entry before anything renders
initSentry();

function RootApp() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <AppProviders>
      <StatusBar style="light" />
      {/* Navigation shell wired in Phase 2 */}
      <HomeScreen />
    </AppProviders>
  );
}

// Wrap with Sentry error boundary at the outermost level
export default Sentry.wrap(RootApp);
