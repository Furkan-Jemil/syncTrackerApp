import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import PrimaryButton from '@/components/common/PrimaryButton';
import StyledTextInput from '@/components/common/StyledTextInput';
import { updateSyncStatus } from '@/api/participants';
import { SyncStatus, SYNC_STATUS_COLORS, SYNC_STATUS_LABELS } from '@/types';
import useAuthStore from '@/stores/authStore';
import useTaskStore from '@/stores/taskStore';
import useSyncStore from '@/stores/syncStore';

export default function SyncStatusSheet() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  
  const user = useAuthStore(s => s.user);
  const updateSyncStatusOptimistic = useTaskStore(s => s.updateSyncStatusOptimistic);
  const updateLiveStatus = useSyncStore(s => s.updateStatus);

  const [status, setStatus] = useState<SyncStatus>('IN_SYNC');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const statuses: SyncStatus[] = ['IN_SYNC', 'NEEDS_UPDATE', 'BLOCKED', 'HELP_REQUESTED'];

  const onSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Optimistic update for graph/tree and task list
      updateLiveStatus(taskId, user.id, status);
      updateSyncStatusOptimistic(taskId, user.id, status);
      
      // API call
      await updateSyncStatus(taskId, user.id, status, note.trim() || undefined);
      
      navigation.goBack();
    } catch (err) {
      // If it fails, ideally we revert the optimistic update. For Phase 3, we just close.
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Update Sync Status" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>How are you tracking on this task?</Text>
        
        <View style={styles.statusGrid}>
          {statuses.map(s => {
            const color = SYNC_STATUS_COLORS[s];
            const isActive = status === s;
            return (
              <TouchableOpacity
                key={s}
                activeOpacity={0.7}
                style={[
                  styles.statusCard,
                  isActive && { borderColor: color, backgroundColor: `${color}1A` }
                ]}
                onPress={() => setStatus(s)}
              >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={[styles.statusText, isActive && { color }]}>
                  {SYNC_STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <StyledTextInput
          label="Note (Optional)"
          placeholder="Any blockers or updates?"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top', marginTop: 12 }}
        />

        <PrimaryButton
          title="Update Status"
          isLoading={isLoading}
          onPress={onSubmit}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20 },
  headerText: {
    fontSize: 15,
    color: '#6370a0',
    marginBottom: 20,
  },
  statusGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2e3148',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0f4ff',
  },
});
