import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import useAuthStore from '@/stores/authStore';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '@/screens/auth/SplashScreen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const theme = useAppTheme();

  const navigationTheme = {
    ...(theme.background === '#09090B' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.background === '#09090B' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: 'fade',
    contentStyle: { backgroundColor: theme.background },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Root.Navigator screenOptions={screenOptions}>
        {isLoading ? (
          // Session is being restored — show splash
          <Root.Screen name="Splash" component={SplashScreen} />
        ) : isAuthenticated ? (
          // User is logged in — show main app tabs
          <Root.Screen name="App" component={AppNavigator} />
        ) : (
          // Not authenticated — show auth stack
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
