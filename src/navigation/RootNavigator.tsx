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

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  contentStyle: { backgroundColor: '#0f1117' },
};

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <NavigationContainer>
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
