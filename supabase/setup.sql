-- =====================================================================
-- MOVIFASHION AI: Setup Tables for Vercel + Supabase
-- Run this script in the Supabase SQL Editor
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: app_users
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('cliente', 'admin')) DEFAULT 'cliente',
    preferences JSONB DEFAULT '{"style": "minimalista", "favoriteCategories": ["Zapatos", "Chaquetas"], "typicalBudget": 250000}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookup on login
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);

-- 2. Table: app_orders
CREATE TABLE IF NOT EXISTS public.app_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user orders lookup
CREATE INDEX IF NOT EXISTS idx_app_orders_user_id ON public.app_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_app_orders_created_at ON public.app_orders(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_orders ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (our backend connects via SUPABASE_SERVICE_ROLE_KEY)
-- Optional default policies for extra security:
CREATE POLICY "Service role full access on app_users" 
ON public.app_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access on app_orders" 
ON public.app_orders 
FOR ALL 
USING (true) 
WITH CHECK (true);
