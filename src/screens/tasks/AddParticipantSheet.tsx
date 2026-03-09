import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { addParticipant } from '@/api/participants';
import { ParticipantRole, ROLE_LABELS } from '@/types';
import useTaskStore from '@/stores/taskStore';

export default function AddParticipantSheet() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const updateTaskInList = useTaskStore(s => s.updateTaskInList);
  const selectedTask = useTaskStore(s => s.selectedTask);

  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<ParticipantRole>('CONTRIBUTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: ParticipantRole[] = ['CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER'];

  const onSubmit = async () => {
    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const participant = await addParticipant(taskId, userId.trim(), role);
      
      // Optimistically inject the new participant into the selected task
      if (selectedTask && selectedTask.id === taskId) {
        updateTaskInList({
          ...selectedTask,
          participants: [...selectedTask.participants, participant]
        });
      }
      
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add participant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Add Participant" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        <StyledTextInput
          label="User ID"
          placeholder="Enter the UUID of the user"
          value={userId}
          onChangeText={setUserId}
          error={error}
        />
        
        <Text style={styles.roleHeader}>Select Role</Text>
        <View style={styles.roleGrid}>
          {roles.map(r => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.7}
              style={[styles.roleCard, role === r && styles.roleCardActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                {ROLE_LABELS[r]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Add to Task"
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
  roleHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a0aabe',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '47%',
    paddingVertical: 14,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2e3148',
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: '#5a6ff4',
    backgroundColor: '#5a6ff41A',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8890b5',
  },
  roleTextActive: {
    color: '#5a6ff4',
  },
});
