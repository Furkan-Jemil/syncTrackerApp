import { z } from 'zod';

// ── Login ─────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .toLowerCase()
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Register ──────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .trim()
      .toLowerCase()
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Sync Status Update ────────────────────────
export const syncStatusSchema = z.object({
  status: z.enum(['IN_SYNC', 'NEEDS_UPDATE', 'BLOCKED', 'HELP_REQUESTED']),
  note: z.string().max(300, 'Note is too long').optional(),
});

export type SyncStatusFormValues = z.infer<typeof syncStatusSchema>;

// ── Time Log ──────────────────────────────────
export const timeLogSchema = z.object({
  durationMinutes: z
    .number({ message: 'Enter a valid number' })
    .min(1, 'Minimum 1 minute')
    .max(1440, 'Maximum 24 hours'),
  description: z.string().max(300, 'Description is too long').optional(),
});

export type TimeLogFormValues = z.infer<typeof timeLogSchema>;

// ── Create Task ───────────────────────────────
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  participants: z.array(z.object({
    userId: z.string(),
    role: z.enum(['CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER']),
  })),
  milestones: z.array(z.object({
    title: z.string().min(1, 'Milestone title is required'),
  })),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
