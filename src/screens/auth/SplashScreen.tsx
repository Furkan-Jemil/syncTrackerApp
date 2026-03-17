import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import useAuthStore from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SplashScreen() {
  const theme = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={animatedStyle}>
        <Image 
          source={require('../../../assets/app-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={[styles.title, { color: theme.text }]}>SyncTracker</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Responsibility & Sync Intelligence</Text>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
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
