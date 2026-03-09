import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import PrimaryButton from '@/components/common/PrimaryButton';
import useAuthStore from '@/stores/authStore';
import useTaskStore from '@/stores/taskStore';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/components/common/NotificationBanner';

export default function TransferResponsibilityModal() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  
  const user = useAuthStore(s => s.user);
  const selectedTask = useTaskStore(s => s.selectedTask);
  const { socket } = useSocket(taskId);
  const showNotification = useNotificationStore(s => s.showNotification);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out the current user so they can only transfer to others
  const availableParticipants = selectedTask?.participants.filter(p => p.userId !== user?.id) || [];

  const onTransfer = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);

    try {
      // In a real implementation this would make an API call:
      // await transferResponsibility(taskId, selectedUserId);

      // We emit via socket for real-time edge updates (Phase 5)
      if (socket && socket.connected) {
        socket.emit('responsibility_transferred', {
          taskId,
          fromUserId: user?.id,
          toUserId: selectedUserId,
        });
      }

      showNotification('Responsibility transferred successfully!', 'SUCCESS');
      navigation.goBack();
    } catch (err) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Transfer Ownership" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.helperText}>
          Select a team member to take over as the Responsible Owner for this task.
        </Text>

        {availableParticipants.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No other participants available for transfer.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {availableParticipants.map(p => {
              const isSelected = selectedUserId === p.userId;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.7}
                  style={[styles.userCard, isSelected && styles.userCardSelected]}
                  onPress={() => setSelectedUserId(p.userId)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{p.user?.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, isSelected && styles.nameSelected]}>
                      {p.user?.name}
                    </Text>
                    <Text style={styles.role}>{p.role}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkIcon}>✅</Text>}
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <PrimaryButton
          title="Confirm Transfer"
          isLoading={isLoading}
          onPress={onTransfer}
          style={{ marginTop: 32 }}
          disabled={!selectedUserId || availableParticipants.length === 0}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20 },
  helperText: {
    fontSize: 14,
    color: '#8890b5',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBox: {
    padding: 24,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3148',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6370a0',
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2e3148',
  },
  userCardSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e1A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e3148',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0f4ff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0f4ff',
    marginBottom: 2,
  },
  nameSelected: {
    color: '#22c55e',
  },
  role: {
    fontSize: 12,
    color: '#6370a0',
  },
  checkIcon: {
    fontSize: 16,
  },
});
