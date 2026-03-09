import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import HomeNavigator from '@/navigation/HomeNavigator';
import SyncGraphScreen from '@/screens/graph/SyncGraphScreen';
import ProfileNavigator from '@/navigation/ProfileNavigator';

export type AppTabParamList = {
  HomeStack: undefined;
  Graph: undefined;
  ProfileStack: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// Simple emoji icons — replaced with vector icons in Phase 3+
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    HomeStack: '📋',
    Graph: '🕸',
    ProfileStack: '👤',
  };
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[label]}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarLabel: route.name.replace('Stack', ''),
        tabBarActiveTintColor: '#5a6ff4',
        tabBarInactiveTintColor: '#4c5175',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeNavigator} />
      <Tab.Screen name="Graph" component={SyncGraphScreen} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#13162a',
    borderTopColor: '#1e2240',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
