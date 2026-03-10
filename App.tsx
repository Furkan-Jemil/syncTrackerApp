import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import AppProviders from '@/providers/AppProviders';
import RootNavigator from '@/navigation/RootNavigator';
import NotificationBanner from '@/components/common/NotificationBanner';
import { initSentry } from '@/lib/sentry';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Sentry before first render
initSentry();

function RootApp() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <StatusBar style="light" />
      <NotificationBanner />
      <RootNavigator />
    </AppProviders>
  );
}

export default Sentry.wrap(RootApp);
