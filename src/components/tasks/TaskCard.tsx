import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task, ParticipantRole, SyncStatus } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SYNC_STATUS_COLORS, SYNC_STATUS_LABELS, ROLE_LABELS } from '@/types';

dayjs.extend(relativeTime);

interface TaskCardProps {
  task: Task;
  userRole: ParticipantRole;
  userSyncStatus: SyncStatus;
  onPress: () => void;
}

export default function TaskCard({ task, userRole, userSyncStatus, onPress }: TaskCardProps) {
  const syncColor = SYNC_STATUS_COLORS[userSyncStatus];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
        <View style={[styles.statusBadge, { borderColor: syncColor, backgroundColor: `${syncColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: syncColor }]} />
          <Text style={[styles.statusText, { color: syncColor }]}>
            {SYNC_STATUS_LABELS[userSyncStatus]}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {task.description || 'No description provided.'}
      </Text>

      <View style={styles.footer}>
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>My Role: </Text>
          <Text style={styles.roleValue}>{ROLE_LABELS[userRole]}</Text>
        </View>
        <Text style={styles.timeLabel}>Updated {dayjs(task.updatedAt).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1d27',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2e3148',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#f0f4ff',
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    color: '#8890b5',
    lineHeight: 18,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2e3148',
    paddingTop: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 12,
    color: '#6370a0',
  },
  roleValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a4bcfd',
  },
  timeLabel: {
    fontSize: 11,
    color: '#6370a0',
  },
});
