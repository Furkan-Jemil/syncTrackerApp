import apiClient from '@/lib/axios';
import useAuthStore from '@/stores/authStore';
import {
  Task,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import { CreateTaskFormValues } from '@/utils/schemas';

export async function getTasks(): Promise<Task[]> {
  const state = useAuthStore.getState();
  const userId = state.user?.id;
  
  if (!userId) return [];

  // Fetch tasks where the current user is a participant
  const { data } = await apiClient.get(`/tasks?select=id,participants!inner(user_id)&participants.user_id=eq.${userId}`);
  
  const tasksWithFilteredParticipants = Array.isArray(data) ? data : data?.data || [];
  if (tasksWithFilteredParticipants.length === 0) return [];

  const taskIds = tasksWithFilteredParticipants.map((t: any) => t.id).join(',');
  const selectStr = `id,title,description,status,createdAt:created_at,updatedAt:updated_at,
    assignedById:assigned_by_id,assignedBy:users!assigned_by_id(id,name,email,avatarUrl:avatar_url),
    responsibleOwnerId:responsible_owner_id,responsibleOwner:users!responsible_owner_id(id,name,email,avatarUrl:avatar_url),
    participants(id,userId:user_id,taskId:task_id,role,syncStatus:sync_status,status,acceptedAt:accepted_at,lastSyncAt:last_sync_at,totalTimeLogged:total_time_logged,helpRequestCount:help_request_count,notes,createdAt:created_at,updatedAt:updated_at,user:users(id,name,email,avatarUrl:avatar_url)),
    milestones(id,taskId:task_id,title,order,completedAt:completed_at,completedBy:completed_by,createdAt:created_at),
    attachments(id,taskId:task_id,userId:user_id,name,url,fileType:file_type,sizeBytes:size_bytes,createdAt:created_at)`;
    
  const { data: fullData } = await apiClient.get(`/tasks?id=in.(${taskIds})&select=${selectStr.replace(/\s/g, '')}`);
  
  return Array.isArray(fullData) ? fullData : fullData?.data || [];
}

export async function getTaskById(taskId: string): Promise<Task> {
  const selectStr = `id,title,description,status,createdAt:created_at,updatedAt:updated_at,
    assignedById:assigned_by_id,assignedBy:users!assigned_by_id(id,name,email,avatarUrl:avatar_url),
    responsibleOwnerId:responsible_owner_id,responsibleOwner:users!responsible_owner_id(id,name,email,avatarUrl:avatar_url),
    participants(id,userId:user_id,taskId:task_id,role,syncStatus:sync_status,status,acceptedAt:accepted_at,lastSyncAt:last_sync_at,totalTimeLogged:total_time_logged,helpRequestCount:help_request_count,notes,createdAt:created_at,updatedAt:updated_at,user:users(id,name,email,avatarUrl:avatar_url)),
    milestones(id,taskId:task_id,title,order,completedAt:completed_at,completedBy:completed_by,createdAt:created_at),
    attachments(id,taskId:task_id,userId:user_id,name,url,fileType:file_type,sizeBytes:size_bytes,createdAt:created_at)`;

  const { data } = await apiClient.get(`/tasks?id=eq.${taskId}&select=${selectStr.replace(/\s/g, '')}`);
  const task = Array.isArray(data) ? data[0] : data?.data?.[0] || data;
  return task;
}

export async function createTask(payload: CreateTaskFormValues): Promise<Task> {
  const state = useAuthStore.getState();
  const userId = state.user?.id;
  
  if (!userId) {
    throw new Error("You must be logged in to create a task.");
  }

  const supabasePayload = {
    title: payload.title,
    description: payload.description || null,
    assigned_by_id: userId,
    responsible_owner_id: userId,
    status: 'ACTIVE'
  };

  const { data } = await apiClient.post<Task[]>('/tasks', supabasePayload, {
    headers: { 'Prefer': 'return=representation' }
  });
  
  const createdTaskList = Array.isArray(data) ? data : (data as any).data || [];
  const createdTask = createdTaskList[0];

  if (!createdTask) {
    throw new Error("Task was not created successfully.");
  }

  // 1. Add Creator as RESPONSIBLE (ACCEPTED by default)
  await apiClient.post('/participants', {
    task_id: createdTask.id,
    user_id: userId,
    role: 'RESPONSIBLE',
    sync_status: 'IN_SYNC',
    status: 'ACCEPTED',
    accepted_at: new Date().toISOString()
  });

  // 2. Add other participants (PENDING) - Filter out the creator to avoid duplicate key errors
  const otherParticipants = (payload.participants || []).filter(p => p.userId !== userId);
  
  if (otherParticipants.length > 0) {
    const participantPromises = otherParticipants.map(p => 
      apiClient.post('/participants', {
        task_id: createdTask.id,
        user_id: p.userId,
        role: p.role,
        sync_status: 'IN_SYNC',
        status: 'PENDING'
      })
    );
    await Promise.all(participantPromises);
  }

  // 3. Add Milestones
  if (payload.milestones && payload.milestones.length > 0) {
    const milestonePromises = payload.milestones.map((m, index) => 
      apiClient.post('/milestones', {
        task_id: createdTask.id,
        title: m.title,
        order: index
      })
    );
    await Promise.all(milestonePromises);
  }

  // 4. Create Notifications for each participant
  if (otherParticipants.length > 0) {
    try {
      const notificationPromises = otherParticipants.map(p => 
        apiClient.post('/notifications', {
          user_id: p.userId,
          task_id: createdTask.id,
          sender_id: userId,
          type: 'TASK_ASSIGNED',
          message: `${state.user?.name || 'Someone'} assigned you to: ${createdTask.title}`,
          is_read: false,
          metadata: { role: p.role }
        })
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.warn("Task created, but notifications failed to send:", notifErr);
      // We don't throw here so the user sees the task as created
    }
  }
  
  // Return the full task object by re-fetching (simplest way to get all relations)
  return await getTaskById(createdTask.id);
}

export async function updateTask(taskId: string, payload: CreateTaskFormValues): Promise<Task> {
  // 1. Update task basic info
  await apiClient.patch(`/tasks?id=eq.${taskId}`, {
    title: payload.title,
    description: payload.description
  });

  // 2. Clear and recreate milestones for simplicity in this prototype
  await apiClient.delete(`/milestones?task_id=eq.${taskId}`);
  if (payload.milestones && payload.milestones.length > 0) {
    const milestonePromises = payload.milestones.map((m, index) => 
      apiClient.post('/milestones', {
        task_id: taskId,
        title: m.title,
        order: index
      })
    );
    await Promise.all(milestonePromises);
  }

  return await getTaskById(taskId);
}

export async function submitWork(taskId: string, userId: string, notes: string, attachments?: { name: string, url: string, fileType: string, sizeBytes?: number }[]): Promise<void> {
  // 1. Update task status to IN_REVIEW
  await apiClient.patch(`/tasks?id=eq.${taskId}`, { status: 'IN_REVIEW' });

  // 2. Create Attachment entry for notes if provided
  if (notes) {
    await apiClient.post('/attachments', {
      task_id: taskId,
      user_id: userId,
      name: 'Submission Notes',
      file_type: 'notes',
      url: notes
    });
  }

  // 3. Create records for each uploaded file
  if (attachments && attachments.length > 0) {
    const attachmentPromises = attachments.map(att => 
      apiClient.post('/attachments', {
        task_id: taskId,
        user_id: userId,
        name: att.name,
        url: att.url,
        file_type: att.fileType,
        size_bytes: att.sizeBytes
      })
    );
    await Promise.all(attachmentPromises);
  }
}

export async function reviewTask(taskId: string, reviewerId: string, status: 'COMPLETED' | 'ACTIVE', feedback: string): Promise<void> {
  // 1. Update task status
  await apiClient.patch(`/tasks?id=eq.${taskId}`, { status: status });

  // 2. Add feedback to attachments/logs (simplified)
  await apiClient.post('/attachments', {
    task_id: taskId,
    user_id: reviewerId, // Fixed: was uploaded_by_id
    name: 'Review Feedback',
    file_type: 'feedback',
    url: feedback
  });
}
