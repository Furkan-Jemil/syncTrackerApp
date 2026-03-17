import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useNotificationStore from '@/stores/notificationStore';
import Header from '@/components/common/Header';
import { useAppTheme } from '@/hooks/useAppTheme';
import { NotificationType, ROLE_LABELS, ROLE_COLORS, ParticipantRole } from '@/types';

export default function ActivityFeedScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getSenderRole = (type: NotificationType): ParticipantRole => {
    switch (type) {
      case 'TASK_ASSIGNED': return 'ASSIGNER';
      case 'TASK_ACCEPTED': 
      case 'TASK_COMPLETED':
      case 'REVIEW_REQUESTED': return 'RESPONSIBLE';
      case 'HELPER_ACCEPTED': return 'HELPER';
      case 'HELPER_REQUESTED': return 'RESPONSIBLE';
      case 'CHANGES_REQUESTED': return 'REVIEWER';
      default: return 'CONTRIBUTOR';
    }
  };

  const handleNotificationPress = (notification: any) => {
    markAsRead(notification.id);
    if (notification.taskId) {
      navigation.navigate('TasksStack', { 
        screen: 'TaskDetail', 
        params: { taskId: notification.taskId } 
      });
    }
  };

  const getIcon = (type: string) => {
    if (type?.includes('ASSIGN')) return '📋';
    if (type?.includes('ACCEPT')) return '✅';
    if (type?.includes('SUBMIT') || type?.includes('WORK')) return '📤';
    if (type?.includes('REVIEW') || type?.includes('APPROV')) return '👁️';
    if (type?.includes('HELP')) return '🆘';
    if (type?.includes('COMPLETE')) return '🏆';
    return '🔔';
  };

  const renderNotification = ({ item }: { item: any }) => {
    const role = getSenderRole(item.type);
    const roleLabel = ROLE_LABELS[role];
    const roleColor = ROLE_COLORS[role];
    const isOwner = role === 'RESPONSIBLE' || role === 'ASSIGNER';

    return (
      <TouchableOpacity 
        style={[
          styles.notifCard, 
          { backgroundColor: theme.surface, borderColor: theme.border },
          !item.isRead && { borderColor: theme.primary, backgroundColor: theme.primaryMuted }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
          <Text style={styles.notifIcon}>
            {getIcon(item.type)}
          </Text>
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '20', borderColor: roleColor }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>
                {isOwner && role === 'RESPONSIBLE' ? 'OWNER' : roleLabel}
              </Text>
            </View>
            <Text style={[styles.notifTime, { color: theme.textMuted }]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={[styles.notifMessage, { color: theme.text }]}>{item.message}</Text>
        </View>
        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Activity Feed" />
      
      {isLoading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>🔔</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up!</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No notifications yet.</Text>
            </View>
          }
          onRefresh={fetchNotifications}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notifIcon: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  notifMessage: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  notifTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  empty: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
