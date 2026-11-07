-- =====================================================================
-- MOVIFASHION AI: Persistence Schema for Supabase PostgreSQL
-- Tables for Products, Categories, Orders, Events, Audit Logs, Users,
-- Contact Messages, PQRS, Coupons, Newsletter Subscribers & Taxes
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

-- 4. Table: app_orders (With Colombian 19% IVA & Tax Base columns)
CREATE TABLE IF NOT EXISTS public.app_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    user_name TEXT,
    user_email TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    subtotal_base NUMERIC,
    iva NUMERIC,
    tarifa_iva NUMERIC DEFAULT 0.19,
    shipping NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    coupon_code TEXT,
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

-- Ensure tax columns exist if upgrading pre-existing table
ALTER TABLE public.app_orders ADD COLUMN IF NOT EXISTS subtotal_base NUMERIC;
ALTER TABLE public.app_orders ADD COLUMN IF NOT EXISTS iva NUMERIC;
ALTER TABLE public.app_orders ADD COLUMN IF NOT EXISTS tarifa_iva NUMERIC DEFAULT 0.19;
ALTER TABLE public.app_orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 5. Table: contact_messages (Formulario de contacto con honeypot y antispam)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_messages(created_at DESC);

-- 6. Table: pqrs (Peticiones, Quejas, Reclamos y Sugerencias - Estatuto del Consumidor Ley 1480 de 2011)
CREATE TABLE IF NOT EXISTS public.pqrs (
    id TEXT PRIMARY KEY,
    radicado TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    doc_type TEXT DEFAULT 'CC',
    doc_number TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    order_id TEXT,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'recibido',
    response_message TEXT,
    response_deadline TEXT DEFAULT '15 días hábiles',
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pqrs_radicado ON public.pqrs(radicado);
CREATE INDEX IF NOT EXISTS idx_pqrs_email ON public.pqrs(email);

-- 7. Table: newsletter_subscribers (Consentimiento Ley 1581 de 2012)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    email TEXT PRIMARY KEY,
    consent BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'web_footer',
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: coupons (Cupones de descuento activos)
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_percent INT NOT NULL,
    min_subtotal NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.coupons (code, discount_percent, min_subtotal, active) VALUES
    ('MOVI10', 10, 100000, true),
    ('COLOMBIA10', 10, 80000, true),
    ('ESTILO15', 15, 150000, true)
ON CONFLICT (code) DO NOTHING;

-- 9. Table: app_events (Big Data & Behavior Tracking)
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

-- 10. Table: app_audit_logs (OWASP Security & Admin Actions)
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
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pqrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access on app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_categories" ON public.app_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_products" ON public.app_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_orders" ON public.app_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on contact_messages" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on pqrs" ON public.pqrs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_events" ON public.app_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_audit_logs" ON public.app_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- PASO 8: BACK-OFFICE PROFESIONAL (RBAC, STAFF, INVENTARIO, ATENCIÓN)
-- =====================================================================

-- 11. Table: staff_roles (Granular RBAC)
CREATE TABLE IF NOT EXISTS public.staff_roles (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    permisos JSONB NOT NULL DEFAULT '[]'::jsonb,
    es_sistema BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed System Roles
INSERT INTO public.staff_roles (id, nombre, descripcion, permisos, es_sistema) VALUES
('super_admin', 'Super Administrador', 'Control total de la plataforma, roles del equipo, configuración crítica y borrado definitivo.', '["*"]'::jsonb, true),
('administrador', 'Administrador General', 'Gestión completa de operaciones, ventas, catálogo y soporte.', '["resumen.ver", "pedidos.ver", "pedidos.editar", "pedidos.aprobar", "pedidos.exportar", "devoluciones.ver", "devoluciones.editar", "devoluciones.aprobar", "productos.ver", "productos.crear", "productos.editar", "productos.eliminar", "productos.exportar", "inventario.ver", "inventario.editar", "inventario.exportar", "categorias.ver", "categorias.crear", "categorias.editar", "categorias.eliminar", "marketing.ver", "marketing.crear", "marketing.editar", "marketing.eliminar", "clientes.ver", "clientes.editar", "clientes.datos_sensibles", "clientes.exportar", "atencion.ver", "atencion.editar", "atencion.responder", "asistente.ver", "asistente.editar", "contenido.ver", "contenido.crear", "contenido.editar", "analitica.ver", "analitica.exportar", "finanzas.ver", "finanzas.exportar", "envios.ver", "envios.editar", "usuarios.ver", "usuarios.crear", "usuarios.editar", "usuarios.eliminar", "usuarios.roles", "auditoria.ver", "auditoria.exportar", "configuracion.ver", "configuracion.editar"]'::jsonb, true),
('gerente_tienda', 'Gerente de Tienda', 'Control de catálogo, inventario, pedidos, campañas, clientes, analítica y reportes fiscales.', '["resumen.ver", "productos.ver", "productos.crear", "productos.editar", "productos.eliminar", "productos.exportar", "inventario.ver", "inventario.editar", "inventario.exportar", "categorias.ver", "categorias.crear", "categorias.editar", "categorias.eliminar", "pedidos.ver", "pedidos.editar", "pedidos.exportar", "pedidos.aprobar", "devoluciones.ver", "devoluciones.editar", "devoluciones.aprobar", "marketing.ver", "marketing.crear", "marketing.editar", "marketing.eliminar", "clientes.ver", "clientes.editar", "clientes.exportar", "analitica.ver", "analitica.exportar", "finanzas.ver", "finanzas.exportar", "envios.ver"]'::jsonb, true),
('operador_pedidos', 'Operador de Pedidos y Envíos', 'Gestión y despacho de órdenes, números de guía, inventario en solo lectura y devoluciones.', '["resumen.ver", "pedidos.ver", "pedidos.editar", "pedidos.aprobar", "pedidos.exportar", "devoluciones.ver", "devoluciones.editar", "inventario.ver", "envios.ver"]'::jsonb, true),
('marketing_contenido', 'Marketing y Contenidos', 'Campañas, promociones, cupones, banners, páginas corporativas y boletín.', '["resumen.ver", "marketing.ver", "marketing.crear", "marketing.editar", "marketing.eliminar", "contenido.ver", "contenido.crear", "contenido.editar", "productos.ver", "categorias.ver", "analitica.ver"]'::jsonb, true),
('soporte_cliente', 'Soporte y Atención al Cliente', 'Atención de PQRS, formularios de contacto, consulta de pedidos y clientes con datos enmascarados.', '["resumen.ver", "atencion.ver", "atencion.editar", "atencion.responder", "pedidos.ver", "devoluciones.ver", "devoluciones.editar", "clientes.ver", "asistente.ver", "asistente.editar"]'::jsonb, true),
('finanzas', 'Finanzas e Impuestos', 'Reportes de ventas brutas/netas, IVA 19%, conciliaciones y exportaciones fiscales en solo lectura.', '["resumen.ver", "finanzas.ver", "finanzas.exportar", "pedidos.ver", "pedidos.exportar", "analitica.ver", "analitica.exportar"]'::jsonb, true),
('analista', 'Analista de Negocio', 'Acceso de solo lectura a analítica, tendencias, comportamiento de usuarios y reportes.', '["resumen.ver", "analitica.ver", "analitica.exportar", "productos.ver", "pedidos.ver"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;

-- Alter app_users for staff & security
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS role_id TEXT REFERENCES public.staff_roles(id) ON DELETE SET NULL;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS etiquetas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Alter app_products for back-office
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS cost NUMERIC;
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS margin NUMERIC;
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'publicado';
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5;
ALTER TABLE public.app_products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Alter app_categories & coupons for soft delete
ALTER TABLE public.app_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Alter app_audit_logs for rich back-office diffs
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS usuario_id TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS usuario_nombre TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS usuario_email TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS rol TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS accion TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS modulo TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS entidad TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS entidad_id TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS antes JSONB;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS despues JSONB;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS navegador TEXT;
ALTER TABLE public.app_audit_logs ADD COLUMN IF NOT EXISTS motivo TEXT;

-- 12. Table: staff_sessions (Active session tracker & force-logout)
CREATE TABLE IF NOT EXISTS public.staff_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
    token_hash TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_user ON public.staff_sessions(user_id);

-- 13. Table: login_history (Security & Lockout Audit)
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    resultado TEXT NOT NULL,
    motivo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON public.login_history(email);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON public.login_history(created_at DESC);

-- 14. Table: product_variants (Talla x Color con SKU y Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.app_products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    low_stock_alert INT DEFAULT 5,
    price_override NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

-- 15. Table: inventory_movements (Kardex: entrada, salida, ajuste, devolución, venta)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    variant_sku TEXT,
    tipo TEXT NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    motivo TEXT NOT NULL,
    usuario_id TEXT,
    usuario_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movements_product ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON public.inventory_movements(created_at DESC);

-- 16. Table: price_history (Historial de Precios y Auditoría)
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    precio_anterior NUMERIC,
    precio_nuevo NUMERIC,
    usuario_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_history(product_id);

-- 17. Table: returns (Devoluciones, Retractos Ley 1480 y Garantías)
CREATE TABLE IF NOT EXISTS public.returns (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    tipo TEXT NOT NULL,
    items JSONB NOT NULL,
    motivo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'solicitado',
    resolucion TEXT,
    reembolso_simulado NUMERIC,
    reponer_inventario BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(estado);

-- 18. Table: order_notes (Notas Internas para Pedidos)
CREATE TABLE IF NOT EXISTS public.order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    nota TEXT NOT NULL,
    usuario_id TEXT,
    usuario_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_notes_order ON public.order_notes(order_id);

-- 19. Table: order_status_history (Trazabilidad y Quién Cambió Qué)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT NOT NULL,
    nota TEXT,
    usuario_id TEXT,
    usuario_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);

-- 20. Table: admin_notifications (Centro de Notificaciones en Tiempo Real)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.admin_notifications(created_at DESC);

-- 21. Table: app_settings (Configuración Dinámica Sobrescribible)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- 22. Tables: content_pages & content_versions (CMS Legal y Corporativo con Restauración)
CREATE TABLE IF NOT EXISTS public.content_pages (
    slug TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    meta_descripcion TEXT,
    publicado BOOLEAN DEFAULT true,
    version_actual INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL,
    version INT NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_content_versions_slug ON public.content_versions(page_slug);

-- 23. Table: knowledge_entries (Base de Conocimiento Administrable para Chatbot Movi)
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id TEXT PRIMARY KEY,
    categoria TEXT NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    palabras_clave JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Table: assistant_feedback (Métricas de Calificación Pulgar Arriba / Abajo)
CREATE TABLE IF NOT EXISTS public.assistant_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    rating INT NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Table: goals (Meta Mensual de Ventas)
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    target_sales NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on staff_roles" ON public.staff_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on staff_sessions" ON public.staff_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on login_history" ON public.login_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on inventory_movements" ON public.inventory_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on price_history" ON public.price_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on returns" ON public.returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on order_notes" ON public.order_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on order_status_history" ON public.order_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on admin_notifications" ON public.admin_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on content_pages" ON public.content_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on content_versions" ON public.content_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on knowledge_entries" ON public.knowledge_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on assistant_feedback" ON public.assistant_feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

