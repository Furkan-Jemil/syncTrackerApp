import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import apiClient, { TOKEN_KEY } from '@/lib/axios';
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '@/types';

const AUTH_BASE_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1`;
const API_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Sync public user profile ──────────────────
async function syncUserProfile(user: AuthUser) {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    await apiClient.post(
      '/users',
      {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
      },
      {
        headers: {
          Authorization: `Bearer ${token || user.token}`,
          Prefer: 'resolution=merge-duplicates'
        }
      }
    );
  } catch (err) {
    console.warn("Failed to sync user profile. Foreign keys may fail.", err);
  }
}

// ── Login ─────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthUser> {
  // Hit Supabase GoTrue /token endpoint
  const { data } = await apiClient.post(
    `${AUTH_BASE_URL}/token?grant_type=password`,
    {
      email: payload.email,
      password: payload.password,
    },
    { headers: { apikey: API_KEY } } // Override to ensure apikey is present
  );
  
  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name || 'User',
    token: data.access_token,
    createdAt: data.user.created_at,
  };
  
  await SecureStore.setItemAsync(TOKEN_KEY, user.token);
  await syncUserProfile(user);
  return user;
}

// ── Register ──────────────────────────────────
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  // Hit Supabase GoTrue /signup endpoint
  const { data } = await apiClient.post(
    `${AUTH_BASE_URL}/signup`,
    {
      email: payload.email,
      password: payload.password,
      data: { name: payload.name }, // Store name in user_metadata
    },
    { headers: { apikey: API_KEY } }
  );

  // Note: Depending on identity linking and email confirmation settings,
  // Supabase either returns `{ access_token, user }` or simply `{ id, email, ... }`
  const user: AuthUser = {
    id: data.user?.id || data.id,
    email: data.user?.email || data.email,
    name: data.user?.user_metadata?.name || data.user_metadata?.name || payload.name,
    token: data.access_token || '', 
    createdAt: data.user?.created_at || data.created_at,
  };

  if (user.token) {
    await SecureStore.setItemAsync(TOKEN_KEY, user.token);
    await syncUserProfile(user);
  }
  return user;
}

// ── Logout ────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    await apiClient.post(
      `${AUTH_BASE_URL}/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}`, apikey: API_KEY } }
    );
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ── Get current user (session restore) ───────
export async function getMe(): Promise<AuthUser> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  
  // Hit Supabase /user endpoint
  const { data } = await apiClient.get(
    `${AUTH_BASE_URL}/user`,
    { headers: { Authorization: `Bearer ${token}`, apikey: API_KEY } }
  );

  const userContext: AuthUser = {
    id: data.id,
    email: data.email,
    name: data.user_metadata?.name || data.user_metadata?.full_name || 'User',
    token: token || '',
    createdAt: data.created_at,
  };
  
  await syncUserProfile(userContext);
  return userContext;
}

// ── Resend Confirmation ───────────────────────
export async function resendConfirmation(email: string): Promise<void> {
  await apiClient.post(
    `${AUTH_BASE_URL}/resend`,
    {
      email,
      type: 'signup'
    },
    { headers: { apikey: API_KEY } }
  );
}

// ── Google OAuth ──────────────────────────────
export async function loginWithGoogle(): Promise<AuthUser> {
  try {
    // Check if Play Services are available (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch (e: any) {
    console.error('Google Sign-in Play Services error:', e.message);
    throw new Error('Google Sign-in failed: Play Services unavailable.');
  }
  
  // Trigger Google sign-in flow
  const response = await GoogleSignin.signIn();
  const idToken = response?.data?.idToken;
  
  if (!idToken) {
    throw new Error('Google sign-in failed: no ID token returned.');
  }

  // Exchange Google ID token with Supabase GoTrue
  const { data } = await apiClient.post(
    `${AUTH_BASE_URL}/token?grant_type=id_token`,
    {
      provider: 'google',
      id_token: idToken,
    },
    { headers: { apikey: API_KEY } }
  );

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
    token: data.access_token,
    createdAt: data.user.created_at,
    avatar_url: data.user.user_metadata?.avatar_url,
  };

  await SecureStore.setItemAsync(TOKEN_KEY, user.token);
  await syncUserProfile(user);
  return user;
}
