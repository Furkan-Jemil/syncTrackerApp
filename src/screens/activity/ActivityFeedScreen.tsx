import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useNotificationStore from '@/stores/notificationStore';
import Header from '@/components/common/Header';

export default function ActivityFeedScreen() {
  const navigation = useNavigation<any>();
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: any) => {
    markAsRead(notification.id);
    if (notification.taskId) {
      navigation.navigate('Tasks', { 
        screen: 'TaskDetail', 
        params: { taskId: notification.taskId } 
      });
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notifCard, !item.isRead && styles.notifUnread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.notifIcon}>
          {item.type.includes('ASSIGN') ? '📋' : 
           item.type.includes('ACCEPT') ? '✅' :
           item.type.includes('HELP') ? '🆘' : '🔔'}
        </Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.notifTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Activity Feed" />
      
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#A3E635" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
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
  container: { flex: 1, backgroundColor: '#09090B' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  notifUnread: {
    borderColor: '#A3E635',
    backgroundColor: 'rgba(163, 230, 53, 0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifIcon: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifMessage: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  notifTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3E635',
    marginLeft: 8,
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    fontSize: 14,
  },
});
