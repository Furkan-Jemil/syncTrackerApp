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
import { useAppTheme } from '@/hooks/useAppTheme';

dayjs.extend(relativeTime);

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    acceptInvite, 
    declineInvite,
    processingActions 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.taskId) {
      navigation.navigate('TasksStack', { 
        screen: 'TaskDetail', 
        params: { taskId: notification.taskId } 
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return theme.primary;
      case 'HELPER_REQUESTED': return '#3B82F6';
      case 'WORK_SUBMITTED': return '#F97316';
      case 'TASK_COMPLETED': return '#22C55E';
      case 'TASK_REJECTED': return theme.error;
      default: return theme.textMuted;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return 'Assigned';
      case 'HELPER_REQUESTED': return 'Help Requested';
      case 'WORK_SUBMITTED': return 'Work Submitted';
      case 'TASK_COMPLETED': return 'Completed';
      case 'TASK_REJECTED': return 'Rejected';
      default: return type.replace(/_/g, ' ');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'RESPONSIBLE': return theme.primary;
      case 'CONTRIBUTOR': return '#3B82F6';
      case 'HELPER': return '#F97316';
      case 'REVIEWER': return '#A855F7';
      case 'OBSERVER': return theme.textMuted;
      default: return theme.textMuted;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isInvite = item.type === 'TASK_ASSIGNED' || item.type === 'HELPER_REQUESTED';
    const currentAction = processingActions[item.id];
    const role = item.metadata?.role as string | undefined;
    const typeColor = getTypeColor(item.type);

    return (
      <View
        style={[
          styles.notificationCard, 
          { backgroundColor: theme.surface, borderColor: theme.border },
          !item.isRead && { borderColor: typeColor + '60', backgroundColor: typeColor + '0A' }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
          style={styles.cardContent}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>
                {getTypeLabel(item.type)}
              </Text>
            </View>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>
              {dayjs(item.createdAt).fromNow()}
            </Text>
          </View>

          <Text style={[styles.messageText, { color: theme.text }]}>{item.message}</Text>

          {role && (
            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: theme.textMuted }]}>Assigned as:</Text>
              <Text style={[styles.roleValue, { color: getRoleColor(role) }]}>
                {role.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {isInvite && !item.isRead && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.error + '15', borderWidth: 1, borderColor: theme.error + '50' }]} 
              onPress={() => declineInvite(item)}
              disabled={!!currentAction}
            >
              {currentAction === 'DECLINE' ? (
                <ActivityIndicator size="small" color={theme.error} />
              ) : (
                <Text style={[styles.declineBtnText, { color: theme.error }]}>Decline</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.primary }]} 
              onPress={() => acceptInvite(item)}
              disabled={!!currentAction}
            >
              {currentAction === 'ACCEPT' ? (
                <ActivityIndicator size="small" color={theme.background === '#09090B' ? '#052E16' : '#fff'} />
              ) : (
                <Text style={[styles.acceptBtnText, { color: theme.background === '#09090B' ? '#052E16' : '#ffffff' }]}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {!item.isRead && (
          <View style={[styles.unreadIndicator, { backgroundColor: typeColor }]} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>All Clear</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                No pending notifications or mission briefings.
              </Text>
            </View>
          ) : (
            <View style={[styles.emptyContainer]}>
              <ActivityIndicator color={theme.primary} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    padding: 0,
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
    textTransform: 'uppercase',
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  messageText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
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
  },
  roleValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'capitalize',
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
  acceptBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  declineBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
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
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
