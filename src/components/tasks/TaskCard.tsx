import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { SyncStatus } from '@/types';
import StatusBadge from '../common/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';

interface TaskCardProps {
  title: string;
  responsibleName: string;
  participantCount?: number;
  status: SyncStatus;
  onPress?: () => void;
}

export default function TaskCard({ title, responsibleName, participantCount, status, onPress }: TaskCardProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Subtle floating motion
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // Subtle tilt
    rotate.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotateZ: `${rotate.value}deg` }
    ],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Pressable 
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <StatusBadge status={status} size="sm" />
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Responsible: </Text>
          {responsibleName}
        </Text>
        {participantCount !== undefined && (
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Participants: </Text>
            {participantCount}
          </Text>
        )}
      </View>
    </Pressable>
  </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, // High rounding
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
  },
  label: {
    fontWeight: '600',
  },
});
