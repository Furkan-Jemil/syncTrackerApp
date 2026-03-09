// ─────────────────────────────────────────────
//  SyncTracker – Core Type Definitions
// ─────────────────────────────────────────────

// ── Sync Status ─────────────────────────────
export type SyncStatus =
  | 'IN_SYNC'
  | 'NEEDS_UPDATE'
  | 'BLOCKED'
  | 'HELP_REQUESTED';

// ── Participant Roles ────────────────────────
export type ParticipantRole =
  | 'ASSIGNER'
  | 'RESPONSIBLE'
  | 'CONTRIBUTOR'
  | 'HELPER'
  | 'REVIEWER'
  | 'OBSERVER';

// ── User ─────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// ── Participant ───────────────────────────────
export interface Participant {
  id: string;
  userId: string;
  user: User;
  taskId: string;
  role: ParticipantRole;
  syncStatus: SyncStatus;
  acceptedAt?: string | null;
  lastSyncAt?: string | null;
  totalTimeLogged: number; // minutes
  helpRequestCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Milestone ─────────────────────────────────
export interface Milestone {
  id: string;
  taskId: string;
  title: string;
  order: number;
  completedAt?: string | null;
  completedBy?: string | null;
  createdAt: string;
}

// ── Time Entry ────────────────────────────────
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  durationMinutes: number;
  description?: string;
  loggedAt: string;
}

// ── Sync Log ──────────────────────────────────
export type SyncLogType =
  | 'RESPONSIBILITY_ACCEPTED'
  | 'PARTICIPANT_JOINED'
  | 'SYNC_STATUS_CHANGED'
  | 'HELP_REQUESTED'
  | 'MILESTONE_COMPLETED'
  | 'TIME_LOGGED'
  | 'RESPONSIBILITY_TRANSFERRED'
  | 'NOTE_ADDED';

export interface SyncLog {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  type: SyncLogType;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ── Task ──────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedById: string;
  assignedBy: User;
  responsibleOwnerId: string;
  responsibleOwner: User;
  participants: Participant[];
  milestones: Milestone[];
  syncLogs: SyncLog[];
  timeEntries: TimeEntry[];
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// ── API Response Wrappers ─────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Auth Payloads ─────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ── Socket Events ─────────────────────────────
export interface SyncStatusChangedEvent {
  taskId: string;
  userId: string;
  oldStatus: SyncStatus;
  newStatus: SyncStatus;
}

export interface ParticipantJoinedEvent {
  taskId: string;
  participant: Participant;
}

export interface HelpRequestedEvent {
  taskId: string;
  userId: string;
  user: User;
}

export interface MilestoneCompletedEvent {
  taskId: string;
  milestone: Milestone;
  completedBy: User;
}

export interface ResponsibilityTransferredEvent {
  taskId: string;
  fromUser: User;
  toUser: User;
}

// ── Color Map Helpers ─────────────────────────
export const SYNC_STATUS_COLORS: Record<SyncStatus, string> = {
  IN_SYNC: '#22c55e',
  NEEDS_UPDATE: '#eab308',
  BLOCKED: '#ef4444',
  HELP_REQUESTED: '#3b82f6',
};

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  IN_SYNC: 'In Sync',
  NEEDS_UPDATE: 'Needs Update',
  BLOCKED: 'Blocked',
  HELP_REQUESTED: 'Help Requested',
};

export const ROLE_LABELS: Record<ParticipantRole, string> = {
  ASSIGNER: 'Assigner',
  RESPONSIBLE: 'Responsible',
  CONTRIBUTOR: 'Contributor',
  HELPER: 'Helper',
  REVIEWER: 'Reviewer',
  OBSERVER: 'Observer',
};
