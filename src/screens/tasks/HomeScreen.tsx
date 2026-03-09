import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '@/components/common/Header';
import TaskCard from '@/components/tasks/TaskCard';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import { HomeStackParamList } from '@/navigation/HomeNavigator';

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const user = useAuthStore(s => s.user);
  const { tasks, isLoading, fetchTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const getParticipantForUser = (task: any) => {
    return task.participants.find((p: any) => p.userId === user?.id) || task.participants[0];
  };

  return (
    <View style={styles.flex}>
      <Header title="My Tasks" />
      
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5a6ff4"
            colors={['#5a6ff4']}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No active tasks</Text>
              <Text style={styles.emptySub}>You are caught up on everything.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const participant = getParticipantForUser(item);
          return (
            <TaskCard
              task={item}
              userRole={participant?.role || 'OBSERVER'}
              userSyncStatus={participant?.syncStatus || 'IN_SYNC'}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  list: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#f0f4ff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6370a0' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5a6ff4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#5a6ff4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    marginTop: -2,
  },
});
