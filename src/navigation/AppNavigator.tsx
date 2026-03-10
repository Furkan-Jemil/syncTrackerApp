import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import DashboardNavigator from '@/navigation/DashboardNavigator';
import TaskNavigator from '@/navigation/TaskNavigator';
import SyncGraphScreen from '@/screens/graph/SyncGraphScreen';
import ActivityFeedScreen from '@/screens/activity/ActivityFeedScreen';
import ProfileNavigator from '@/navigation/ProfileNavigator';

export type AppTabParamList = {
  Dashboard: undefined;
  TasksStack: undefined;
  Activity: undefined;
  ProfileStack: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// Simple emoji icons — replaced with vector icons in Phase 3+
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '󰈐', // High-fidelity Chart-like symbol
    TasksStack: '󰔗', // List/Task symbol
    Graph: '󰙔', // Network symbol
    Activity: '󱐋', // Bolt/Energy symbol
    ProfileStack: '󰙜', // User/Profile symbol
  };
  
  const displayIcons: Record<string, string> = {
    Dashboard: '📉',
    TasksStack: '📑',
    Activity: '⚡',
    ProfileStack: '👤',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {displayIcons[label]}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
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
        tabBarShowLabel: false, // Hide labels for a cleaner, icon-focused floating pill
        tabBarActiveTintColor: '#A3E635', // Neon Green
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="TasksStack" component={TaskNavigator} />
      <Tab.Screen name="Activity" component={ActivityFeedScreen} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#18181B',
    borderRadius: 30, // Tighter rounding
    height: 60, // Smaller height relative to original 70
    borderTopWidth: 0, // Remove default top border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 10,
    paddingBottom: 0, // Reset default padding on iOS
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 12,
  },
  icon: {
    fontSize: 20, // Smaller icons (from 24)
    opacity: 0.5,
    color: '#94A3B8',
  },
  iconFocused: {
    opacity: 1,
    color: '#A3E635',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A3E635',
    position: 'absolute',
    bottom: -6,
  },
});
