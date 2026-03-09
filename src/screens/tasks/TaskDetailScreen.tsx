import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '@/components/common/Header';
import ActivityLog from '@/components/tasks/ActivityLog';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';

export default function TaskDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const taskId = route.params?.taskId;
  const user = useAuthStore(s => s.user);
  
  const { selectedTask, fetchTaskById, isLoading, clearSelectedTask } = useTaskStore();

  useEffect(() => {
    fetchTaskById(taskId);
    return () => clearSelectedTask();
  }, [taskId]);

  if (isLoading || !selectedTask) {
    return (
      <View style={styles.flexCentered}>
        <ActivityIndicator color="#5a6ff4" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title={selectedTask.title} showBack />
      
      <View style={styles.taskInfo}>
        <Text style={styles.description}>{selectedTask.description || 'No description'}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Participants: <Text style={styles.statValue}>{selectedTask.participants?.length || 0}</Text></Text>
          <Text style={styles.statLabel}>Time Logged: <Text style={styles.statValue}>
            {selectedTask.timeEntries?.reduce((acc, t) => acc + t.durationMinutes, 0) || 0}m
          </Text></Text>
        </View>
      </View>

      {/* Tabs placeholder for Phase 4 - currently just showing Activity Log */}
      <View style={styles.tabHeader}>
        <View style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>Activity</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>Tree (Ph 4)</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>Graph (Ph 4)</Text></View>
      </View>

      <ActivityLog logs={selectedTask.syncLogs || []} />

      {/* Quick Action Bar for current user */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('SyncStatus', { taskId })}
        >
          <Text style={styles.actionText}>🚦 Update Sync</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('TimeLog', { taskId })}
        >
          <Text style={styles.actionText}>⏱️ Log Time</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddParticipant', { taskId })}
        >
          <Text style={styles.actionText}>👋 Add User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  flexCentered: { flex: 1, backgroundColor: '#0f1117', alignItems: 'center', justifyContent: 'center' },
  taskInfo: {
    padding: 20,
    backgroundColor: '#1a1d27',
    borderBottomWidth: 1,
    borderBottomColor: '#2e3148',
  },
  description: {
    fontSize: 14,
    color: '#8890b5',
    marginBottom: 16,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    color: '#6370a0',
  },
  statValue: {
    fontWeight: '700',
    color: '#f0f4ff',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2240',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#5a6ff4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6370a0',
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a6ff4',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1a1d27',
    borderTopWidth: 1,
    borderTopColor: '#2e3148',
    paddingBottom: 24, // safe area padding
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#22253a',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f0f4ff',
  },
});
