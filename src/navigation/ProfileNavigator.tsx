import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import NotificationSettingsScreen from '@/screens/profile/NotificationSettingsScreen';
import ThemeSettingsScreen from '@/screens/profile/ThemeSettingsScreen';
import SecuritySettingsScreen from '@/screens/profile/SecuritySettingsScreen';
import TeamConfigurationScreen from '@/screens/profile/TeamConfigurationScreen';
import ProfileEditScreen from '@/screens/profile/ProfileEditScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  ProfileEdit: undefined;
  NotificationSettings: undefined;
  ThemeSettings: undefined;
  SecuritySettings: undefined;
  TeamConfiguration: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="TeamConfiguration" component={TeamConfigurationScreen} />
    </Stack.Navigator>
  );
}
