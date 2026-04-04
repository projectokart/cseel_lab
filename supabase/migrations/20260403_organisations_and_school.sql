-- ============================================================
-- Migration: Organisations table
-- ============================================================

-- Separate organisations table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.organisations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  org_name     TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  pincode      TEXT,
  district     TEXT,
  state        TEXT,
  country      TEXT NOT NULL DEFAULT 'India',
  is_verified  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organisations visible to authenticated users"
  ON public.organisations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organisation can update own record"
  ON public.organisations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Organisation can insert own record"
  ON public.organisations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_organisations_user_id ON public.organisations(user_id);

-- NOTE: profiles.institution column already exists — no changes needed to profiles table
-- student/teacher ka selected organisation name wahan store hoga

-- ============================================================
-- Done
-- ============================================================
