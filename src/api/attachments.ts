import apiClient from '@/lib/axios';
import * as FileSystem from 'expo-file-system';

export interface AttachmentPayload {
  task_id: string;
  user_id: string;
  name: string;
  url: string;
  file_type: string;
  size_bytes?: number;
}

export async function uploadAttachmentToStorage(fileUri: string, fileName: string): Promise<string> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase configuration missing');
  }

  const uploadPath = `task-assets/${Date.now()}-${fileName}`;
  const match = /\.(\w+)$/.exec(fileName);
  const type = match ? `application/${match[1]}` : `application/octet-stream`;

  try {
    const storageRes = await FileSystem.uploadAsync(
      `${supabaseUrl}/storage/v1/object/attachments/${uploadPath}`,
      fileUri,
      {
        httpMethod: 'POST',
        uploadType: 'binaryContent' as any,
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': type,
        }
      }
    );

    if (storageRes.status !== 200) {
      throw new Error(`Upload failed: ${storageRes.body}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/attachments/${uploadPath}`;
  } catch (error) {
    console.error("uploadAttachmentToStorage error:", error);
    throw error;
  }
}

export async function createAttachmentRecord(payload: AttachmentPayload): Promise<void> {
  await apiClient.post('/attachments', payload);
}
