import apiClient from '@/lib/axios';
import {
  Participant,
  ParticipantRole,
  SyncStatus,
  ApiResponse,
} from '@/types';

// ── Participant Management ────────────────────

export async function addParticipant(
  taskId: string,
  userId: string,
  role: ParticipantRole,
): Promise<Participant> {
  const { data } = await apiClient.post<ApiResponse<Participant>>(
    `/tasks/${taskId}/participants`,
    { userId, role },
  );
  return data.data;
}

// ── Sync Status & Responsibility ──────────────

export async function acceptResponsibility(
  taskId: string,
  userId: string,
): Promise<Participant> {
  const { data } = await apiClient.patch<ApiResponse<Participant>>(
    `/tasks/${taskId}/participants/${userId}/accept`,
  );
  return data.data;
}

export async function updateSyncStatus(
  taskId: string,
  userId: string,
  status: SyncStatus,
  note?: string,
): Promise<Participant> {
  const { data } = await apiClient.patch<ApiResponse<Participant>>(
    `/tasks/${taskId}/participants/${userId}/sync-status`,
    { status, note },
  );
  return data.data;
}
