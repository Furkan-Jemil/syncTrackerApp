import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '@/types';
import { TOKEN_KEY } from '@/lib/axios';
import { setSentryUser } from '@/lib/sentry';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: AuthUser) => {
    setSentryUser({ id: user.id, email: user.email, name: user.name });
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setSentryUser(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // Token exists — Phase 2 will call /auth/me here to hydrate user
      // For now, mark loading as done; navigation will handle routing
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
