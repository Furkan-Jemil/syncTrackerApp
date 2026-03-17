import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import useAuthStore from '@/stores/authStore';
import useTaskStore from '@/stores/taskStore';
import useNotificationStore from '@/stores/notificationStore';
import { Task } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function DashboardScreen() {
  const theme = useAppTheme();
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const { unreadCount } = useNotificationStore();
  const navigation = useNavigation<any>();
  const firstName = user?.name?.split(' ')[0] || 'User';

  const [filterCategory, setFilterCategory] = useState<'ACTIVE' | 'NEEDS_UPDATE' | 'BLOCKED' | null>(null);

  const needsUpdateTasks = (tasks || []).filter((t: Task) => {
    const p = t.participants?.find((part: any) => part.userId === user?.id) || t.participants?.[0];
    return p?.syncStatus === 'NEEDS_UPDATE';
  });
  const blockedTasks = (tasks || []).filter((t: Task) => {
    const p = t.participants?.find((part: any) => part.userId === user?.id) || t.participants?.[0];
    return p?.syncStatus === 'BLOCKED';
  });
  const activeTasks = (tasks || []).filter((t: Task) => {
    const p = t.participants?.find((part: any) => part.userId === user?.id);
    return t.status === 'ACTIVE' && p?.status === 'ACCEPTED';
  });

  const uniqueTasks = Array.from(new Map((tasks || []).map(t => [t.id, t])).values());
  const recentTasks = uniqueTasks
    .filter((t: Task) => {
      const p = t.participants?.find((part: any) => part.userId === user?.id);
      return p?.status === 'ACCEPTED';
    })
    .sort((a: Task, b: Task) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const activeCount = activeTasks.length;
  const needsUpdateCount = needsUpdateTasks.length;
  const blockedCount = blockedTasks.length;

  const currentFilteredTasks = 
    filterCategory === 'ACTIVE' ? activeTasks :
    filterCategory === 'NEEDS_UPDATE' ? needsUpdateTasks :
    filterCategory === 'BLOCKED' ? blockedTasks : [];

  const toggleFilter = (cat: 'ACTIVE' | 'NEEDS_UPDATE' | 'BLOCKED') => {
    setFilterCategory(prev => prev === cat ? null : cat);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.glowOrb, { backgroundColor: theme.primary }]} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={[styles.avatarPlaceholder, { backgroundColor: theme.primary, borderColor: theme.primary + '40' }]} 
            onPress={() => navigation.navigate('ProfileStack')}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarEmoji, { color: theme.background === '#09090B' ? '#052E16' : '#FFFFFF' }]}>{user?.name?.charAt(0).toUpperCase() || '👤'}</Text>
            )}
          </TouchableOpacity>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>Hello {firstName} 👋</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Get ready</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
             <TouchableOpacity 
               style={[styles.iconButton, { backgroundColor: theme.surface }]} 
               onPress={() => navigation.navigate('Notifications')}
             >
               <Text style={styles.iconText}>🔔</Text>
               {unreadCount > 0 && <View style={[styles.unreadBadge, { backgroundColor: theme.primary, borderColor: theme.surface }]} />}
             </TouchableOpacity>
             <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface }]}>
               <Text style={styles.iconText}>🔥</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
           <View style={styles.heroContent}>
              <View style={[styles.heroIconBg, { backgroundColor: theme.background === '#09090B' ? '#052E16' : 'rgba(0,0,0,0.1)' }]}><Text style={styles.heroIconText}>🏆</Text></View>
              <View>
                 <Text style={[styles.heroTitle, { color: theme.background === '#09090B' ? '#052E16' : '#FFFFFF' }]}>Mission Status</Text>
                 <Text style={[styles.heroSub, { color: theme.background === '#09090B' ? '#14532D' : 'rgba(255,255,255,0.8)' }]}>{activeCount} Active Tasks</Text>
              </View>
           </View>
           <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('TasksStack')}>
             <Text style={[styles.heroBtnText, { color: theme.background === '#09090B' ? '#052E16' : theme.primary }]}>START</Text>
           </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Execution Stats</Text>
        <View style={styles.nutritionGrid}>
           <TouchableOpacity 
             style={[
               styles.nutritionCard, 
               { backgroundColor: theme.surface },
               filterCategory === 'ACTIVE' && [styles.nutritionCardActive, { borderColor: theme.primary + '40', backgroundColor: theme.primaryMuted }]
             ]}
             onPress={() => toggleFilter('ACTIVE')}
           >
              <Text style={styles.nutIcon}>⚡</Text>
              <Text style={[styles.nutLabel, { color: theme.textSecondary }]}>Active</Text>
              <View style={styles.nutValRow}>
                <Text style={[styles.nutValue, { color: theme.text }]}>{activeCount}</Text>
                <Text style={[styles.nutSub, { color: theme.textSecondary }]}> tasks</Text>
              </View>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[
               styles.nutritionCard, 
               { backgroundColor: theme.surface },
               filterCategory === 'NEEDS_UPDATE' && [styles.nutritionCardNeedsUpdate, { borderColor: theme.warning + '40', backgroundColor: theme.warning + '0D' }]
             ]}
             onPress={() => toggleFilter('NEEDS_UPDATE')}
           >
              <Text style={styles.nutIcon}>⚠️</Text>
              <Text style={[styles.nutLabel, { color: theme.textSecondary }]}>Needs Update</Text>
              <View style={styles.nutValRow}>
                <Text style={[styles.nutValue, { color: theme.text }]}>{needsUpdateCount}</Text>
                <Text style={[styles.nutSub, { color: theme.textSecondary }]}> alerts</Text>
              </View>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[
               styles.nutritionCard, 
               { backgroundColor: theme.surface },
               filterCategory === 'BLOCKED' && [styles.nutritionCardBlocked, { borderColor: theme.error + '40', backgroundColor: theme.error + '0D' }]
             ]}
             onPress={() => toggleFilter('BLOCKED')}
           >
              <Text style={styles.nutIcon}>🛑</Text>
              <Text style={[styles.nutLabel, { color: theme.textSecondary }]}>Blocked</Text>
              <View style={styles.nutValRow}>
                <Text style={[styles.nutValue, { color: theme.text }]}>{blockedCount}</Text>
                <Text style={[styles.nutSub, { color: theme.textSecondary }]}> blocks</Text>
              </View>
           </TouchableOpacity>
        </View>

        {/* Dynamic Category List */}
        {filterCategory && (
          <View style={styles.dynamicListContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitleNoMargin, { color: theme.text }]}>
                {filterCategory === 'ACTIVE' ? 'Active Tasks' :
                 filterCategory === 'NEEDS_UPDATE' ? 'Needs Update' : 'Blocked Tasks'}
              </Text>
              <TouchableOpacity onPress={() => setFilterCategory(null)}>
                <Text style={[styles.sectionLink, { color: theme.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>

            {currentFilteredTasks.map((task: Task) => {
              const participantCount = task.participants?.length || 0;
              const p = task.participants?.find((part: any) => part.userId === user?.id) || task.participants?.[0];
              const displayStatus = p ? p.syncStatus : 'IN_SYNC';
              const statusColor = displayStatus === 'BLOCKED' ? theme.error : displayStatus === 'NEEDS_UPDATE' ? theme.warning : theme.primary;

              return (
                <TouchableOpacity 
                  key={task.id} 
                  style={[styles.activityItem, { backgroundColor: theme.surface }]}
                  onPress={() => navigation.navigate('TasksStack', { screen: 'TaskDetail', params: { taskId: task.id } })}
                >
                  <View style={[styles.activityRing, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
                    <Text style={styles.activityIcon}>
                      {filterCategory === 'ACTIVE' ? '⚡' : filterCategory === 'NEEDS_UPDATE' ? '⚠️' : '🛑'}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>{task.title}</Text>
                    <Text style={[styles.activityDesc, { color: theme.textSecondary }]}>
                      {displayStatus.replace('_', ' ')} • {task.responsibleOwnerId === user?.id ? "You" : "Team"}
                    </Text>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={[styles.activityCount, { color: theme.text }]}>{participantCount}</Text>
                    <Text style={[styles.activitySubCount, { color: theme.textSecondary }]}>/parts</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {currentFilteredTasks.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found in this category.</Text>
            )}
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>
        )}



        {/* Recent Tasks */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitleNoMargin, { color: theme.text }]}>Recent Tasks</Text>
        </View>
        
        {recentTasks.slice(0, 4).map((task: Task) => {
          const participantCount = task.participants?.length || 0;
          const p = task.participants?.find((part: any) => part.userId === user?.id) || task.participants?.[0];
          const displayStatus = p ? p.syncStatus : 'IN_SYNC';
          const statusColor = displayStatus === 'BLOCKED' ? theme.error : displayStatus === 'NEEDS_UPDATE' ? theme.warning : theme.primary;

          return (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.activityItem, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('TasksStack', { screen: 'TaskDetail', params: { taskId: task.id } })}
            >
              <View style={[styles.activityRing, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
                 <Text style={styles.activityIcon}>✓</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>{task.title}</Text>
                <Text style={[styles.activityDesc, { color: theme.textSecondary }]}>Updated • {task.responsibleOwnerId === user?.id ? "You" : "Team"}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.activityCount, { color: theme.text }]}>{participantCount}</Text>
                <Text style={[styles.activitySubCount, { color: theme.textSecondary }]}>/parts</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {recentTasks.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent tasks.</Text>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A3E635',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#A3E63540',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: { 
    fontSize: 20, 
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#052E16',
  },
  greeting: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 9999, // Pill shape
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#052E16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: { fontSize: 20 },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#052E16',
  },
  heroSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#14532D',
  },
  heroBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#052E16',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitleNoMargin: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#A3E635',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  nutritionCard: {
    width: '31%',
    borderRadius: 24,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nutritionCardActive: {
    borderColor: '#A3E63540',
    backgroundColor: 'rgba(163, 230, 53, 0.05)',
  },
  nutritionCardNeedsUpdate: {
    borderColor: '#FACC1540',
    backgroundColor: 'rgba(250, 204, 21, 0.05)',
  },
  nutritionCardBlocked: {
    borderColor: '#EF444440',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  dynamicListContainer: {
    marginBottom: 20,
    marginTop: -8,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginTop: 20,
    marginBottom: 24,
  },
  nutIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  nutLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  nutValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  nutValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#F8FAFC',
  },
  nutSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#A1A1AA',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 28, // High rounding
    marginBottom: 12,
  },
  activityRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIcon: {
    fontSize: 20,
    color: '#F8FAFC',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  activityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityCount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F8FAFC',
  },
  activitySubCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#A1A1AA',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomSpacer: {
    height: 120, // Enough clearance for floating bottom bar
  },
});
