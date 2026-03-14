import apiClient from "@/lib/axios";
import { User } from "@/types";
import * as FileSystem from "expo-file-system";

export async function searchUsers(query: string): Promise<User[]> {
  if (!query || query.length < 2) return [];

  const { data } = await apiClient.get(
    `/users?or=(name.ilike.*${query}*,email.ilike.*${query}*)&select=id,name,email,avatar_url,createdAt:created_at`,
  );
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getUserById(userId: string): Promise<User> {
  const { data } = await apiClient.get(
    `/users?id=eq.${userId}&select=id,name,email,avatar_url,createdAt:created_at`,
  );
  const user = Array.isArray(data) ? data[0] : data?.data?.[0] || data;
  return user;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get(
    "/users?limit=50&select=id,name,email,avatar_url,createdAt:created_at",
  );
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getUserStats(userId: string) {
  try {
    // Determine Tasks Responsible
    const resRespons = await apiClient.get(
      `/participants?user_id=eq.${userId}&role=eq.RESPONSIBLE`,
      {
        headers: { Prefer: "count=exact", "Range-Unit": "items", Range: "0-0" },
      },
    );
    // Check if count exists in headers, fallback to array length if small
    const tasksResponsible = parseInt(
      resRespons.headers["content-range"]?.split("/")[1] || "0",
      10,
    );

    // Determine Tasks Contributed (roles other than RESPONSIBLE)
    const resContrib = await apiClient.get(
      `/participants?user_id=eq.${userId}&role=neq.RESPONSIBLE`,
      {
        headers: { Prefer: "count=exact", "Range-Unit": "items", Range: "0-0" },
      },
    );
    const tasksContributed = parseInt(
      resContrib.headers["content-range"]?.split("/")[1] || "0",
      10,
    );

    // Determine Time Logged (sum of duration)
    // If the query fails (400) we swallow and treat as zero. RLS may block non-participants.
    let timeLogged = 0;
    try {
      const { data: timesData } = await apiClient.get(
        `/time_entries?user_id=eq.${userId}&select=duration`,
      );
      timeLogged = Array.isArray(timesData)
        ? timesData.reduce((acc, curr) => acc + (curr.duration || 0), 0)
        : 0;
    } catch (innerErr: any) {
      // ignore specific 400s; they are logged by axios interceptor but don't break stats
      console.warn(
        "Unable to fetch time entries for user",
        userId,
        innerErr?.response?.status,
      );
      timeLogged = 0;
    }

    // Determine milestones hit (completed milestones in tasks where user is a participant)
    const { data: milestonesData } = await apiClient.get(
      `/milestones?completed_by=eq.${userId}`,
      {
        headers: { Prefer: "count=exact", "Range-Unit": "items", Range: "0-0" },
      },
    );
    const milestonesHit = parseInt(
      milestonesData.headers?.["content-range"]?.split("/")[1] || "0",
      10,
    );

    return {
      tasksResponsible:
        tasksResponsible ||
        (Array.isArray(resRespons.data) ? resRespons.data.length : 0),
      tasksContributed:
        tasksContributed ||
        (Array.isArray(resContrib.data) ? resContrib.data.length : 0),
      timeLogged,
      milestonesHit:
        milestonesHit ||
        (Array.isArray(milestonesData) ? milestonesData.length : 0),
    };
  } catch (error) {
    console.warn("Failed to fetch user stats", error);
    return {
      tasksResponsible: 0,
      tasksContributed: 0,
      timeLogged: 0,
      milestonesHit: 0,
    };
  }
}

export async function uploadAvatar(
  userId: string,
  imageUri: string,
): Promise<string> {
  const filename = imageUri.split("/").pop() || `avatar-${userId}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  // Determine Supabase credentials
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase configuration missing");
  }

  try {
    const uploadPath = `${userId}-${Date.now()}.jpg`;

    // 1. Upload using FileSystem to bypass RN fetch blob issues
    const storageRes = await FileSystem.uploadAsync(
      `${supabaseUrl}/storage/v1/object/avatars/${uploadPath}`,
      imageUri,
      {
        httpMethod: "POST",
        uploadType: "binaryContent" as any,
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": type,
        },
      },
    );

    if (storageRes.status !== 200) {
      console.error("Storage upload failed", storageRes.body);
      throw new Error(`Failed to upload image to storage: ${storageRes.body}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${uploadPath}`;

    // 2. Patch the user row directly with the new URL
    await apiClient.patch(`/users?id=eq.${userId}`, {
      avatar_url: publicUrl,
    });

    return publicUrl;
  } catch (error) {
    console.error("uploadAvatar error:", error);
    throw error;
  }
}
