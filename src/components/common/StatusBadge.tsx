import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

interface StatusBadgeProps {
  status: SyncStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const theme = useAppTheme();
  const getBadgeConfig = () => {
    switch (status) {
      case 'IN_SYNC':
        return { color: '#22C55E', label: 'In Sync', icon: '🟢' };
      case 'NEEDS_UPDATE':
        return { color: '#EAB308', label: 'Needs Update', icon: '🟡' };
      case 'BLOCKED':
        return { color: '#EF4444', label: 'Blocked', icon: '🔴' };
      case 'HELP_REQUESTED':
        return { color: '#3B82F6', label: 'Help Request', icon: '🔵' };
      default:
        return { color: '#94A3B8', label: 'Unknown', icon: '⚪' };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { borderColor: config.color + '40', backgroundColor: config.color + '15' }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.icon, size === 'sm' && styles.iconSm]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }, size === 'sm' && styles.labelSm]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  iconSm: {
    fontSize: 10,
    marginRight: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
  },
});
