import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { addParticipant } from '@/api/participants';
import { searchUsers, getUsers } from '@/api/users';
import { User, ParticipantRole, ROLE_LABELS, ROLE_COLORS } from '@/types';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AddParticipantSheet() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const updateTaskInList = useTaskStore(s => s.updateTaskInList);
  const selectedTask = useTaskStore(s => s.selectedTask);

  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<ParticipantRole>('CONTRIBUTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = useAuthStore(s => s.user);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const users = await getUsers();
        const filtered = users.filter(u => u.id !== currentUser?.id);
        setAllUsers(filtered);
        setSearchResults(filtered);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchAll();
  }, [currentUser?.id]);

  const roles: ParticipantRole[] = ['CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER'];

  const handleSearch = async (text: string) => {
    setUserQuery(text);
    if (text.length > 1) {
      const results = await searchUsers(text);
      setSearchResults(results.filter(u => u.id !== currentUser?.id));
    } else {
      setSearchResults(allUsers);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setUserQuery('');
    setSearchResults([]);
  };

  const onSubmit = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const participant = await addParticipant(taskId, selectedUser.id, role);
      
      if (selectedTask && selectedTask.id === taskId) {
        // We re-fetch or optimistically update
        useTaskStore.getState().fetchTaskById(taskId);
      }
      
      navigation.goBack();
    } catch (err: any) {
      setError('Failed to add participant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <Header title="Add Participant" showBack />
      
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>SEARCH USER</Text>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.searchField, { color: theme.text }]}
            placeholder="Name or email..."
            placeholderTextColor={theme.textMuted}
            value={userQuery}
            onChangeText={handleSearch}
          />
        </View>

        {isUsersLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : searchResults.length > 0 && !selectedUser ? (
          <View style={[styles.resultsPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {searchResults.map(user => (
              <TouchableOpacity key={user.id} style={[styles.resultItem, { borderBottomColor: theme.border }]} onPress={() => selectUser(user)}>
                <View style={[styles.resultAvatar, { backgroundColor: theme.background }]}><Text style={[styles.resultAvatarText, { color: theme.textSecondary }]}>{user.name[0]}</Text></View>
                <View>
                  <Text style={[styles.resultName, { color: theme.text }]}>{user.name}</Text>
                  <Text style={[styles.resultEmail, { color: theme.textSecondary }]}>{user.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {selectedUser && (
          <View style={[styles.selectedUserCard, { backgroundColor: theme.primary + '1A', borderColor: theme.primary }]}>
            <View style={styles.selectedUserInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.background }]}><Text style={[styles.avatarText, { color: theme.text }]}>{selectedUser.name[0]}</Text></View>
              <View>
                <Text style={[styles.selectedUserName, { color: theme.text }]}>{selectedUser.name}</Text>
                <Text style={[styles.selectedUserEmail, { color: theme.textSecondary }]}>{selectedUser.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedUser(null)}>
              <Text style={[styles.removeText, { color: theme.error }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={[styles.sectionLabel, { marginTop: 24, color: theme.primary }]}>SELECT ROLE</Text>
        <View style={styles.roleGrid}>
          {roles.map(r => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.7}
              style={[
                styles.roleCard, { backgroundColor: theme.surface, borderColor: theme.border },
                role === r && { borderColor: ROLE_COLORS[r], backgroundColor: `${ROLE_COLORS[r]}1A` }
              ]}
              onPress={() => setRole(r)}
            >
              <Text style={[
                styles.roleText, { color: theme.textSecondary },
                role === r && { color: ROLE_COLORS[r] }
              ]}>
                {ROLE_LABELS[r]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

        <PrimaryButton
          title="Add Participant"
          isLoading={isLoading}
          onPress={onSubmit}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#A3E635',
    marginBottom: 8,
    letterSpacing: 1,
  },
  searchBox: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
  },
  searchField: {
    color: '#F8FAFC',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  resultsPanel: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  resultAvatarText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  resultName: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F8FAFC',
    fontSize: 14,
  },
  resultEmail: {
    fontFamily: 'Inter_400Regular',
    color: '#71717A',
    fontSize: 11,
  },
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A3E635',
  },
  selectedUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#F8FAFC',
    fontFamily: 'Inter_700Bold',
  },
  selectedUserName: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F8FAFC',
    fontSize: 14,
  },
  selectedUserEmail: {
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    fontSize: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '47%',
    paddingVertical: 14,
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: '#A3E635',
    backgroundColor: 'rgba(163, 230, 53, 0.05)',
  },
  roleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#71717A',
  },
  roleTextActive: {
    color: '#A3E635',
  },
  removeText: {
    color: '#EF4444',
    fontSize: 18,
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
