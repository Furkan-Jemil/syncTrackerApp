import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'INFO' | 'URGENT' | 'SUCCESS';
  showNotification: (message: string, type?: 'INFO' | 'URGENT' | 'SUCCESS') => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isVisible: false,
  message: '',
  type: 'INFO',
  showNotification: (message, type = 'INFO') => set({ isVisible: true, message, type }),
  hideNotification: () => set({ isVisible: false }),
}));

export default function NotificationBanner() {
  const { isVisible, message, type, hideNotification } = useNotificationStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-150);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(insets.top + 10, { damping: 14, stiffness: 100 });
      
      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 300 }, () => {
          runOnJS(hideNotification)();
        });
      }, 4000);
      
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-150, { duration: 300 });
    }
  }, [isVisible, insets.top]);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isVisible && translateY.value === -150) return null;

  const getColors = () => {
    switch(type) {
      case 'URGENT': return { bg: '#3b82f6', border: '#60a5fa', icon: '🆘' };
      case 'SUCCESS': return { bg: '#22c55e', border: '#4ade80', icon: '✅' };
      default: return { bg: '#1a1d27', border: '#5a6ff4', icon: '🔔' };
    }
  };

  const colors = getColors();

  return (
    <Animated.View style={[styles.container, rStyle, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={styles.icon}>{colors.icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
