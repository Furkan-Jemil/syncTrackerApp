import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import SyncGraph from '@/components/visualization/SyncGraph';
import useTaskStore from '@/stores/taskStore';

export default function SyncGraphScreen() {
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const { selectedTask, fetchTaskById, isLoading } = useTaskStore();

  useEffect(() => {
    if (taskId && (!selectedTask || selectedTask.id !== taskId)) {
      fetchTaskById(taskId);
    }
  }, [taskId]);

  return (
    <View style={styles.flex}>
      {taskId && <Header title="Sync Graph" showBack />}
      {(isLoading && taskId) || (!selectedTask && taskId) ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : selectedTask ? (
        <SyncGraph task={selectedTask} />
      ) : (
        <View style={styles.center}>
          {/* Global Graph Placeholder if accessed from Tab bar */}
          <Header title="Global Sync Network" />
          <View style={styles.globalPlaceholder}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🕸️</Text>
            <Text style={{ color: '#F8FAFC', fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 8 }}>Global Graph</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }}>
              Select a specific task from your Tasks or Dashboard to visualize its responsibility network.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#09090B' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090B' },
  globalPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
