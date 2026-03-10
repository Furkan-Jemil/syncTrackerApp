import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TaskCard from '@/components/tasks/TaskCard';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import { TaskStackParamList } from '@/navigation/TaskNavigator';

type TaskListNavProp = NativeStackNavigationProp<TaskStackParamList, 'TaskList'>;

export default function HomeScreen() {
  const navigation = useNavigation<TaskListNavProp>();
  const user = useAuthStore(s => s.user);
  const { tasks, isLoading, fetchTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Mine' | 'Assigned' | 'Blocked'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const getParticipantForUser = (task: any) => {
    return task.participants?.find((p: any) => p.userId === user?.id) || task.participants?.[0];
  };

  const filteredTasks = tasks.filter(task => {
    // 1. Only show tasks where the current user is an ACCEPTED participant
    const p = getParticipantForUser(task);
    if (p?.status !== 'ACCEPTED') return false;

    // 2. Search query matching
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 3. Filter matching logic
    let matchesFilter = true;
    if (filter === 'Mine') {
      matchesFilter = task.responsibleOwnerId === user?.id;
    } else if (filter === 'Assigned') {
      matchesFilter = task.assignedById === user?.id;
    } else if (filter === 'Blocked') {
      matchesFilter = p?.syncStatus === 'BLOCKED';
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.flex}>
      {/* Header Area */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tasks</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {['All', 'Mine', 'Assigned', 'Blocked'].map((f) => (
            <TouchableOpacity 
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />
      </View>
      
      <FlatList
        data={filteredTasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A3E635"
            colors={['#A3E635']}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySub}>Adjust your filters or create a new one.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const participantCount = item.participants?.length || 0;
          return (
            <TaskCard
              title={item.title}
              responsibleName={item.responsibleOwnerId === user?.id ? "You" : "User"}
              participantCount={participantCount}
              status={item.status === 'ACTIVE' ? 'IN_SYNC' : (item.status as any) || 'IN_SYNC'}
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
  flex: { flex: 1, backgroundColor: '#09090B' },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#09090B',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#F7FEE7',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B', // Darker card color
    borderRadius: 9999, // Pill shape
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999, // Pill shape
    marginRight: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  filterPillActive: {
    backgroundColor: '#A3E635', // Neon active
    borderColor: '#A3E635',
  },
  filterText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#A1A1AA',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#052E16', // Dark green text on neon
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginTop: 4,
  },
  list: { padding: 20, paddingBottom: 100, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { 
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18, 
    color: '#F8FAFC', 
    marginBottom: 8 
  },
  emptySub: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 14, 
    color: '#94A3B8' 
  },
  fab: {
    position: 'absolute',
    bottom: 100, // accommodate higher fab from floating tab bar
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A3E635', // Neon FAB
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabIcon: {
    fontSize: 32,
    color: '#052E16',
    marginTop: -4,
  },
});
