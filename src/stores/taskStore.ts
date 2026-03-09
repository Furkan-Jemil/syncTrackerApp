import { create } from 'zustand';
import { Task, SyncStatus, SyncStatusChangedEvent } from '@/types';
import { getTasks, getTaskById } from '@/api/tasks';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  clearSelectedTask: () => void;
  
  // Optimistic updates
  updateTaskInList: (task: Task) => void;
  updateSyncStatusOptimistic: (taskId: string, userId: string, status: SyncStatus) => void;
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
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch task', isLoading: false });
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
      // Helper to update participant inside a task
      const updateParticipants = (task: Task) => ({
        ...task,
        participants: task.participants.map(p => 
          p.userId === userId ? { ...p, syncStatus: status } : p
        )
      });

      return {
        tasks: state.tasks.map(t => t.id === taskId ? updateParticipants(t) : t),
        selectedTask: state.selectedTask?.id === taskId ? updateParticipants(state.selectedTask) : state.selectedTask
      };
    });
  }
}));

export default useTaskStore;
