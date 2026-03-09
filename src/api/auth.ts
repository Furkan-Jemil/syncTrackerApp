import * as SecureStore from 'expo-secure-store';
import apiClient, { TOKEN_KEY } from '@/lib/axios';
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ApiResponse,
} from '@/types';

// ── Login ─────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>(
    '/auth/login',
    payload,
  );
  const user = data.data;
  await SecureStore.setItemAsync(TOKEN_KEY, user.token);
  return user;
}

// ── Register ──────────────────────────────────
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>(
    '/auth/register',
    payload,
  );
  const user = data.data;
  await SecureStore.setItemAsync(TOKEN_KEY, user.token);
  return user;
}

// ── Logout ────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ── Get current user (session restore) ───────
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return data.data;
}
