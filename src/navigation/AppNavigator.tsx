import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet, View, Animated, Platform } from "react-native";
import { useEffect, useRef } from "react";
import DashboardNavigator from "@/navigation/DashboardNavigator";
import TaskNavigator from "@/navigation/TaskNavigator";
import SyncGraphScreen from "@/screens/graph/SyncGraphScreen";
import ActivityFeedScreen from "@/screens/activity/ActivityFeedScreen";
import ProfileNavigator from "@/navigation/ProfileNavigator";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";

export type AppTabParamList = {
  Dashboard: undefined;
  TasksStack: undefined;
  Activity: undefined;
  ProfileStack: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// Simple emoji icons — replaced with vector icons in Phase 3+
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const theme = useAppTheme();
  const displayIcons: Record<string, any> = {
    Dashboard: focused ? "grid" : "grid-outline",
    TasksStack: focused ? "list" : "list-outline",
    Activity: focused ? "flash" : "flash-outline",
    ProfileStack: focused ? "person" : "person-outline",
  };

  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        friction: 4,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={[styles.tabItemWrapper]}>
      <Animated.View
        style={[
          styles.iconContainer,
          focused && [styles.iconContainerFocused, {
            backgroundColor: theme.primaryMuted,
            borderColor: theme.primary + '4D', // 30% opacity
          }],
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}>
        <Ionicons 
          name={displayIcons[label]} 
          size={22} 
          color={focused ? theme.primary : theme.textSecondary} 
        />
      </Animated.View>
      {focused && <View style={[styles.activeDot, { backgroundColor: theme.primary, shadowColor: theme.primary }]} />}
    </View>
  );
}

export default function AppNavigator() {
  const theme = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: [styles.tabBar, { 
          backgroundColor: theme.background === '#09090B' ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.border,
        }],
        tabBarItemStyle: styles.tabBarItem,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="TasksStack" component={TaskNavigator} />
      <Tab.Screen name="Activity" component={ActivityFeedScreen} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    paddingHorizontal: 40,
    alignSelf: "center",
    backgroundColor: "rgba(24, 24, 27, 0.95)",
    borderRadius: 24,
    height: 56,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tabBarItem: {
    paddingVertical: 8,
    flex: 1,
  },
  tabItemWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconContainerFocused: {
    backgroundColor: "rgba(163, 230, 53, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(163, 230, 53, 0.3)",
  },
  icon: {
    fontSize: 18,
    color: "#94A3B8",
  },
  iconFocused: {
    color: "#A3E635",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#A3E635",
    position: "absolute",
    bottom: 2,
    shadowColor: "#A3E635",
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
