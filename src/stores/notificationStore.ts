import { create } from 'zustand';
import { Notification } from '@/types';
import apiClient from '@/lib/axios';
import { updateParticipantStatus, rejectTask as apiRejectTask } from '@/api/participants';
import useTaskStore from './taskStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  processingActions: Record<string, 'ACCEPT' | 'DECLINE' | undefined>;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearAll: () => void;
  acceptInvite: (notification: Notification) => Promise<void>;
  declineInvite: (notification: Notification) => Promise<void>;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  processingActions: {},

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get('/notifications?select=*,sender:sender_id(id,name,email,avatar_url)&order=created_at.desc');
      const rawNotifications = Array.isArray(data) ? data : data?.data || [];
      
      const notifications = rawNotifications.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        taskId: n.task_id,
        senderId: n.sender_id,
        sender: n.sender ? {
          id: n.sender.id,
          name: n.sender.name,
          email: n.sender.email,
          avatar_url: n.sender.avatar_url
        } : undefined,
        type: n.type,
        message: n.message,
        isRead: n.is_read,
        metadata: n.metadata,
        createdAt: n.created_at
      }));

      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      console.error('[NotificationStore] Failed to fetch notifications', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patch(`/notifications?id=eq.${id}`, { is_read: true });
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      const notifications = [notification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  acceptInvite: async (notification: Notification) => {
    set((state) => ({
      processingActions: { ...state.processingActions, [notification.id]: 'ACCEPT' }
    }));

    try {
      await updateParticipantStatus(notification.taskId, notification.userId, 'ACCEPTED');
      await apiClient.patch(`/notifications?id=eq.${notification.id}`, { is_read: true });
      
      // Remove from list after success
      set((state) => {
         const remaining = state.notifications.filter(n => n.id !== notification.id);
         return {
           notifications: remaining,
           unreadCount: remaining.filter(n => !n.isRead).length
         };
      });

      await useTaskStore.getState().fetchTasks();
    } catch (error) {
      console.error('Failed to accept invite', error);
    } finally {
      set((state) => {
        const next = { ...state.processingActions };
        delete next[notification.id];
        return { processingActions: next };
      });
    }
  },

  declineInvite: async (notification: Notification) => {
    set((state) => ({
      processingActions: { ...state.processingActions, [notification.id]: 'DECLINE' }
    }));

    try {
      await apiRejectTask(notification.taskId, notification.userId);
      await apiClient.patch(`/notifications?id=eq.${notification.id}`, { is_read: true });

      // Remove from list after success
      set((state) => {
        const remaining = state.notifications.filter(n => n.id !== notification.id);
        return {
          notifications: remaining,
          unreadCount: remaining.filter(n => !n.isRead).length
        };
      });
    } catch (error) {
      console.error('Failed to decline invite', error);
    } finally {
      set((state) => {
        const next = { ...state.processingActions };
        delete next[notification.id];
        return { processingActions: next };
      });
    }
  },
}));

export default useNotificationStore;
