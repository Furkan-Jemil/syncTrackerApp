import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import useAuthStore from '@/stores/authStore';

export default function SplashScreen() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const scale = useSharedValue(1);

  // Subtle pulse on the logo while loading
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    restoreSession();
  }, [restoreSession, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.emoji}>🔗</Text>
      </Animated.View>
      <Text style={styles.title}>SyncTracker</Text>
      <Text style={styles.subtitle}>Responsibility & Sync Intelligence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1117',
    gap: 8,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f0f4ff',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6370a0',
    letterSpacing: 0.3,
  },
});
