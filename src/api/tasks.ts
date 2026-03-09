import apiClient from '@/lib/axios';
import {
  Task,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import { CreateTaskFormValues } from '@/utils/schemas';

export async function getTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks');
  return data.data; // Note: In Phase 3, we simplify pagination for UI prototyping
}

export async function getTaskById(taskId: string): Promise<Task> {
  const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
  return data.data;
}

export async function createTask(payload: CreateTaskFormValues): Promise<Task> {
  const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
  return data.data;
}
