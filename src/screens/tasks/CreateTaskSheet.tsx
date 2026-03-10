import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createTaskSchema, CreateTaskFormValues } from '@/utils/schemas';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import Header from '@/components/common/Header';
import { createTask, updateTask } from '@/api/tasks';
import { searchUsers, getUsers } from '@/api/users';
import { User, ParticipantRole, ROLE_COLORS } from '@/types';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';

export default function CreateTaskSheet() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const updateTaskInList = useTaskStore(s => s.updateTaskInList);
  const fetchTaskById = useTaskStore(s => s.fetchTaskById);
  const descRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    getValues,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: { 
      title: '', 
      description: '',
      participants: [],
      milestones: []
    },
  });

  const onSubmit = async (values: CreateTaskFormValues) => {
    try {
      const task = taskId 
        ? await updateTask(taskId, values)
        : await createTask(values);
      
      updateTaskInList(task);
      if (taskId) {
        fetchTaskById(taskId);
      }
      navigation.goBack();
    } catch (err: any) {
      console.error('Task action error:', err);
      setError('title', { message: taskId ? 'Failed to update task.' : 'Failed to create task.' });
    }
  };

  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<{user: User, role: ParticipantRole}[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const currentUser = useAuthStore(s => s.user);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const users = await getUsers();
        const filtered = users.filter(u => u.id !== currentUser?.id);
        setAllUsers(filtered);
        setSearchResults(filtered);

        if (taskId) {
          const task: any = await fetchTaskById(taskId);
          if (task) {
            setValue('title', task.title);
            setValue('description', task.description || '');
            const parts = (task.participants || [])
              .filter((p: any) => p.role !== 'RESPONSIBLE') // responsible is creator usually
              .map((p: any) => ({ user: p.user as User, role: p.role }));
            setSelectedParticipants(parts);
            setMilestones((task.milestones || []).map((m: any) => m.title));
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchAll();
  }, [currentUser?.id, taskId]);

  const handleSearch = async (text: string) => {
    setUserQuery(text);
    if (text.length > 1) {
      const results = await searchUsers(text);
      setSearchResults(results.filter(u => u.id !== currentUser?.id));
    } else {
      setSearchResults(allUsers);
    }
  };

  const addParticipant = (user: User) => {
    if (!selectedParticipants.find(p => p.user.id === user.id)) {
      setSelectedParticipants([...selectedParticipants, { user, role: 'CONTRIBUTOR' }]);
    }
  };

  const removeParticipant = (userId: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.user.id !== userId));
  };

  const updateRole = (userId: string, role: ParticipantRole) => {
    setSelectedParticipants(selectedParticipants.map(p => 
      p.user.id === userId ? { ...p, role } : p
    ));
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, newMilestone.trim()]);
      setNewMilestone('');
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const finalSubmit = () => {
    const values = getValues();
    if (!values.title) {
      setError('title', { message: 'Title is required' });
      return;
    }
    onSubmit({
      ...values,
      participants: selectedParticipants.map(p => ({ userId: p.user.id, role: p.role })),
      milestones: milestones.map(m => ({ title: m }))
    } as CreateTaskFormValues);
  };

  const toggleParticipant = (user: User) => {
    if (selectedParticipants.find(p => p.user.id === user.id)) {
      removeParticipant(user.id);
    } else {
      addParticipant(user);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title={taskId ? "Edit Task" : "New Task"} showBack />
      
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                label="Task Title"
                placeholder="e.g. Design SyncTracker API"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                returnKeyType="next"
                onSubmitEditing={() => descRef.current?.focus()}
              />
            )}
          />

          <View style={styles.spacer} />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                ref={descRef}
                label="Description (Optional)"
                placeholder="Details about what needs to be done..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            )}
          />

          <View style={styles.spacer} />

          {/* Section: Participants */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ASSIGN CONTRIBUTORS</Text>
            <Text style={styles.sectionCount}>{selectedParticipants.length} selected</Text>
          </View>
          
          <View style={styles.horizontalSearchContainer}>
             <TextInput
               style={styles.searchFieldMinimal}
               placeholder="🔍 Search users..."
               placeholderTextColor="#64748B"
               value={userQuery}
               onChangeText={handleSearch}
             />
          </View>

          {isUsersLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color="#A3E635" />
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalUsers}
              contentContainerStyle={styles.horizontalUsersContent}
            >
              {searchResults.map(user => {
                const isSelected = selectedParticipants.some(p => p.user.id === user.id);
                return (
                  <TouchableOpacity 
                    key={user.id} 
                    style={styles.userCircleItem} 
                    onPress={() => toggleParticipant(user)}
                  >
                    <View style={[styles.avatarRing, isSelected && styles.avatarRingActive]}>
                      {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.userAvatarImg} />
                      ) : (
                        <View style={styles.userAvatarPlaceholder}>
                          <Text style={styles.userAvatarText}>{user.name[0].toUpperCase()}</Text>
                        </View>
                      )}
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.userCircleName, isSelected && styles.userCircleNameActive]} numberOfLines={1}>
                      {user.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {selectedParticipants.length > 0 && (
            <View style={styles.selectedRolesContainer}>
              <Text style={styles.subSectionLabel}>SET ROLES</Text>
              {selectedParticipants.map(p => (
                <View key={p.user.id} style={styles.participantItem}>
                  <View style={styles.participantInfoMini}>
                    <Text style={styles.participantNameMini}>{p.user.name}</Text>
                    <Text style={styles.participantRoleLabel}>{p.role}</Text>
                  </View>
                  <View style={styles.rolePickerMinimal}>
                    {['CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER'].map(r => (
                      <TouchableOpacity 
                        key={r} 
                        style={[
                          styles.roleBtnSmall, 
                          p.role === r && { backgroundColor: ROLE_COLORS[r as ParticipantRole] }
                        ]}
                        onPress={() => updateRole(p.user.id, r as any)}
                      >
                        <Text style={[
                          styles.roleBtnTextSmall, 
                          p.role === r ? { color: '#052E16' } : { color: '#94A3B8' }
                        ]}>{r === 'CONTRIBUTOR' ? 'C' : r === 'HELPER' ? 'H' : r === 'REVIEWER' ? 'R' : 'O'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => removeParticipant(p.user.id)} style={styles.removeBtnMini}>
                    <Text style={styles.removeTextMini}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.spacerLg} />

          {/* Section: Milestones */}
          <Text style={styles.sectionLabel}>INITIAL MILESTONES</Text>
          <View style={styles.milestoneInputRow}>
            <TextInput
              style={styles.milestoneField}
              placeholder="Add key milestone..."
              placeholderTextColor="#64748B"
              value={newMilestone}
              onChangeText={setNewMilestone}
              onSubmitEditing={addMilestone}
            />
            <TouchableOpacity style={styles.addMilestoneBtn} onPress={addMilestone}>
              <Text style={styles.addMilestoneText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.milestoneList}>
            {milestones.map((m, i) => (
              <View key={i} style={styles.milestoneItem}>
                <Text style={styles.milestoneText}>{i + 1}. {m}</Text>
                <TouchableOpacity onPress={() => removeMilestone(i)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.spacerLg} />

          <PrimaryButton
            title={taskId ? "Update Task" : "Launch Task"}
            isLoading={isSubmitting}
            onPress={finalSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#09090B' },
  container: { padding: 20, paddingBottom: 60 },
  spacer: { height: 16 },
  spacerLg: { height: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#A3E635',
    letterSpacing: 1,
  },
  sectionCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#71717A',
  },
  horizontalSearchContainer: {
    marginBottom: 16,
  },
  searchFieldMinimal: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 12,
    height: 40,
    color: '#F8FAFC',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  loaderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalUsers: {
    marginBottom: 20,
  },
  horizontalUsersContent: {
    paddingRight: 20,
  },
  userCircleItem: {
    width: 70,
    alignItems: 'center',
    marginRight: 12,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 6,
    position: 'relative',
  },
  avatarRingActive: {
    borderColor: '#A3E635',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  userAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#A3E635',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#09090B',
  },
  selectedBadgeText: {
    color: '#052E16',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userCircleName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  userCircleNameActive: {
    color: '#F8FAFC',
    fontFamily: 'Inter_700Bold',
  },
  selectedRolesContainer: {
    marginTop: 8,
    backgroundColor: '#18181B50',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  subSectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#71717A',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A50',
  },
  participantInfoMini: {
    flex: 1,
  },
  participantNameMini: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F8FAFC',
    fontSize: 13,
  },
  participantRoleLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#A3E635',
    textTransform: 'uppercase',
  },
  rolePickerMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  roleBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  roleBtnTextSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#71717A',
  },
  removeBtnMini: {
    padding: 4,
  },
  removeTextMini: {
    color: '#EF4444',
    fontSize: 14,
  },
  milestoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneField: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    height: 48,
    color: '#F8FAFC',
    fontFamily: 'Inter_400Regular',
  },
  addMilestoneBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  addMilestoneText: {
    color: '#A3E635',
    fontSize: 24,
    fontWeight: '700',
  },
  milestoneList: {
    marginTop: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  milestoneText: {
    fontFamily: 'Inter_400Regular',
    color: '#F8FAFC',
    fontSize: 14,
  },
  removeText: {
    color: '#EF4444',
    fontSize: 16,
    padding: 4,
  },
});
