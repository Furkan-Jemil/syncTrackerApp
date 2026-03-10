import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import ResponsibilityTree from '@/components/visualization/ResponsibilityTree';
import useTaskStore from '@/stores/taskStore';

export default function ResponsibilityTreeScreen() {
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
      <Header title="Responsibility Tree" showBack />
      {isLoading || !selectedTask ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : (
        <ResponsibilityTree task={selectedTask} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
