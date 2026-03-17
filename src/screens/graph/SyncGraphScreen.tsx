import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import SyncGraph from '@/components/visualization/SyncGraph';
import useTaskStore from '@/stores/taskStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SyncGraphScreen() {
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const { selectedTask, fetchTaskById, isLoading } = useTaskStore();
  const theme = useAppTheme();

  useEffect(() => {
    if (taskId && (!selectedTask || selectedTask.id !== taskId)) {
      fetchTaskById(taskId);
    }
  }, [taskId]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      {taskId && <Header title="Sync Graph" showBack />}
      {(isLoading && taskId) || (!selectedTask && taskId) ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : selectedTask ? (
        <SyncGraph task={selectedTask} />
      ) : (
        <View style={[styles.flex, { backgroundColor: theme.background }]}>
          {/* Global Graph Placeholder if accessed from Tab bar */}
          <Header title="Global Sync Network" />
          <View style={styles.globalPlaceholder}>
            <Text style={{ fontSize: 56, marginBottom: 20, textAlign: 'center' }}>🕸️</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 10, textAlign: 'center' }}>
              Global Graph
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
              Select a specific task from your Tasks or Dashboard to visualize its responsibility network.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  globalPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
