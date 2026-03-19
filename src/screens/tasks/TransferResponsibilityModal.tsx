import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/common/Header';
import PrimaryButton from '@/components/common/PrimaryButton';
import useAuthStore from '@/stores/authStore';
import useTaskStore from '@/stores/taskStore';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/components/common/NotificationBanner';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TransferResponsibilityModal() {
  const theme = useAppTheme();
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
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <Header title="Transfer Ownership" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          Select a team member to take over as the Responsible Owner for this task.
        </Text>

        {availableParticipants.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No other participants available for transfer.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {availableParticipants.map(p => {
              const isSelected = selectedUserId === p.userId;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.7}
                  style={[
                    styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && { borderColor: '#22c55e', backgroundColor: '#22c55e1A' }
                  ]}
                  onPress={() => setSelectedUserId(p.userId)}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.background }]}>
                    <Text style={[styles.avatarText, { color: theme.text }]}>{p.user?.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.text }, isSelected && { color: theme.primary }]}>
                      {p.user?.name}
                    </Text>
                    <Text style={[styles.role, { color: theme.textSecondary }]}>{p.role}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
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
  flex: { flex: 1 },
  container: { padding: 20 },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  userCardSelected: {
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameSelected: {
    color: '#22c55e',
  },
  role: {
    fontSize: 12,
  },
  checkIcon: {
  },
});
