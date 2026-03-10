-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 10: Profile Extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add bio column to users table
alter table public.users 
add column if not exists bio text;

-- Informational: This allows users to store their operational focus/bio
-- which is now supported in the ProfileEditScreen.
