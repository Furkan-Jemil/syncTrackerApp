import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthUser, LoginPayload, RegisterPayload } from '@/types';
import { TOKEN_KEY } from '@/lib/axios';
import { setSentryUser } from '@/lib/sentry';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, resendConfirmation as apiResendConfirmation } from '@/api/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
  updateUser: (userUpdates: Partial<AuthUser>) => void;
  resendConfirmation: (email: string) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (payload: LoginPayload) => {
    set({ error: null });
    const user = await apiLogin(payload);
    setSentryUser({ id: user.id, email: user.email, name: user.name });
    set({ user, isAuthenticated: true });
  },

  register: async (payload: RegisterPayload) => {
    set({ error: null });
    const user = await apiRegister(payload);
    
    // Only set as authenticated if we actually have an access token (Supabase might require confirmation)
    if (user.token) {
      setSentryUser({ id: user.id, email: user.email, name: user.name });
      set({ user, isAuthenticated: true });
    } else {
      // If no token, user is created but needs verification — don't log them in yet
      throw new Error("Account created! Please check your email for a verification link.");
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {
      // Ensure local session is always cleared even if server call fails
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    setSentryUser(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await getMe();
      setSentryUser({ id: user.id, email: user.email, name: user.name });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (userUpdates: Partial<AuthUser>) => 
    set((state) => ({
      user: state.user ? { ...state.user, ...userUpdates } : null
    })),

  resendConfirmation: async (email: string) => {
    await apiResendConfirmation(email);
  },
}));

export default useAuthStore;
