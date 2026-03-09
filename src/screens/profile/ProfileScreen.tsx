import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/common/Header';
import useAuthStore from '@/stores/authStore';
import useTaskStore from '@/stores/taskStore';
import dayjs from 'dayjs';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const { tasks, fetchTasks, isLoading } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Compute analytics from tasks where user is a participant
  const analytics = useMemo(() => {
    let totalTime = 0;
    let helpRequests = 0;

    tasks.forEach(task => {
      const myParticipation = task.participants.find(p => p.userId === user?.id);
      if (myParticipation) {
        totalTime += myParticipation.totalTimeLogged || 0;
        helpRequests += myParticipation.helpRequestCount || 0;
      }
    });

    return { totalTime, helpRequests, activeTasks: tasks.length };
  }, [tasks, user?.id]);

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.flexCentered}>
        <ActivityIndicator color="#5a6ff4" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header 
        title="Profile" 
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.memberSince}>Member since {dayjs(user?.createdAt).format('MMM YYYY')}</Text>
          </View>
        </View>

        {/* Global Analytics */}
        <Text style={styles.sectionTitle}>My Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Tasks</Text>
            <Text style={styles.statValue}>{analytics.activeTasks}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Logged</Text>
            <Text style={styles.statValue}>{analytics.totalTime}m</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Help Requests</Text>
            <Text style={styles.statValue}>{analytics.helpRequests}</Text>
          </View>
        </View>

        {/* Recent Tasks List */}
        <Text style={styles.sectionTitle}>My Responsibilities</Text>
        {tasks.length === 0 ? (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>No tasks yet</Text>
          </View>
        ) : (
          tasks.slice(0, 5).map(task => {
            const myParticipation = task.participants.find(p => p.userId === user?.id);
            return (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => navigation.navigate('HomeStack', { screen: 'TaskDetail', params: { taskId: task.id } })}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskRole}>{myParticipation?.role || 'Member'}</Text>
                  <Text style={styles.taskTime}>
                    Updated {dayjs(task.updatedAt).fromNow()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  flexCentered: { flex: 1, backgroundColor: '#0f1117', alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20 },
  settingsIcon: { fontSize: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d27',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2e3148',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2e3148',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0f4ff',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f4ff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#a0aabe',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#6370a0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f4ff',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1d27',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3148',
  },
  statLabel: {
    fontSize: 12,
    color: '#6370a0',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0f4ff',
  },
  taskCard: {
    backgroundColor: '#1a1d27',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3148',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0f4ff',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskRole: {
    fontSize: 12,
    color: '#5a6ff4',
    fontWeight: '600',
    backgroundColor: '#5a6ff420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#6370a0',
  },
});
