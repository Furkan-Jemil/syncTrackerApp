import { create } from 'zustand';
import { Notification } from '@/types';
import apiClient from '@/lib/axios';
import { updateParticipantStatus, rejectTask as apiRejectTask } from '@/api/participants';
import useTaskStore from './taskStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  processingIds: Set<string>;

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
  processingIds: new Set<string>(),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get('/notifications?order=created_at.desc');
      const rawNotifications = Array.isArray(data) ? data : data?.data || [];
      
      const notifications = rawNotifications.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        taskId: n.task_id,
        senderId: n.sender_id,
        type: n.type,
        message: n.message,
        isRead: n.is_read,
        metadata: n.metadata,
        createdAt: n.created_at
      }));

      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      console.error('[NotificationStore] Failed to fetch notifications', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseUrl: error.config?.baseURL
      });
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
    const { processingIds } = get();
    const nextProcessing = new Set(processingIds);
    nextProcessing.add(notification.id);
    set({ processingIds: nextProcessing });

    try {
      await updateParticipantStatus(notification.taskId, notification.userId, 'ACCEPTED');
      await get().markAsRead(notification.id);
      await useTaskStore.getState().fetchTasks();
    } catch (error) {
      console.error('Failed to accept invite', error);
    } finally {
      const cleaned = new Set(get().processingIds);
      cleaned.delete(notification.id);
      set({ processingIds: cleaned });
    }
  },

  declineInvite: async (notification: Notification) => {
    const { processingIds } = get();
    const nextProcessing = new Set(processingIds);
    nextProcessing.add(notification.id);
    set({ processingIds: nextProcessing });

    try {
      await apiRejectTask(notification.taskId, notification.userId);
      await get().markAsRead(notification.id);
    } catch (error) {
      console.error('Failed to decline invite', error);
    } finally {
      const cleaned = new Set(get().processingIds);
      cleaned.delete(notification.id);
      set({ processingIds: cleaned });
    }
  },
}));

export default useNotificationStore;
