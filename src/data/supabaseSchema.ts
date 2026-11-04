export const SUPABASE_SQL_MIGRATIONS = `-- =====================================================================
-- MOVIFASHION AI: Complete Supabase & PostgreSQL Database Schema
-- Architecture: Secure by Design, OWASP Top 10 Compliant & RBAC
-- Includes: 24 Core Tables, Constraints, Indexes & Row Level Security (RLS)
-- =====================================================================

-- 1. Enable UUID Extension & Crypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.roles (nombre, descripcion)
VALUES 
    ('cliente', 'Cliente con acceso a catálogo, compras y asistente IA'),
    ('administrador', 'Administrador con acceso a dashboard BI, gestión de productos y predicciones ML')
ON CONFLICT (nombre) DO NOTHING;

-- 3. USUARIOS (Profile table synced with auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES public.roles(id),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    telefono VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DIRECCIONES
CREATE TABLE IF NOT EXISTS public.direcciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    destinatario VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    telefono VARCHAR(50) NOT NULL,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PREFERENCIAS_USUARIO
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    estilo_preferido VARCHAR(100) DEFAULT 'minimalista',
    categorias_favoritas TEXT[] DEFAULT '{}',
    presupuesto_habitual NUMERIC(12, 2) DEFAULT 250000.00,
    tallas_preferidas TEXT[] DEFAULT '{}',
    colores_favoritos TEXT[] DEFAULT '{}',
    notificaciones_activas BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    imagen_url TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MARCAS
CREATE TABLE IF NOT EXISTS public.marcas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    sitio_web TEXT,
    logo_url TEXT,
    activa BOOLEAN DEFAULT TRUE
);

-- 8. PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES public.categorias(id),
    marca_id UUID REFERENCES public.marcas(id),
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    precio_descuento NUMERIC(12, 2) CHECK (precio_descuento >= 0 AND precio_descuento <= precio),
    calificacion_promedio NUMERIC(3, 2) DEFAULT 5.0 CHECK (calificacion_promedio BETWEEN 0 AND 5),
    total_resenas INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    es_destacado BOOLEAN DEFAULT FALSE,
    es_nuevo BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. VARIANTES_PRODUCTO
CREATE TABLE IF NOT EXISTS public.variantes_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    talla VARCHAR(50) NOT NULL,
    color_nombre VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    precio_adicional NUMERIC(10, 2) DEFAULT 0.00
);

-- 10. INVENTARIO
CREATE TABLE IF NOT EXISTS public.inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variante_id UUID UNIQUE NOT NULL REFERENCES public.variantes_producto(id) ON DELETE CASCADE,
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    umbral_minimo INT NOT NULL DEFAULT 5,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. IMAGENES_PRODUCTO
CREATE TABLE IF NOT EXISTS public.imagenes_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE
);

-- 12. CARRITO
CREATE TABLE IF NOT EXISTS public.carrito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. CARRITO_DETALLE
CREATE TABLE IF NOT EXISTS public.carrito_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrito_id UUID NOT NULL REFERENCES public.carrito(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES public.variantes_producto(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    agregado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(carrito_id, variante_id)
);

-- 14. PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
    direccion_envio JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    envio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    descuento NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN ('Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado')),
    guia_seguimiento VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. DETALLE_PEDIDO
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES public.variantes_producto(id),
    precio_unitario NUMERIC(12, 2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 16. PAGOS
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL CHECK (metodo IN ('tarjeta_credito', 'pse', 'contraentrega')),
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('aprobado', 'pendiente', 'rechazado')),
    transaccion_id VARCHAR(150),
    monto NUMERIC(12, 2) NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. FAVORITOS
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(usuario_id, producto_id)
);

-- 18. RESENAS
CREATE TABLE IF NOT EXISTS public.resenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    aprobada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. CONVERSACIONES_IA
CREATE TABLE IF NOT EXISTS public.conversaciones_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) DEFAULT 'Consulta Estilista IA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. MENSAJES_IA
CREATE TABLE IF NOT EXISTS public.mensajes_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID NOT NULL REFERENCES public.conversaciones_ia(id) ON DELETE CASCADE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'assistant')),
    contenido TEXT NOT NULL,
    criterios_extraidos JSONB,
    productos_recomendados UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. BUSQUEDAS
CREATE TABLE IF NOT EXISTS public.busquedas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    termino TEXT NOT NULL,
    filtros JSONB,
    total_resultados INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 22. RECOMENDACIONES
CREATE TABLE IF NOT EXISTS public.recomendaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    puntuacion_afinidad NUMERIC(5, 2) NOT NULL,
    motivo VARCHAR(150) NOT NULL,
    hizo_clic BOOLEAN DEFAULT FALSE,
    agrego_carrito BOOLEAN DEFAULT FALSE,
    compro BOOLEAN DEFAULT FALSE,
    fecha_recomendacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 23. INTERACCIONES
CREATE TABLE IF NOT EXISTS public.interacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vista', 'favorito', 'carrito', 'compra', 'ia_click')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 24. METRICAS_DIARIAS, PREDICCIONES_VENTAS, REPORTES_IA, MODELOS_IA
CREATE TABLE IF NOT EXISTS public.metricas_diarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE UNIQUE NOT NULL,
    ventas_totales NUMERIC(14, 2) DEFAULT 0,
    ingresos NUMERIC(14, 2) DEFAULT 0,
    total_pedidos INT DEFAULT 0,
    usuarios_nuevos INT DEFAULT 0,
    tasa_conversion NUMERIC(5, 2) DEFAULT 0,
    ticket_promedio NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.modelos_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    metricas JSONB NOT NULL,
    parametros JSONB,
    entrenado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.predicciones_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_id UUID REFERENCES public.modelos_ia(id),
    fecha_prediccion DATE NOT NULL,
    categoria_id UUID REFERENCES public.categorias(id),
    producto_id UUID REFERENCES public.productos(id),
    ventas_estimadas NUMERIC(12, 2) NOT NULL,
    rango_superior NUMERIC(12, 2),
    rango_inferior NUMERIC(12, 2),
    confianza NUMERIC(5, 2)
);

CREATE TABLE IF NOT EXISTS public.reportes_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    insight TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    datos_soporte JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — OWASP TOP 10 (A01 - Broken Access Control)
-- =====================================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direcciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrito_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_ia ENABLE ROW LEVEL SECURITY;

-- Helpers for Admin Role verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.rol_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Productos
CREATE POLICY "Productos visibles para todos si activos o si es admin"
ON public.productos FOR SELECT
USING (activo = TRUE OR public.is_admin());

CREATE POLICY "Solo administradores pueden modificar productos"
ON public.productos FOR ALL
USING (public.is_admin());

-- Policies for Usuarios
CREATE POLICY "Usuarios ven y editan su propio perfil"
ON public.usuarios FOR ALL
USING (auth.uid() = id OR public.is_admin());

-- Policies for Direcciones
CREATE POLICY "Usuarios gestionan sus propias direcciones"
ON public.direcciones FOR ALL
USING (auth.uid() = usuario_id OR public.is_admin());

-- Policies for Pedidos
CREATE POLICY "Clientes ven sus propios pedidos, admins ven todos"
ON public.pedidos FOR SELECT
USING (auth.uid() = usuario_id OR public.is_admin());

-- Policies for Favoritos & Carrito
CREATE POLICY "Clientes gestionan sus propios favoritos"
ON public.favoritos FOR ALL
USING (auth.uid() = usuario_id);

CREATE POLICY "Clientes gestionan su propio carrito"
ON public.carrito FOR ALL
USING (auth.uid() = usuario_id);

-- Policies for Conversaciones IA
CREATE POLICY "Clientes acceden solo a sus conversaciones IA"
ON public.conversaciones_ia FOR ALL
USING (auth.uid() = usuario_id OR usuario_id IS NULL);
`;
