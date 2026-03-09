import { create } from 'zustand';
import { SyncStatus } from '@/types';

interface SyncStoreState {
  // Map of taskId -> { userId: SyncStatus }
  liveStatuses: Record<string, Record<string, SyncStatus>>;

  // Actions
  initializeStatuses: (taskId: string, participants: { userId: string; syncStatus: SyncStatus }[]) => void;
  updateStatus: (taskId: string, userId: string, status: SyncStatus) => void;
  getTaskStatuses: (taskId: string) => Record<string, SyncStatus>;
}

/**
 * syncStore manages the *live* ephemeral state of sync statuses.
 * It is hydrated on task load, and then updated strictly by Socket events or optimistic local actions.
 * The graph and tree components read directly from here for fast re-renders.
 */
const useSyncStore = create<SyncStoreState>((set, get) => ({
  liveStatuses: {},

  initializeStatuses: (taskId, participants) => {
    const statusMap = participants.reduce((acc, p) => {
      acc[p.userId] = p.syncStatus;
      return acc;
    }, {} as Record<string, SyncStatus>);

    set((state) => ({
      liveStatuses: {
        ...state.liveStatuses,
        [taskId]: statusMap,
      },
    }));
  },

  updateStatus: (taskId, userId, status) => {
    set((state) => ({
      liveStatuses: {
        ...state.liveStatuses,
        [taskId]: {
          ...(state.liveStatuses[taskId] || {}),
          [userId]: status,
        },
      },
    }));
  },

  getTaskStatuses: (taskId) => {
    return get().liveStatuses[taskId] || {};
  },
}));

export default useSyncStore;
