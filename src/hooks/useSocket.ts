import { useEffect, useState } from 'react';
import { getSocket, connectSocket, joinTaskRoom, leaveTaskRoom } from '@/lib/socket';
import useAuthStore from '@/stores/authStore';

export function useSocket(taskId?: string) {
  const token = useAuthStore(s => s.user?.token);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isSubscribed = true;
    
    const initSocket = async () => {
      const socket = await connectSocket();
      if (!isSubscribed) return;

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      setIsConnected(socket.connected);
    };

    initSocket();

    return () => {
      isSubscribed = false;
      const socket = getSocket();
      if (socket) {
        // We only remove listeners to avoid memory leaks, socket connection persists
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [token]);

  // Handle task room joining
  useEffect(() => {
    if (taskId && isConnected) {
      joinTaskRoom(taskId);
      return () => {
        leaveTaskRoom(taskId);
      };
    }
  }, [taskId, isConnected]);

  return { socket: getSocket(), isConnected };
}
