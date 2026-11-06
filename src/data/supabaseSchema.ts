export const SUPABASE_SQL_MIGRATIONS = `-- =====================================================================
-- MOVIFASHION AI: Persistence Schema for Supabase PostgreSQL
-- Run this in the Supabase SQL Editor
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
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);

-- 2. Table: app_categories
CREATE TABLE IF NOT EXISTS public.app_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_categories_slug ON public.app_categories(slug);

-- 3. Table: app_products
CREATE TABLE IF NOT EXISTS public.app_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    discount_price NUMERIC CHECK (discount_price >= 0),
    inventory INT NOT NULL DEFAULT 0,
    description TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    color_images JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_products_category ON public.app_products(category);
CREATE INDEX IF NOT EXISTS idx_app_products_brand ON public.app_products(brand);

-- 4. Table: app_orders
CREATE TABLE IF NOT EXISTS public.app_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    user_name TEXT,
    user_email TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    shipping NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    tracking_number TEXT,
    simulated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_orders_user_id ON public.app_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_app_orders_created_at ON public.app_orders(created_at DESC);

-- 5. Table: app_events (Big Data & Behavior Tracking)
CREATE TABLE IF NOT EXISTS public.app_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    product_id TEXT,
    category TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    simulated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_events_type ON public.app_events(event_type);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON public.app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_session ON public.app_events(session_id);

-- 6. Table: app_audit_logs (OWASP Security & Admin Actions)
CREATE TABLE IF NOT EXISTS public.app_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    ip TEXT,
    user_role TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_audit_created ON public.app_audit_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_categories" ON public.app_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_products" ON public.app_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_orders" ON public.app_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_events" ON public.app_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_audit_logs" ON public.app_audit_logs FOR ALL USING (true) WITH CHECK (true);
`;
