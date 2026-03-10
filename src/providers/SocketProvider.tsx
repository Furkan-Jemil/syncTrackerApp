import React, { createContext, useContext, useEffect } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import useAuthStore from '@/stores/authStore';
import useNotificationStore from '@/stores/notificationStore';
import useTaskStore from '@/stores/taskStore';
import { useNotificationStore as useBannerStore } from '@/components/common/NotificationBanner';

const SocketContext = createContext<any>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore(s => s.user?.token);
  const userId = useAuthStore(s => s.user?.id);
  const addNotification = useNotificationStore(s => s.addNotification);
  const showBanner = useBannerStore(s => s.showNotification);
  const fetchTaskById = useTaskStore(s => s.fetchTaskById);

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      const socket = await connectSocket();
      
      socket.on('notification_received', (data: any) => {
        if (data.userId === userId) {
          addNotification(data.notification);
          showBanner(data.notification.message, 'INFO');
        }
      });

      socket.on('task_updated', (data: any) => {
         // Optionally refresh if something changed globally
      });

      socket.on('participant_assigned', (data: any) => {
        if (data.userId === userId) {
          showBanner(`New task assigned: ${data.taskTitle}`, 'URGENT');
        }
      });
    };

    init();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('notification_received');
        socket.off('task_updated');
        socket.off('participant_assigned');
      }
    };
  }, [token, userId]);

  return (
    <SocketContext.Provider value={{}}>
      {children}
    </SocketContext.Provider>
  );
};
