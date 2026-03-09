import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '@/components/common/Header';
import ActivityLog from '@/components/tasks/ActivityLog';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import useSyncStore from '@/stores/syncStore';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/components/common/NotificationBanner';

import ResponsibilityTree from '@/components/visualization/ResponsibilityTree';
import SyncGraph from '@/components/visualization/SyncGraph';

// Add state to TaskDetailScreen component:
export default function TaskDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const taskId = route.params?.taskId;
  const user = useAuthStore(s => s.user);
  
  const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'TREE' | 'GRAPH'>('ACTIVITY');
  
  const { selectedTask, fetchTaskById, isLoading, clearSelectedTask } = useTaskStore();
  const updateLiveStatus = useSyncStore(s => s.updateStatus);
  const showNotification = useNotificationStore(s => s.showNotification);
  
  // Real-time task room connection
  const { socket } = useSocket(taskId);

  useEffect(() => {
    fetchTaskById(taskId);
    return () => clearSelectedTask();
  }, [taskId]);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    // Listeners for Phase 5 real-time events
    const onSyncChanged = (data: any) => {
      // data: { taskId, userId, oldStatus, newStatus }
      updateLiveStatus(data.taskId, data.userId, data.newStatus);
    };

    const onHelpRequested = (data: any) => {
      // data: { taskId, userId, user: User }
      if (data.userId !== user?.id) {
        showNotification(`${data.user.name} requested help!`, 'URGENT');
        updateLiveStatus(data.taskId, data.userId, 'HELP_REQUESTED');
      }
    };

    const onParticipantJoined = (data: any) => {
      // data: { taskId, participant }
      if (data.participant.userId !== user?.id) {
        showNotification(`${data.participant.user.name} joined as ${data.participant.role}`, 'INFO');
      }
      // Re-fetch to pull new participant array into taskStore
      fetchTaskById(data.taskId);
    };

    socket.on('sync_status_changed', onSyncChanged);
    socket.on('help_requested', onHelpRequested);
    socket.on('participant_joined', onParticipantJoined);

    return () => {
      socket.off('sync_status_changed', onSyncChanged);
      socket.off('help_requested', onHelpRequested);
      socket.off('participant_joined', onParticipantJoined);
    };
  }, [socket, taskId, user?.id]);

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

      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ACTIVITY' && styles.tabActive]}
          onPress={() => setActiveTab('ACTIVITY')}
        >
          <Text style={activeTab === 'ACTIVITY' ? styles.tabTextActive : styles.tabText}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'TREE' && styles.tabActive]}
          onPress={() => setActiveTab('TREE')}
        >
          <Text style={activeTab === 'TREE' ? styles.tabTextActive : styles.tabText}>Tree</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'GRAPH' && styles.tabActive]}
          onPress={() => setActiveTab('GRAPH')}
        >
          <Text style={activeTab === 'GRAPH' ? styles.tabTextActive : styles.tabText}>Graph</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'ACTIVITY' && <ActivityLog logs={selectedTask.syncLogs || []} />}
        {activeTab === 'TREE' && <ResponsibilityTree task={selectedTask} />}
        {activeTab === 'GRAPH' && <SyncGraph task={selectedTask} />}
      </View>

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
