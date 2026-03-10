import { create } from 'zustand';
import { Task, SyncStatus, SyncStatusChangedEvent } from '@/types';
import useAuthStore from './authStore';
import { getTasks, getTaskById, submitWork, reviewTask } from '@/api/tasks';
import { updateParticipantStatus as apiUpdateParticipantStatus } from '@/api/participants';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  clearSelectedTask: () => void;
  
  // Participant & Workflow Actions
  updateParticipantStatus: (taskId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
  submitWork: (taskId: string, userId: string, notes: string, attachments?: { name: string, url: string, fileType: string, sizeBytes?: number }[]) => Promise<void>;
  reviewTask: (taskId: string, status: 'COMPLETED' | 'ACTIVE', feedback?: string) => Promise<void>;
  
  // Optimistic updates
  updateTaskInList: (task: Task) => void;
  updateSyncStatusOptimistic: (taskId: string, userId: string, status: SyncStatus) => void;
  updateParticipantStatusOptimistic: (taskId: string, userId: string, status: any) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await getTasks();
      set({ tasks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchTaskById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const task = await getTaskById(id);
      set({ selectedTask: task, isLoading: false });
      return task;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch task', isLoading: false });
      return null;
    }
  },

  clearSelectedTask: () => set({ selectedTask: null }),

  updateTaskInList: (updatedTask: Task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      selectedTask: state.selectedTask?.id === updatedTask.id ? updatedTask : state.selectedTask,
    }));
  },

  updateSyncStatusOptimistic: (taskId: string, userId: string, status: SyncStatus) => {
    set((state) => {
      const updateParticipants = (task: Task) => ({
        ...task,
        participants: (task.participants || []).map(p => 
          p.userId === userId ? { ...p, syncStatus: status } : p
        )
      });

      return {
        tasks: state.tasks.map(t => t.id === taskId ? updateParticipants(t) : t),
        selectedTask: state.selectedTask?.id === taskId ? updateParticipants(state.selectedTask) : state.selectedTask
      };
    });
  },

  updateParticipantStatusOptimistic: (taskId: string, userId: string, status: any) => {
    set((state) => {
      const updateParticipants = (task: Task) => ({
        ...task,
        participants: (task.participants || []).map(p => 
          p.userId === userId ? { ...p, status } : p
        )
      });

      return {
        tasks: state.tasks.map(t => t.id === taskId ? updateParticipants(t) : t),
        selectedTask: state.selectedTask?.id === taskId ? updateParticipants(state.selectedTask) : state.selectedTask
      };
    });
  },

  updateParticipantStatus: async (taskId, userId, status) => {
    await apiUpdateParticipantStatus(taskId, userId, status);
    get().updateParticipantStatusOptimistic(taskId, userId, status);
  },

  submitWork: async (taskId, userId, notes, attachments = []) => {
    set({ isLoading: true });
    try {
      await submitWork(taskId, userId, notes, attachments);
      await get().fetchTaskById(taskId);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  reviewTask: async (taskId, status, feedback = '') => {
    set({ isLoading: true });
    try {
      const reviewerId = useAuthStore.getState().user?.id;
      if (!reviewerId) throw new Error("No reviewer ID");
      await reviewTask(taskId, reviewerId, status, feedback);
      await get().fetchTaskById(taskId);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useTaskStore;
