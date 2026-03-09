import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SyncLog } from '@/types';
import dayjs from 'dayjs';

interface ActivityLogProps {
  logs: SyncLog[];
}

const getLogIcon = (type: string) => {
  switch (type) {
    case 'RESPONSIBILITY_ACCEPTED': return '✅';
    case 'PARTICIPANT_JOINED': return '👋';
    case 'SYNC_STATUS_CHANGED': return '🔄';
    case 'HELP_REQUESTED': return '🆘';
    case 'MILESTONE_COMPLETED': return '🏆';
    case 'TIME_LOGGED': return '⏱️';
    case 'RESPONSIBILITY_TRANSFERRED': return '🔀';
    case 'NOTE_ADDED': return '📝';
    default: return '📌';
  }
};

export default function ActivityLog({ logs }: ActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyText}>No activity recorded yet.</Text>
      </View>
    );
  }

  // Sort newest first
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <FlatList
      data={sortedLogs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => {
        const isLast = index === sortedLogs.length - 1;
        return (
          <View style={styles.row}>
            {/* Timeline Line & Dot */}
            <View style={styles.timeline}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>{getLogIcon(item.type)}</Text>
              </View>
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <Text style={styles.userName}>{item.user?.name || 'System'}</Text>
                <Text style={styles.timeText}>{dayjs(item.createdAt).format('MMM D, h:mm A')}</Text>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
    backgroundColor: '#0f1117',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
  },
  timeline: {
    alignItems: 'center',
    width: 32,
    marginRight: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1d27',
    borderWidth: 1,
    borderColor: '#2e3148',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  icon: {
    fontSize: 14,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#1e2240',
    marginVertical: 4,
    minHeight: 24,
  },
  content: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 4,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0f4ff',
  },
  timeText: {
    fontSize: 12,
    color: '#6370a0',
  },
  messageText: {
    fontSize: 14,
    color: '#8890b5',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1117',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: '#6370a0',
    fontSize: 16,
  },
});
