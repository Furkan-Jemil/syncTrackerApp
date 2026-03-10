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
  const { data } = await apiClient.post(
    '/participants',
    { 
      task_id: taskId, 
      user_id: userId, 
      role,
      status: 'PENDING',
      sync_status: 'IN_SYNC'
    },
    { headers: { 'Prefer': 'return=representation' } }
  );
  const participant = Array.isArray(data) ? data[0] : data;
  return participant;
}

// ── Sync Status & Responsibility ──────────────

export async function updateParticipantStatus(
  taskId: string,
  userId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<Participant> {
  const { data } = await apiClient.patch(
    `/participants?task_id=eq.${taskId}&user_id=eq.${userId}`,
    { 
      status, 
      accepted_at: status === 'ACCEPTED' ? new Date().toISOString() : null 
    },
    { headers: { 'Prefer': 'return=representation' } }
  );
  const participant = Array.isArray(data) ? data[0] : data;
  return participant;
}

export async function rejectTask(taskId: string, userId: string): Promise<void> {
  await apiClient.delete(`/participants?task_id=eq.${taskId}&user_id=eq.${userId}`);
}

export async function updateParticipantRole(
  taskId: string,
  userId: string,
  role: ParticipantRole
): Promise<Participant> {
  const { data } = await apiClient.patch(
    `/participants?task_id=eq.${taskId}&user_id=eq.${userId}`,
    { role },
    { headers: { 'Prefer': 'return=representation' } }
  );
  return Array.isArray(data) ? data[0] : data;
}

export async function updateSyncStatus(
  taskId: string,
  userId: string,
  status: SyncStatus,
  note?: string,
): Promise<Participant> {
  const { data } = await apiClient.patch(
    `/participants?task_id=eq.${taskId}&user_id=eq.${userId}`,
    { 
      sync_status: status, 
      notes: note,
      last_sync_at: new Date().toISOString()
    },
    { headers: { 'Prefer': 'return=representation' } }
  );
  
  // Resilient synchronization logging
  try {
    await apiClient.post('/sync_logs', {
      task_id: taskId,
      user_id: userId,
      type: 'SYNC_STATUS_CHANGED',
      message: `${status.replace('_', ' ')}: ${note || 'No notes provided'}`,
    });
  } catch (logErr) {
    console.warn("Sync status updated, but log entry failed:", logErr);
  }

  const pRaw = Array.isArray(data) ? data[0] : data;
  return {
    ...pRaw,
    userId: pRaw.user_id,
    taskId: pRaw.task_id,
    syncStatus: pRaw.sync_status,
    acceptedAt: pRaw.accepted_at,
    lastSyncAt: pRaw.last_sync_at,
    totalTimeLogged: pRaw.total_time_logged,
    helpRequestCount: pRaw.help_request_count,
    createdAt: pRaw.created_at,
    updatedAt: pRaw.updated_at
  } as Participant;
}
