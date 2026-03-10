import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from './axios';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

// ── Connect & authenticate ────────────────────
export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync(TOKEN_KEY);

  // Supabase URLs don't support Socket.IO (they use Supabase Realtime/Websockets)
  if (SOCKET_URL.includes('supabase.co')) {
    console.warn('[Socket] Disabling Socket.IO connection as Supabase does not support it natively.');
    return {} as any; 
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
}

// ── Disconnect ────────────────────────────────
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ── Get current socket instance ───────────────
export function getSocket(): Socket | null {
  return socket;
}

// ── Join / leave task room ────────────────────
export function joinTaskRoom(taskId: string): void {
  socket?.emit('join_task', { taskId });
}

export function leaveTaskRoom(taskId: string): void {
  socket?.emit('leave_task', { taskId });
}
