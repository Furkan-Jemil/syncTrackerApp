import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// Storage adapter for Expo SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    assignments: boolean;
  };
  team: {
    showCollaborators: boolean;
  };
  
  // Actions
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  updateNotifications: (updates: Partial<SettingsState['notifications']>) => void;
  updateTeamSettings: (updates: Partial<SettingsState['team']>) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      notifications: {
        push: true,
        email: false,
        assignments: true,
      },
      team: {
        showCollaborators: true,
      },

      setTheme: (theme) => set({ theme }),
      updateNotifications: (updates) => 
        set((state) => ({ 
          notifications: { ...state.notifications, ...updates } 
        })),
      updateTeamSettings: (updates) => 
        set((state) => ({ 
          team: { ...state.team, ...updates } 
        })),
    }),
    {
      name: 'sync-tracker-settings',
      storage: createJSONStorage(() => secureStorage as any),
    }
  )
);

export default useSettingsStore;
