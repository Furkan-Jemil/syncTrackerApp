import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import NotificationScreen from '@/screens/notifications/NotificationScreen';

export type DashboardStackParamList = {
  MainDashboard: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090B' } }}>
      <Stack.Screen name="MainDashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
