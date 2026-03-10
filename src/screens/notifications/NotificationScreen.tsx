import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useNotificationStore from '@/stores/notificationStore';
import Header from '@/components/common/Header';
import { Notification } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    acceptInvite, 
    declineInvite,
    processingIds 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to task detail if available
    if (notification.taskId) {
      navigation.navigate('TasksStack', { 
        screen: 'TaskDetail', 
        params: { taskId: notification.taskId } 
      });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isInvite = item.type === 'TASK_ASSIGNED' || item.type === 'HELPER_REQUESTED';
    const isProcessing = processingIds.has(item.id);
    
    const role = item.metadata?.role as string | undefined;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type.replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.timeText}>{dayjs(item.createdAt).fromNow()}</Text>
        </View>
 
        <Text style={styles.messageText}>{item.message}</Text>

        {role && (
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Assigned as:</Text>
            <Text style={[styles.roleValue, { color: getRoleColor(role) }]}>
              {role.replace('_', ' ')}
            </Text>
          </View>
        )}

        {isInvite && !item.isRead && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.declineBtn]} 
              onPress={() => declineInvite(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.declineBtnText}>Decline</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn]} 
              onPress={() => acceptInvite(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#052E16" />
              ) : (
                <Text style={styles.acceptBtnText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {!item.isRead && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Mission Briefs" showBack />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotifications}
            tintColor="#A3E635"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>All Clear</Text>
              <Text style={styles.emptySub}>No pending notifications or assignments.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'TASK_ASSIGNED': return '#A3E635';
    case 'HELPER_REQUESTED': return '#3B82F6';
    case 'TASK_COMPLETED': return '#22C55E';
    case 'TASK_REJECTED': return '#EF4444';
    default: return '#A1A1AA';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ASSIGNER':
    case 'RESPONSIBLE': return '#A3E635';
    case 'CONTRIBUTOR': return '#3B82F6';
    case 'HELPER': return '#F97316';
    case 'REVIEWER': return '#A855F7';
    case 'OBSERVER': return '#A1A1AA';
    default: return '#A1A1AA';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    borderColor: '#A3E63540',
    backgroundColor: '#18181B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#71717A',
  },
  messageText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#F8FAFC',
    lineHeight: 22,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  roleLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  roleValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#A3E635',
  },
  acceptBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#052E16',
  },
  declineBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF444450',
  },
  declineBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    backgroundColor: '#A3E635',
    borderBottomLeftRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
