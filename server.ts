import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEMO_USER } from './src/data/mockProducts.ts';
import { Product, ProductCategory, Order, SecurityAuditLog, ReturnRequest } from './src/types/index.ts';
import { EMPRESA } from './src/config/empresa.ts';
import { BASE_CONOCIMIENTO, buscarEnBaseConocimiento } from './src/data/conocimiento.ts';
import { calcularBaseGravable, calcularIva } from './src/utils/impuestos.ts';
import { createAdminRouter } from './src/server/adminRoutes.ts';
import { initializeAdminStore, returnRequests, pushAdminNotification, getCachedPermissions } from './src/server/adminStore.ts';
import { SEED_STAFF_USERS } from './scripts/seed-staff.ts';
import { verifyTotpCode } from './src/server/totp.ts';
import { processAssistantChat } from './src/server/assistantEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable trust proxy for Vercel and reverse proxy environments
app.set('trust proxy', 1);

// Base Middlewares mounted before routes
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// ---------------------------------------------------------------------
// DATABASE & PERSISTENCE (Supabase + In-Memory Fallback)
// ---------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('[DATABASE] Supabase PostgreSQL client initialized successfully');
  } catch (err: any) {
    console.warn('[DATABASE] Error initializing Supabase client:', err.message);
  }
}

interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  roleId?: string;
  permissions?: string[];
  mfa_secret?: string | null;
  mfaEnabled?: boolean;
  mustChangePassword?: boolean;
  estado?: string;
  lastLoginAt?: string;
  failedAttempts?: number;
  lockedUntil?: string;
  preferences?: any;
  addresses?: any[];
  created_at?: string;
  createdAt?: string;
}

interface StoredEvent {
  id: string;
  session_id: string;
  user_id?: string;
  event_type: string;
  product_id?: string;
  category?: string;
  metadata?: Record<string, any>;
  simulated?: boolean;
  created_at: string;
}

// In-Memory store for products, categories, orders, events and security logs
let inMemoryUsers: DBUser[] = [];
let products: Product[] = [...INITIAL_PRODUCTS];
let categories: ProductCategory[] = [...INITIAL_CATEGORIES];
let orders: Order[] = [];
let appEvents: StoredEvent[] = [];

// Corporate & Customer Care in-memory stores
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ip: string;
  created_at: string;
}
let contactMessages: ContactMessage[] = [];

interface PQRSItem {
  id: string;
  radicado: string;
  type: string;
  fullName: string;
  docType: string;
  docNumber: string;
  email: string;
  phone?: string;
  orderId?: string;
  subject: string;
  description: string;
  status: 'recibido' | 'en_analisis' | 'resuelto' | 'cerrado';
  responseMessage?: string;
  responseDeadline: string;
  ip: string;
  createdAt: string;
}
let pqrsList: PQRSItem[] = [
  {
    id: 'pqrs-seed-1',
    radicado: `PQRS-2026-000101`,
    type: 'peticion',
    fullName: 'Carolina Herrera',
    docType: 'CC',
    docNumber: '52890123',
    email: 'carolina@ejemplo.com',
    phone: '3104567890',
    subject: 'Consulta sobre cobertura de envíos a Leticia, Amazonas',
    description: 'Deseo conocer si realizan despachos y cuáles son los tiempos de entrega hacia el departamento del Amazonas.',
    status: 'resuelto',
    responseMessage: 'Estimada Carolina: realizamos envíos a Leticia a través de Coordinadora y Servientrega aérea. El tiempo estimado de entrega es de 5 a 8 días hábiles con tarifa fija de $12.000 COP, o completamente gratis en compras superiores a $200.000 COP.',
    responseDeadline: '15 días hábiles',
    ip: '127.0.0.1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];
let pqrsRadicadoSequence = 102;

interface CouponItem {
  code: string;
  discountPercent: number;
  minSubtotal?: number;
  active: boolean;
}
let activeCoupons: CouponItem[] = [
  { code: 'MOVI10', discountPercent: 10, minSubtotal: 100000, active: true },
  { code: 'COLOMBIA10', discountPercent: 10, minSubtotal: 80000, active: true },
  { code: 'ESTILO15', discountPercent: 15, minSubtotal: 150000, active: true },
  { code: 'BIENVENIDO', discountPercent: 10, minSubtotal: 50000, active: true },
];

let newsletterSubscribers: { email: string; consent: boolean; ip: string; created_at: string }[] = [];

let auditLogs: SecurityAuditLog[] = [
  {
    id: 'log-sys-init',
    timestamp: new Date().toISOString(),
    eventType: 'AUTH_LOGIN',
    severity: 'info',
    description: 'Sistema inicializado con autenticación dual (Cookie + Bearer JWT) y RBAC',
    ip: '127.0.0.1',
    userRole: 'admin',
    status: 'SUCCESS',
  },
];

// Helper to record security audit logs
function recordAudit(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) {
  const newLog: SecurityAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 100) auditLogs.pop();

  if (supabase) {
    (async () => {
      try {
        await supabase
          .from('app_audit_logs')
          .insert({
            event_type: log.eventType,
            severity: log.severity,
            description: log.description,
            ip: log.ip,
            user_role: log.userRole,
            status: log.status,
          });
      } catch (err: any) {
        console.warn('[AUDIT] Error persisting audit log to Supabase:', err.message);
      }
    })();
  }
}

// ---------------------------------------------------------------------
// CRYPTO & AUTH HELPERS (scrypt + JWT HttpOnly Cookie & Bearer Header)
// ---------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'movifashion-jwt-secret-dev-fixed-2026-32chars';
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[AUTH ERROR] JWT_SECRET no configurado en entorno de producción. Configure JWT_SECRET en las variables de entorno.');
  } else {
    console.warn('[AUTH ADVERTENCIA] JWT_SECRET no definido en .env. Usando clave fija persistente para desarrollo local.');
  }
}

const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

interface JWTPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
}

function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function extractToken(req: Request): string | null {
  // 1. Try Cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  // 2. Try Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Rate Limiter: 5 attempts per 15 minutes per IP/email
const loginRateLimitMap = new Map<string, { attempts: number; resetAt: number }>();
function checkLoginRateLimit(key: string): boolean {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    loginRateLimitMap.set(key, { attempts: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.attempts >= 5) {
    return false;
  }
  record.attempts += 1;
  return true;
}

function resetLoginRateLimit(key: string) {
  loginRateLimitMap.delete(key);
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// DATABASE SYNC & SEEDING ON STARTUP
// ---------------------------------------------------------------------
let effectiveAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
let effectiveAdminPassword = process.env.ADMIN_PASSWORD || '';
let shouldCreateAdmin = false;

if (process.env.NODE_ENV === 'production') {
  if (!effectiveAdminEmail || !effectiveAdminPassword) {
    console.error('[ADMIN ERROR] Variables ADMIN_EMAIL o ADMIN_PASSWORD no definidas en producción. No se creará administrador automático.');
  } else {
    shouldCreateAdmin = true;
  }
} else {
  // Modo Desarrollo: si no existen ADMIN_EMAIL / ADMIN_PASSWORD, crear con admin@movifashion.co y contraseña aleatoria
  if (!effectiveAdminEmail || !effectiveAdminPassword) {
    effectiveAdminEmail = 'admin@movifashion.co';
    effectiveAdminPassword = `DevPass${randomBytes(4).toString('hex')}!`;
    console.log(`Admin de desarrollo: ${effectiveAdminEmail} / ${effectiveAdminPassword}`);
  }
  shouldCreateAdmin = true;
}

interface SchemaCheckResult {
  supabase: boolean;
  tablas: Record<string, boolean>;
  faltantes: string[];
}

let lastSchemaCheck: SchemaCheckResult = {
  supabase: false,
  tablas: {},
  faltantes: [],
};

async function verifySupabaseSchema(): Promise<SchemaCheckResult> {
  if (!supabase) {
    lastSchemaCheck = { supabase: false, tablas: {}, faltantes: ['Supabase no configurado'] };
    return lastSchemaCheck;
  }

  const tablasVerificar: Record<string, string> = {
    app_users: 'id, name, email, password_hash, role, role_id, estado, mfa_secret, mfa_enabled, must_change_password, created_at',
    app_orders: 'id, user_id, user_name, user_email, items, subtotal, subtotal_base, iva, tarifa_iva, shipping, discount, coupon_code, total, status, shipping_address, payment_method, payment_status, tracking_number, created_at',
    app_events: 'id, session_id, user_id, event_type, product_id, category, metadata, simulated, created_at',
    app_audit_logs: 'id, event_type, severity, description, ip, user_role, status, created_at',
    app_categories: 'id, name, slug, description, icon_name, sort_order, created_at',
    app_products: 'id, name, slug, category, brand, price, discount_price, inventory, description, images, colors, sizes, color_images, tags, rating, review_count, is_popular, is_featured, created_at',
    staff_roles: 'id, nombre, descripcion, permisos, es_sistema, created_at',
    contact_messages: 'id, name, email, phone, subject, message, ip, created_at',
    pqrs: 'id, radicado, type, full_name, doc_type, doc_number, email, phone, subject, description, status, created_at',
    coupons: 'code, discount_percent, min_subtotal, active, created_at',
    returns: 'id, order_id, user_id, user_name, user_email, tipo, items, motivo, estado, created_at',
    newsletter_subscribers: 'email, consent, source, ip, created_at',
  };

  const statusTablas: Record<string, boolean> = {};
  const faltantes: string[] = [];

  for (const [table, cols] of Object.entries(tablasVerificar)) {
    try {
      const { error } = await supabase.from(table).select(cols).limit(0);
      if (error) {
        statusTablas[table] = false;
        faltantes.push(`${table}: ${error.message}`);
        console.error(`[SCHEMA VERIFY ERROR] Tabla o columna faltante en '${table}': ${error.message}`);
      } else {
        statusTablas[table] = true;
      }
    } catch (err: any) {
      statusTablas[table] = false;
      faltantes.push(`${table}: ${err.message}`);
      console.error(`[SCHEMA VERIFY ERROR] Excepción al verificar tabla '${table}': ${err.message}`);
    }
  }

  if (faltantes.length > 0) {
    console.warn('[SCHEMA VERIFY] ATENCIÓN: Se detectaron tablas o columnas faltantes en Supabase. Ejecuta supabase/setup.sql para aplicar el esquema completo e idempotente.');
  } else {
    console.log('[SCHEMA VERIFY] Todas las tablas y columnas requeridas existen y son válidas en Supabase PostgreSQL.');
  }

  lastSchemaCheck = {
    supabase: true,
    tablas: statusTablas,
    faltantes,
  };

  return lastSchemaCheck;
}

async function syncDatabaseOnStartup() {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminHash = shouldCreateAdmin && effectiveAdminPassword ? hashPassword(effectiveAdminPassword) : '';

  // Pre-seed local in-memory admin user
  if (shouldCreateAdmin && effectiveAdminEmail && adminHash) {
    const existingAdmin = inMemoryUsers.find(u => u.email.toLowerCase() === effectiveAdminEmail.toLowerCase());
    if (!existingAdmin) {
      inMemoryUsers.push({
        id: 'admin-seed-uuid-01',
        name: 'Administrador MOVIFASHION',
        email: effectiveAdminEmail,
        password_hash: adminHash,
        role: 'admin',
        roleId: 'super_admin',
        permissions: getCachedPermissions('super_admin'),
        created_at: new Date().toISOString(),
      });
    } else {
      existingAdmin.password_hash = adminHash;
      existingAdmin.role = 'admin';
      existingAdmin.roleId = 'super_admin';
      existingAdmin.permissions = getCachedPermissions('super_admin');
    }
  }

  const demoEmail = 'cliente@movifashion.ai';

  // Pre-seed demo users & staff ONLY if explicitly enabled in non-production
  const allowSeedDemo = process.env.SEED_DEMO_USERS === 'true' && !isProduction;
  if (allowSeedDemo) {
    const demoPassword = 'Cliente2026!';
    const demoHash = hashPassword(demoPassword);

    if (!inMemoryUsers.some(u => u.email === demoEmail)) {
      inMemoryUsers.push({
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: demoEmail,
        password_hash: demoHash,
        role: 'cliente',
        created_at: new Date().toISOString(),
      });
    }

    // Pre-seed all 8 Staff Roles into inMemoryUsers
    for (const staff of SEED_STAFF_USERS) {
      const existing = inMemoryUsers.find(u => u.email.toLowerCase() === staff.email.toLowerCase());
      if (!existing) {
        inMemoryUsers.push({
          id: `staff-${staff.roleId}`,
          name: staff.name,
          email: staff.email.toLowerCase(),
          password_hash: hashPassword(staff.password),
          role: staff.roleId === 'super_admin' ? 'admin' : staff.roleId,
          roleId: staff.roleId,
          permissions: getCachedPermissions(staff.roleId),
          estado: staff.estado,
          created_at: new Date().toISOString(),
        });
      } else {
        existing.roleId = staff.roleId;
        if (staff.roleId === 'super_admin') existing.role = 'admin';
        existing.permissions = getCachedPermissions(staff.roleId);
        existing.estado = staff.estado;
      }
    }
  }

  // Pre-seed initial sample orders for demo
  if (orders.length === 0) {
    orders.push(
      {
        id: 'ORD-9842',
        userId: DEMO_USER.id,
        userName: DEMO_USER.name,
        userEmail: demoEmail,
        items: [
          {
            id: 'item-1',
            product: products[0],
            selectedSize: '39',
            selectedColor: products[0].colors[0],
            quantity: 1,
          },
        ],
        subtotal: 189000,
        shipping: 0,
        discount: 0,
        total: 189000,
        status: 'Enviado',
        shippingAddress: DEMO_USER.addresses[0],
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        trackingNumber: 'MOV-COL-882194',
        createdAt: '2026-10-28T14:30:00Z',
      },
      {
        id: 'ORD-9751',
        userId: DEMO_USER.id,
        userName: DEMO_USER.name,
        userEmail: demoEmail,
        items: [
          {
            id: 'item-2',
            product: products[2],
            selectedSize: 'Única',
            selectedColor: products[2].colors[0],
            quantity: 1,
          },
        ],
        subtotal: 265000,
        shipping: 0,
        discount: 0,
        total: 265000,
        status: 'Entregado',
        shippingAddress: DEMO_USER.addresses[0],
        paymentMethod: 'pse',
        paymentStatus: 'paid',
        trackingNumber: 'MOV-COL-741902',
        createdAt: '2026-10-14T09:15:00Z',
      }
    );
  }

  if (!supabase) return;

  try {
    // 0. Verify schema and table presence
    await verifySupabaseSchema();

    // 1. Load existing staff and custom users from Supabase app_users into inMemoryUsers
    try {
      const { data: supaUsers, error: usersErr } = await supabase
        .from('app_users')
        .select('*');
      if (!usersErr && supaUsers && supaUsers.length > 0) {
        for (const su of supaUsers) {
          const existing = inMemoryUsers.find(u => u.email.toLowerCase() === su.email.toLowerCase());
          const roleId = su.role_id || su.role;
          const mappedRole = su.role === 'admin' || roleId === 'super_admin' ? 'admin' : roleId;
          const userObj: DBUser = {
            id: su.id,
            name: su.name,
            email: su.email.toLowerCase(),
            password_hash: su.password_hash,
            role: mappedRole,
            roleId,
            permissions: getCachedPermissions(roleId),
            estado: su.estado || 'activo',
            mfa_secret: su.mfa_secret,
            mfaEnabled: su.mfa_enabled,
            mustChangePassword: su.must_change_password,
            created_at: su.created_at,
          };
          if (!existing) {
            inMemoryUsers.push(userObj);
          } else {
            Object.assign(existing, userObj);
          }
        }
        console.log(`[SUPABASE] ${supaUsers.length} usuarios sincronizados desde app_users.`);
      }
    } catch (err: any) {
      console.warn('[SUPABASE] Error cargando usuarios de app_users:', err.message);
    }

    // 2. Sync Admin in Supabase app_users (updating hash if env var changed)
    if (shouldCreateAdmin && effectiveAdminEmail && adminHash) {
      const { data: existingAdmin } = await supabase
        .from('app_users')
        .select('id, password_hash')
        .eq('email', effectiveAdminEmail)
        .maybeSingle();

      if (!existingAdmin) {
        await supabase.from('app_users').insert({
          id: 'admin-seed-uuid-01',
          name: 'Administrador MOVIFASHION',
          email: effectiveAdminEmail,
          password_hash: adminHash,
          role: 'admin',
          role_id: 'super_admin',
          estado: 'activo',
        });
        console.log(`[SUPABASE] Usuario admin creado en app_users: ${effectiveAdminEmail}`);
      } else {
        await supabase.from('app_users').update({
          password_hash: adminHash,
          role: 'admin',
          role_id: 'super_admin',
          estado: 'activo',
        }).eq('id', existingAdmin.id);
        console.log(`[SUPABASE] Contraseña y rol de admin actualizados en app_users: ${effectiveAdminEmail}`);
      }
    }

    if (allowSeedDemo) {
      const demoEmail = 'cliente@movifashion.ai';
      const demoPassword = 'Cliente2026!';
      const demoHash = hashPassword(demoPassword);

      const { data: existingDemo } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', demoEmail)
        .maybeSingle();

      if (!existingDemo) {
        await supabase.from('app_users').insert({
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: demoEmail,
          password_hash: demoHash,
          role: 'cliente',
        });
        console.log(`[SUPABASE] Usuario cliente demo creado: ${demoEmail}`);
      }
    }

    // 2. Check and Seed Categories
    const { data: catRows, error: catErr } = await supabase.from('app_categories').select('id');
    if (!catErr && (!catRows || catRows.length === 0)) {
      console.log('[SUPABASE] Inicializando 8 categorías en base de datos...');
      const seedCats = INITIAL_CATEGORIES.map((c, idx) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon_name: c.iconName,
        sort_order: idx,
      }));
      await supabase.from('app_categories').upsert(seedCats, { onConflict: 'id' });
    } else if (catRows && catRows.length > 0) {
      const { data: loadedCats } = await supabase
        .from('app_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (loadedCats && loadedCats.length > 0) {
        categories = loadedCats.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          iconName: c.icon_name || 'Sparkles',
          itemCount: 0,
        }));
      }
    }

    // 3. Check and Seed Products (40 real products)
    const { data: prodRows, error: prodErr } = await supabase.from('app_products').select('id');
    if (!prodErr && (!prodRows || prodRows.length === 0)) {
      console.log('[SUPABASE] Inicializando 40 productos fotográficos en base de datos...');
      const seedProds = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: p.category,
        brand: p.brand,
        price: p.price,
        discount_price: p.discountPrice || null,
        inventory: p.inventory,
        description: p.description,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        color_images: p.colorImages || {},
        tags: p.tags,
        rating: p.rating,
        review_count: p.reviewCount,
        is_popular: p.isPopular || false,
        is_featured: p.isNew || false,
      }));
      await supabase.from('app_products').upsert(seedProds, { onConflict: 'id' });
    } else if (prodRows && prodRows.length > 0) {
      const { data: loadedProds } = await supabase.from('app_products').select('*');
      if (loadedProds && loadedProds.length > 0) {
        products = loadedProds.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
          category: p.category,
          brand: p.brand,
          images: p.images || [],
          colorImages: p.color_images || {},
          sizes: p.sizes || ['S', 'M', 'L'],
          colors: p.colors || [{ name: 'Estándar', hex: '#25232B' }],
          inventory: Number(p.inventory),
          rating: Number(p.rating) || 5.0,
          reviewCount: Number(p.review_count) || 0,
          isPopular: Boolean(p.is_popular),
          isNew: Boolean(p.is_featured),
          tags: p.tags || [],
          createdAt: p.created_at || new Date().toISOString(),
        }));
      }
    }

    // 4. Load persisted orders
    const { data: loadedOrders } = await supabase
      .from('app_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadedOrders && loadedOrders.length > 0) {
      orders = loadedOrders.map(o => ({
        id: o.id,
        userId: o.user_id || 'usr-anonymous',
        userName: o.user_name || 'Cliente',
        userEmail: o.user_email || 'cliente@movifashion.ai',
        items: o.items || [],
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        discount: Number(o.discount) || 0,
        total: Number(o.total),
        status: o.status || 'Pendiente',
        shippingAddress: o.shipping_address || {},
        paymentMethod: o.payment_method || 'credit_card',
        paymentStatus: o.payment_status || 'paid',
        trackingNumber: o.tracking_number || `MOV-COL-${Math.floor(100000 + Math.random() * 900000)}`,
        simulated: Boolean(o.simulated),
        createdAt: o.created_at,
      }));
    }
  } catch (err: any) {
    console.warn('[SUPABASE] Fallback a memoria local para catálogo:', err.message);
  }

  // 5. Initialize enterprise back-office store (Variants, Kardex, Notifications, CMS, Goals)
  initializeAdminStore(products, orders);
  console.log('[ADMIN STORE] Tienda administrativa inicializada con variantes, historial y métricas.');
}
syncDatabaseOnStartup().catch(console.error);

// ---------------------------------------------------------------------
// AUTH MIDDLEWARES (requireAuth & requireAdmin)
// ---------------------------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: () => void) {
  const token = extractToken(req);
  if (!token) {
    console.warn(`[AUTH] Autenticación fallida: No se proporcionó token ni en cookie '${COOKIE_NAME}' ni en cabecera Authorization Bearer para ${req.method} ${req.path}`);
    res.status(401).json({ error: 'Autenticación requerida. Inicia sesión para continuar.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      console.warn(`[AUTH] Token expirado en ${req.method} ${req.path}`);
      res.status(401).json({ error: 'Tu sesión ha expirado. Inicia sesión de nuevo.' });
    } else {
      console.warn(`[AUTH] Token inválido en ${req.method} ${req.path}: ${err.message}`);
      res.status(401).json({ error: 'Sesión inválida.' });
    }
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: () => void) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      recordAudit({
        eventType: 'ROLE_CHECK',
        severity: 'alert',
        description: `Acceso denegado a ruta de administrador: ${req.path} por usuario ${req.user?.email || 'desconocido'} con rol '${req.user?.role || 'sin rol'}'`,
        ip: req.ip || '127.0.0.1',
        userRole: req.user?.role || 'cliente',
        status: 'BLOCKED',
      });
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    next();
  });
}

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------------------------------------------------------------
// 1. HEALTH & SYSTEM STATUS
// ---------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.2.0',
    app: 'MOVIFASHION AI',
    persistence: supabase ? 'Supabase PostgreSQL' : 'In-Memory Secure Store',
    supabase: Boolean(supabase),
    tablas: lastSchemaCheck.tablas,
    faltantes: lastSchemaCheck.faltantes,
    totalProducts: products.length,
    totalCategories: categories.length,
    timestamp: new Date().toISOString(),
  });
});

// Dynamic XML Sitemap for Search Engines (Google, Bing)
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = EMPRESA.sitioWeb || 'https://movifashion.vercel.app';
  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/catalogo', priority: '0.9', changefreq: 'daily' },
    { loc: '/nueva-coleccion', priority: '0.9', changefreq: 'weekly' },
    { loc: '/tendencias', priority: '0.8', changefreq: 'daily' },
    { loc: '/descuentos', priority: '0.8', changefreq: 'daily' },
    { loc: '/asistente', priority: '0.7', changefreq: 'monthly' },
    { loc: '/nosotros', priority: '0.6', changefreq: 'monthly' },
    { loc: '/mision-vision', priority: '0.6', changefreq: 'monthly' },
    { loc: '/contacto', priority: '0.6', changefreq: 'monthly' },
    { loc: '/pqrs', priority: '0.6', changefreq: 'monthly' },
    { loc: '/preguntas-frecuentes', priority: '0.6', changefreq: 'weekly' },
    { loc: '/guia-de-tallas', priority: '0.6', changefreq: 'monthly' },
    { loc: '/envios', priority: '0.6', changefreq: 'monthly' },
    { loc: '/cambios-y-devoluciones', priority: '0.6', changefreq: 'monthly' },
    { loc: '/terminos-y-condiciones', priority: '0.5', changefreq: 'yearly' },
    { loc: '/politica-de-privacidad', priority: '0.5', changefreq: 'yearly' },
    { loc: '/politica-de-cookies', priority: '0.5', changefreq: 'yearly' },
  ];

  const categoryRoutes = categories.map(c => ({
    loc: `/catalogo/${c.id}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const productRoutes = products.map(p => ({
    loc: `/producto/${p.id}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allUrls = [...staticRoutes, ...categoryRoutes, ...productRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = EMPRESA.sitioWeb || 'https://movifashion.vercel.app';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Rate limiting map for contact messages (IP -> count & reset time)
const contactRateLimits = new Map<string, { count: number; resetAt: number }>();

// Contact form endpoint with honeypot and rate limit
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, hp } = req.body;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

    // Honeypot check: reject bots silently
    if (hp) {
      res.json({ success: true, message: 'Mensaje recibido' });
      return;
    }

    // Rate limiting: 5 messages per 30 minutes
    const now = Date.now();
    const rate = contactRateLimits.get(ip) || { count: 0, resetAt: now + 30 * 60 * 1000 };
    if (now > rate.resetAt) {
      rate.count = 0;
      rate.resetAt = now + 30 * 60 * 1000;
    }
    rate.count++;
    contactRateLimits.set(ip, rate);

    if (rate.count > 5) {
      res.status(429).json({ error: 'Has alcanzado el límite de mensajes por hora. Por favor contáctanos por WhatsApp.' });
      return;
    }

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Nombre, correo y mensaje son obligatorios.' });
      return;
    }

    const newContact: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).slice(0, 100),
      email: String(email).slice(0, 100),
      phone: phone ? String(phone).slice(0, 30) : undefined,
      subject: String(subject || 'consulta_general').slice(0, 100),
      message: String(message).slice(0, 1500),
      ip,
      created_at: new Date().toISOString(),
    };

    contactMessages.push(newContact);

    if (supabase) {
      try {
        await supabase.from('contact_messages').insert({
          id: newContact.id,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          subject: newContact.subject,
          message: newContact.message,
          ip: newContact.ip,
        });
      } catch (err: any) {
        console.warn('[CONTACT] Fallback in-memory:', err.message);
      }
    }

    recordAudit({
      eventType: 'API_REQUEST',
      severity: 'info',
      description: `Nuevo mensaje de contacto recibido de ${newContact.name} (${newContact.email})`,
      ip,
      userRole: 'cliente',
      status: 'SUCCESS',
    });

    res.json({ success: true, message: 'Mensaje registrado con éxito. Te responderemos a la brevedad.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al procesar el mensaje de contacto.' });
  }
});

// PQRS Official Filing endpoint (Radicación con número oficial)
app.post('/api/pqrs', async (req: Request, res: Response) => {
  try {
    const { type, fullName, docType, docNumber, email, phone, orderId, subject, description, hp } = req.body;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

    if (hp) {
      res.json({ success: true, radicado: `PQRS-${new Date().getFullYear()}-000101` });
      return;
    }

    if (!fullName || !email || !docNumber || !subject || !description) {
      res.status(400).json({ error: 'Completa todos los campos obligatorios del radicado PQRS.' });
      return;
    }

    const radicado = `PQRS-${new Date().getFullYear()}-${String(pqrsRadicadoSequence++).padStart(6, '0')}`;
    const newPqrs: PQRSItem = {
      id: `pqrs-${Date.now()}`,
      radicado,
      type: type || 'reclamo',
      fullName: String(fullName).slice(0, 120),
      docType: docType || 'CC',
      docNumber: String(docNumber).slice(0, 30),
      email: String(email).slice(0, 100),
      phone: phone ? String(phone).slice(0, 30) : undefined,
      orderId: orderId ? String(orderId).slice(0, 30) : undefined,
      subject: String(subject).slice(0, 150),
      description: String(description).slice(0, 2500),
      status: 'recibido',
      responseDeadline: '15 días hábiles',
      ip,
      createdAt: new Date().toISOString(),
    };

    pqrsList.push(newPqrs);

    if (supabase) {
      try {
        await supabase.from('pqrs').insert({
          id: newPqrs.id,
          radicado: newPqrs.radicado,
          type: newPqrs.type,
          full_name: newPqrs.fullName,
          doc_type: newPqrs.docType,
          doc_number: newPqrs.docNumber,
          email: newPqrs.email,
          phone: newPqrs.phone,
          order_id: newPqrs.orderId,
          subject: newPqrs.subject,
          description: newPqrs.description,
          status: newPqrs.status,
          response_deadline: newPqrs.responseDeadline,
          ip: newPqrs.ip,
        });
      } catch (err: any) {
        console.warn('[PQRS] Fallback in-memory:', err.message);
      }
    }

    recordAudit({
      eventType: 'API_REQUEST',
      severity: 'info',
      description: `Radicada nueva PQRS con número: ${radicado} (${newPqrs.email})`,
      ip,
      userRole: 'cliente',
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      radicado,
      responseDeadline: '15 días hábiles',
      message: `Tu solicitud ha sido radicada con el número ${radicado}. Hemos enviado la constancia formal a tu correo.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al radicar la solicitud PQRS.' });
  }
});

// Lookup PQRS status by radicado
app.get('/api/pqrs/:radicado', async (req: Request, res: Response) => {
  try {
    const radicadoInput = String(req.params.radicado || '').trim().toUpperCase();
    let found = pqrsList.find(p => p.radicado.toUpperCase() === radicadoInput);

    if (!found && supabase) {
      try {
        const { data } = await supabase.from('pqrs').select('*').eq('radicado', radicadoInput).single();
        if (data) {
          found = {
            id: data.id,
            radicado: data.radicado,
            type: data.type,
            fullName: data.full_name,
            docType: data.doc_type,
            docNumber: data.doc_number,
            email: data.email,
            phone: data.phone,
            orderId: data.order_id,
            subject: data.subject,
            description: data.description,
            status: data.status,
            responseMessage: data.response_message,
            responseDeadline: data.response_deadline || '15 días hábiles',
            ip: data.ip || '127.0.0.1',
            createdAt: data.created_at,
          };
        }
      } catch {}
    }

    if (!found) {
      res.status(404).json({ error: `No se encontró ninguna solicitud con el radicado ${radicadoInput}.` });
      return;
    }

    res.json({ success: true, pqrs: found });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar el radicado PQRS.' });
  }
});

// Newsletter subscription with Ley 1581 consent
app.post('/api/newsletter', async (req: Request, res: Response) => {
  try {
    const { email, consent, source } = req.body;
    const ip = req.ip || '127.0.0.1';

    if (!consent) {
      res.status(400).json({ error: 'Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012.' });
      return;
    }

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    newsletterSubscribers.push({
      email: cleanEmail,
      consent: true,
      ip,
      created_at: new Date().toISOString(),
    });

    if (supabase) {
      try {
        await supabase.from('newsletter_subscribers').upsert({
          email: cleanEmail,
          consent: true,
          source: source || 'web_footer',
          ip,
        });
      } catch (err: any) {
        console.warn('[NEWSLETTER] Fallback in-memory:', err.message);
      }
    }

    res.json({ success: true, message: '¡Gracias por suscribirte a nuestro boletín!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error procesando la suscripción al boletín.' });
  }
});

// Coupon validation
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Código de cupón requerido.' });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = activeCoupons.find(c => c.code === cleanCode && c.active);

    if (!coupon) {
      res.status(404).json({ error: 'El cupón no existe o ha expirado.' });
      return;
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minSubtotal && orderSubtotal < coupon.minSubtotal) {
      res.status(400).json({
        error: `Este cupón exige una compra mínima de $${coupon.minSubtotal.toLocaleString('es-CO')} COP.`,
      });
      return;
    }

    const discountAmount = Math.round((orderSubtotal * coupon.discountPercent) / 100);

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error validando el cupón de descuento.' });
  }
});

// Diagnostic endpoint: GET /api/auth/debug (dev or admin only)
app.get('/api/auth/debug', (req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const token = extractToken(req);
  let tokenValid = false;
  let decodedUser: any = null;

  if (token) {
    try {
      decodedUser = jwt.verify(token, JWT_SECRET);
      tokenValid = true;
    } catch {
      tokenValid = false;
    }
  }

  const isAdmin = decodedUser?.role === 'admin';
  if (!isDev && !isAdmin) {
    res.status(403).json({ error: 'Acceso restringido al diagnóstico de autenticación.' });
    return;
  }

  res.json({
    hasCookie: Boolean(req.cookies?.[COOKIE_NAME]),
    hasBearer: Boolean(req.headers.authorization?.toLowerCase().startsWith('bearer ')),
    tokenReceived: Boolean(token),
    tokenValid,
    jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
    userRole: decodedUser?.role || null,
    userEmail: decodedUser?.email || null,
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------
// 2. AUTHENTICATION ENDPOINTS (Dual Token Support: Cookie + Bearer)
// ---------------------------------------------------------------------

// Register (Creates 'cliente' role only)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe contener mínimo 8 caracteres.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check database configuration
    if (!supabase) {
      if (process.env.NODE_ENV === 'production') {
        res.status(503).json({ error: 'Base de datos no configurada' });
        return;
      }
      console.warn('ATENCIÓN: sin Supabase los usuarios se pierden al reiniciar');
    }

    if (supabase) {
      // 1. Check uniqueness in Supabase app_users
      const { data: existing, error: checkErr } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkErr) {
        console.error('[AUTH ERROR] Error comprobando correo en Supabase app_users:', checkErr);
        res.status(500).json({ error: 'No se pudo guardar tu cuenta, intenta de nuevo' });
        return;
      }

      if (existing) {
        res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        return;
      }

      // 2. Insert into Supabase app_users
      const password_hash = hashPassword(password);
      const { data: inserted, error: insertErr } = await supabase
        .from('app_users')
        .insert({
          name: name.trim(),
          email: normalizedEmail,
          password_hash,
          role: 'cliente',
          role_id: 'cliente',
          estado: 'activo',
        })
        .select('id, name, email, role, created_at')
        .single();

      if (insertErr || !inserted) {
        console.error('[AUTH ERROR] Error insertando usuario en Supabase app_users:', insertErr);
        res.status(500).json({ error: 'No se pudo guardar tu cuenta, intenta de nuevo' });
        return;
      }

      const newUser: DBUser = {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        password_hash,
        role: 'cliente',
        roleId: 'cliente',
        created_at: inserted.created_at,
      };
      inMemoryUsers.push(newUser);

      const token = generateToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'cliente',
        roleId: 'cliente',
      });

      res.cookie(COOKIE_NAME, token, cookieOptions);

      recordAudit({
        eventType: 'AUTH_REGISTER',
        severity: 'info',
        description: `Nuevo cliente registrado en Supabase: ${newUser.email}`,
        ip: req.ip || '127.0.0.1',
        userRole: 'cliente',
        status: 'SUCCESS',
      });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: 'cliente',
          roleId: 'cliente',
        },
      });
      return;
    }

    // In-memory branch (only in non-production when Supabase is not configured)
    if (inMemoryUsers.some(u => u.email === normalizedEmail)) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }

    const password_hash = hashPassword(password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: DBUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      role: 'cliente',
      roleId: 'cliente',
      created_at: new Date().toISOString(),
    };
    inMemoryUsers.push(newUser);

    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'cliente',
      roleId: 'cliente',
    });

    res.cookie(COOKIE_NAME, token, cookieOptions);

    recordAudit({
      eventType: 'AUTH_REGISTER',
      severity: 'info',
      description: `Nuevo cliente registrado en memoria local: ${newUser.email}`,
      ip: req.ip || '127.0.0.1',
      userRole: 'cliente',
      status: 'SUCCESS',
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'cliente',
        roleId: 'cliente',
      },
    });
  } catch (error: any) {
    console.error('[AUTH REGISTER EXCEPTION]', error);
    res.status(500).json({ error: 'Error interno al registrar usuario.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Ingresa correo y contraseña.' });
      return;
    }

    const normalizedEmail = (email as string).trim().toLowerCase();
    const rateKey = `${req.ip || '127.0.0.1'}_${normalizedEmail}`;

    if (!checkLoginRateLimit(rateKey)) {
      recordAudit({
        eventType: 'AUTH_LOGIN',
        severity: 'alert',
        description: `Bloqueo temporal por intentos fallidos para: ${normalizedEmail}`,
        ip: req.ip || '127.0.0.1',
        userRole: 'cliente',
        status: 'BLOCKED',
      });
      res.status(429).json({ error: 'Demasiados intentos fallidos. Intente nuevamente en 15 minutos.' });
      return;
    }

    if (!supabase) {
      if (process.env.NODE_ENV === 'production') {
        res.status(503).json({ error: 'Base de datos no configurada' });
        return;
      }
      console.warn('ATENCIÓN: sin Supabase los usuarios se pierden al reiniciar');
    }

    // Check if logging in as Admin with active credentials
    const isAdminCredentials =
      shouldCreateAdmin &&
      effectiveAdminEmail &&
      effectiveAdminPassword &&
      normalizedEmail === effectiveAdminEmail &&
      password === effectiveAdminPassword;

    let foundUser: DBUser | null = null;

    if (isAdminCredentials) {
      const adminHash = hashPassword(effectiveAdminPassword);
      // Ensure sync to Supabase app_users if active
      if (supabase) {
        try {
          const { data: supaAdmin } = await supabase
            .from('app_users')
            .select('id')
            .eq('email', effectiveAdminEmail)
            .maybeSingle();

          if (!supaAdmin) {
            await supabase.from('app_users').insert({
              id: 'admin-seed-uuid-01',
              name: 'Administrador MOVIFASHION',
              email: effectiveAdminEmail,
              password_hash: adminHash,
              role: 'admin',
              role_id: 'super_admin',
              estado: 'activo',
            });
          } else {
            await supabase.from('app_users').update({
              password_hash: adminHash,
              role: 'admin',
              role_id: 'super_admin',
              estado: 'activo',
            }).eq('id', supaAdmin.id);
          }
        } catch (err: any) {
          console.warn('[ADMIN LOGIN SYNC WARNING]', err.message);
        }
      }

      foundUser = {
        id: 'admin-seed-uuid-01',
        name: 'Administrador MOVIFASHION',
        email: effectiveAdminEmail,
        password_hash: adminHash,
        role: 'admin',
        roleId: 'super_admin',
        permissions: getCachedPermissions('super_admin'),
        estado: 'activo',
        created_at: new Date().toISOString(),
      };

      const existingMem = inMemoryUsers.find(u => u.email.toLowerCase() === effectiveAdminEmail);
      if (!existingMem) inMemoryUsers.push(foundUser);
      else Object.assign(existingMem, foundUser);
    } else {
      // Lookup in Supabase app_users first if supabase is configured
      if (supabase) {
        try {
          const { data: supaUser, error: supaErr } = await supabase
            .from('app_users')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (supaErr) {
            console.error('[AUTH ERROR] Error buscando usuario en Supabase:', supaErr);
          } else if (supaUser) {
            const roleId = supaUser.role_id || supaUser.role;
            const mappedRole = supaUser.role === 'admin' || roleId === 'super_admin' ? 'admin' : roleId;
            foundUser = {
              id: supaUser.id,
              name: supaUser.name,
              email: supaUser.email,
              password_hash: supaUser.password_hash,
              role: mappedRole,
              roleId,
              permissions: getCachedPermissions(roleId),
              mfa_secret: supaUser.mfa_secret,
              mfaEnabled: supaUser.mfa_enabled,
              mustChangePassword: supaUser.must_change_password,
              estado: supaUser.estado || 'activo',
              created_at: supaUser.created_at,
            };

            const existingMem = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
            if (!existingMem) inMemoryUsers.push(foundUser);
            else Object.assign(existingMem, foundUser);
          }
        } catch (err: any) {
          console.warn('[AUTH LOGIN] Supabase lookup error:', err.message);
        }
      }

      // Memory lookup if not found in Supabase (e.g. dev demo users or memory store)
      if (!foundUser) {
        foundUser = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail) || null;
      }
    }

    if (!foundUser || (!isAdminCredentials && !verifyPassword(password, foundUser.password_hash))) {
      recordAudit({
        eventType: 'AUTH_FAILED',
        severity: 'warning',
        description: `Intento de inicio de sesión fallido para: ${normalizedEmail}`,
        ip: req.ip || '127.0.0.1',
        userRole: 'cliente',
        status: 'FLAGGED',
      });
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // Check account status
    if (foundUser.estado === 'suspendido') {
      res.status(403).json({ error: 'Tu cuenta de usuario ha sido suspendida. Contacta al administrador.' });
      return;
    }

    // Two-Factor Authentication Check
    if (foundUser.mfaEnabled) {
      if (!totpCode) {
        res.status(200).json({
          mfaRequired: true,
          email: foundUser.email,
          message: 'Se requiere código de autenticación de dos factores (TOTP).',
        });
        return;
      }

      const isValidTotp = verifyTotpCode(foundUser.mfa_secret || '', String(totpCode).trim());
      if (!isValidTotp) {
        res.status(401).json({ error: 'Código de verificación 2FA incorrecto o expirado.' });
        return;
      }
    }

    resetLoginRateLimit(rateKey);
    foundUser.lastLoginAt = new Date().toISOString();

    const effectiveRole = foundUser.role;
    const effectiveRoleId = foundUser.roleId || (effectiveRole === 'admin' ? 'super_admin' : effectiveRole);
    const permissions = getCachedPermissions(effectiveRoleId);

    const token = generateToken({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: effectiveRole,
      roleId: effectiveRoleId,
    });

    res.cookie(COOKIE_NAME, token, cookieOptions);

    recordAudit({
      eventType: 'AUTH_LOGIN',
      severity: 'info',
      description: `Inicio de sesión exitoso: ${foundUser.email} (${effectiveRoleId})`,
      ip: req.ip || '127.0.0.1',
      userRole: effectiveRole,
      status: 'SUCCESS',
    });

    // Return token in body as dual-auth backup with permissions and staff metadata
    res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: effectiveRole,
        roleId: effectiveRoleId,
        permissions,
        mfaEnabled: Boolean(foundUser.mfaEnabled),
        mustChangePassword: Boolean(foundUser.mustChangePassword),
        estado: foundUser.estado || 'activo',
      },
    });
  } catch (error: any) {
    console.error('[AUTH LOGIN EXCEPTION]', error);
    res.status(500).json({ error: 'Error interno en inicio de sesión.' });
  }
});

// Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ message: 'Sesión cerrada correctamente.' });
});

// Me (Session restoration via Cookie OR Bearer token)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const foundUser = inMemoryUsers.find(
      u => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase()
    );

    if (foundUser && foundUser.estado === 'suspendido') {
      res.status(403).json({ error: 'Tu cuenta ha sido suspendida.' });
      return;
    }

    const effectiveRole = foundUser?.role || decoded.role;
    const effectiveRoleId = foundUser?.roleId || decoded.roleId || (effectiveRole === 'admin' ? 'super_admin' : effectiveRole);
    const permissions = getCachedPermissions(effectiveRoleId);

    res.json({
      user: {
        id: decoded.id,
        name: foundUser?.name || decoded.name,
        email: decoded.email,
        role: effectiveRole,
        roleId: effectiveRoleId,
        permissions,
        mfaEnabled: Boolean(foundUser?.mfaEnabled),
        mustChangePassword: Boolean(foundUser?.mustChangePassword),
        estado: foundUser?.estado || 'activo',
      },
    });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Sesión expirada' });
    } else {
      res.status(401).json({ error: 'Sesión inválida' });
    }
  }
});

// ---------------------------------------------------------------------
// 3. PRODUCT CATALOG ENDPOINTS
// ---------------------------------------------------------------------

// Products: GET with search & filters (Public)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, brand, sort } = req.query;
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(
      p => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (brand && brand !== 'all') {
    filtered = filtered.filter(
      p => p.brand.toLowerCase() === (brand as string).toLowerCase()
    );
  }

  if (minPrice) {
    filtered = filtered.filter(p => (p.discountPrice || p.price) >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => (p.discountPrice || p.price) <= Number(maxPrice));
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'price-asc') {
    filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  res.json({
    total: filtered.length,
    products: filtered,
  });
});

// Products: GET by ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }
  res.json(product);
});

// Products: POST (Admin only)
app.post('/api/products', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newProduct: Product = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0,
      inventory: Number(req.body.inventory) || 0,
      price: Number(req.body.price) || 0,
    };

    products.unshift(newProduct);

    if (supabase) {
      try {
        await supabase.from('app_products').insert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: newProduct.category,
          brand: newProduct.brand,
          price: newProduct.price,
          discount_price: newProduct.discountPrice || null,
          inventory: newProduct.inventory,
          description: newProduct.description,
          images: newProduct.images,
          colors: newProduct.colors,
          sizes: newProduct.sizes,
          color_images: newProduct.colorImages || {},
          tags: newProduct.tags,
          rating: newProduct.rating,
          review_count: newProduct.reviewCount,
          is_popular: newProduct.isPopular || false,
          is_featured: newProduct.isNew || false,
        });
      } catch (err: any) {
        console.warn('[PRODUCTS] Error inserting product to Supabase:', err.message);
      }
    }

    recordAudit({
      eventType: 'ADMIN_CHANGE',
      severity: 'info',
      description: `Nuevo producto creado: ${newProduct.name} (${newProduct.category})`,
      ip: req.ip || '127.0.0.1',
      userRole: 'admin',
      status: 'SUCCESS',
    });

    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Products: PUT (Admin only)
app.put('/api/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    products[index] = { ...products[index], ...req.body };

    if (supabase) {
      try {
        const p = products[index];
        await supabase
          .from('app_products')
          .update({
            name: p.name,
            category: p.category,
            brand: p.brand,
            price: p.price,
            discount_price: p.discountPrice || null,
            inventory: p.inventory,
            description: p.description,
            images: p.images,
            colors: p.colors,
            sizes: p.sizes,
            color_images: p.colorImages || {},
            tags: p.tags,
            rating: p.rating,
            review_count: p.reviewCount,
            is_popular: p.isPopular || false,
            is_featured: p.isNew || false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err: any) {
        console.warn('[PRODUCTS] Error updating product in Supabase:', err.message);
      }
    }

    recordAudit({
      eventType: 'ADMIN_CHANGE',
      severity: 'info',
      description: `Producto modificado: ${products[index].name} - Stock: ${products[index].inventory}, Precio: ${products[index].price}`,
      ip: req.ip || '127.0.0.1',
      userRole: 'admin',
      status: 'SUCCESS',
    });

    res.json(products[index]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Products: DELETE (Admin only)
app.delete('/api/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const beforeCount = products.length;
    products = products.filter(p => p.id !== id);

    if (products.length === beforeCount) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    if (supabase) {
      try {
        await supabase.from('app_products').delete().eq('id', id);
      } catch (err: any) {
        console.warn('[PRODUCTS] Error deleting product in Supabase:', err.message);
      }
    }

    recordAudit({
      eventType: 'ADMIN_CHANGE',
      severity: 'warning',
      description: `Producto eliminado: ID ${id}`,
      ip: req.ip || '127.0.0.1',
      userRole: 'admin',
      status: 'SUCCESS',
    });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ---------------------------------------------------------------------
// 3.1 CATEGORIES CRUD & PRODUCT COUNTS
// ---------------------------------------------------------------------

// Categories: GET (Public - with dynamic itemCount)
app.get('/api/categories', (_req: Request, res: Response) => {
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    itemCount: products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length,
  }));
  res.json(categoriesWithCounts);
});

// Categories: POST (Admin only)
app.post('/api/categories', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, iconName } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Nombre de categoría requerido' });
      return;
    }
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newCat: ProductCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      description: description || '',
      iconName: iconName || 'Sparkles',
      itemCount: 0,
    };

    categories.push(newCat);

    if (supabase) {
      try {
        await supabase.from('app_categories').insert({
          id: newCat.id,
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          icon_name: newCat.iconName,
          sort_order: categories.length,
        });
      } catch (err: any) {
        console.warn('[CATEGORIES] Error inserting to Supabase:', err.message);
      }
    }

    res.status(201).json(newCat);
  } catch {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Categories: PUT (Admin only)
app.put('/api/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    categories[index] = { ...categories[index], ...req.body };

    if (supabase) {
      try {
        const c = categories[index];
        await supabase
          .from('app_categories')
          .update({
            name: c.name,
            description: c.description,
            icon_name: c.iconName,
          })
          .eq('id', id);
      } catch (err: any) {
        console.warn('[CATEGORIES] Error updating in Supabase:', err.message);
      }
    }

    res.json(categories[index]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Categories: DELETE (Admin only)
app.delete('/api/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cat = categories.find(c => c.id === id);
    if (!cat) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    const linkedProducts = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase());
    if (linkedProducts.length > 0) {
      res.status(400).json({
        error: `No se puede eliminar la categoría porque tiene ${linkedProducts.length} productos asociados.`,
      });
      return;
    }

    categories = categories.filter(c => c.id !== id);

    if (supabase) {
      try {
        await supabase.from('app_categories').delete().eq('id', id);
      } catch (err: any) {
        console.warn('[CATEGORIES] Error deleting in Supabase:', err.message);
      }
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// ---------------------------------------------------------------------
// 3.2 PRODUCT IMAGE UPLOAD (Admin only - Supabase Storage or Local)
// ---------------------------------------------------------------------
app.post('/api/admin/upload-image', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, filename, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Imagen base64 requerida' });
      return;
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 1 MB check
    if (buffer.length > 1024 * 1024) {
      res.status(400).json({ error: 'La imagen excede el límite máximo de 1 MB' });
      return;
    }

    const cleanFilename = (filename || `product-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-');
    const safeName = `${cleanFilename.replace(/\.[a-z]+$/, '')}-${Date.now()}.jpg`;

    // 1. If Supabase Storage bucket 'productos' exists, upload to Supabase
    if (supabase) {
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('productos')
          .upload(safeName, buffer, {
            contentType: mimeType || 'image/jpeg',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from('productos').getPublicUrl(safeName);
          if (urlData?.publicUrl) {
            res.json({ url: urlData.publicUrl });
            return;
          }
        }
      } catch (storageErr: any) {
        console.warn('[STORAGE] Supabase Storage upload skipped/failed:', storageErr.message);
      }
    }

    // 2. Local public fallback
    const uploadDir = path.resolve(__dirname, 'public', 'images', 'products', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    res.json({ url: `/images/products/uploads/${safeName}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Error procesando la subida de imagen' });
  }
});

// ---------------------------------------------------------------------
// 4. ASISTENTE INTELIGENTE CON IA (Conversational Fashion Stylist)
// ---------------------------------------------------------------------
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mensaje requerido' });
      return;
    }

    const token = extractToken(req);
    let currentUser: JWTPayload | null = null;
    if (token) {
      currentUser = verifyToken(token);
    }

    const result = await processAssistantChat({
      message,
      history: Array.isArray(history) ? history : [],
      catalog: products,
      orders,
      pqrsList,
      currentUser,
      aiClient: ai,
    });

    // Record assistant event in app_events with detected intent and resolved status
    const eventRecord: StoredEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: (req.headers['x-session-id'] as string) || `sess_${Date.now()}`,
      user_id: currentUser?.id,
      event_type: 'consulta_asistente',
      metadata: {
        query: message.trim().slice(0, 300),
        intent: result.intent,
        resolved: result.resolved,
        productsCount: result.productIds.length,
      },
      simulated: false,
      created_at: new Date().toISOString(),
    };
    appEvents.push(eventRecord);
    if (supabase) {
      (async () => {
        try {
          await supabase.from('app_events').insert(eventRecord);
        } catch {}
      })();
    }

    const recommendedProducts = products.filter(p => result.productIds.includes(p.id));

    res.json({
      reply: result.reply,
      productIds: result.productIds,
      recommendedProducts,
      suggestions: result.suggestions,
      intent: result.intent,
      resolved: result.resolved,
    });
  } catch (error: any) {
    console.error('[ASSISTANT ROUTE ERROR]', error);
    res.status(500).json({ error: 'Error procesando la solicitud del asistente' });
  }
});

// ---------------------------------------------------------------------
// 5. MOTOR HÍBRIDO DE RECOMENDACIONES
// ---------------------------------------------------------------------
app.get('/api/recommendations', (req: Request, res: Response) => {
  const { productId } = req.query;
  const baseProduct = products.find(p => p.id === productId) || products[0];

  const recommendations = products
    .map(p => {
      let score = 50;
      let reason: any = 'También podría interesarte';

      if (p.id === baseProduct.id) {
        score = 0;
      } else if (p.category === baseProduct.category) {
        score += 35;
        reason = 'Productos similares';
      } else if (
        (baseProduct.category === 'Zapatos' && (p.category === 'Pantalones' || p.category === 'Chaquetas')) ||
        (baseProduct.category === 'Chaquetas' && (p.category === 'Camisetas' || p.category === 'Bolsos'))
      ) {
        score += 40;
        reason = 'Completa tu outfit';
      } else if (p.isPopular) {
        score += 25;
        reason = 'Basado en tus búsquedas';
      } else {
        score += 20;
        reason = 'Porque te gustó este producto';
      }

      return {
        id: `rec-${p.id}`,
        product: p,
        affinityScore: Math.min(score, 98),
        reason,
        recommendedAt: new Date().toISOString(),
      };
    })
    .filter(r => r.affinityScore > 50)
    .sort((a, b) => b.affinityScore - a.affinityScore)
    .slice(0, 6);

  res.json({ recommendations });
});

// ---------------------------------------------------------------------
// 6. BÚSQUEDA VISUAL
// ---------------------------------------------------------------------
app.post('/api/visual-search', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Imagen base64 requerida' });
      return;
    }

    let detectedGarment = 'Calzado deportivo contemporáneo';
    let detectedPalette = ['Morado', 'Lavanda', 'Blanco', 'Gris'];
    let matchedIds: string[] = [];

    if (ai) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imagePart = {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        };
        const textPrompt = `Analiza esta prenda o accesorio de moda. Devuelve un JSON:
{
  "garmentType": "tipo de prenda detectado en español",
  "colors": ["color1", "color2"],
  "category": "Camisetas|Pantalones|Vestidos|Chaquetas|Zapatos|Bolsos|Accesorios|Ropa deportiva",
  "styleKeywords": ["palabra1", "palabra2"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, { text: textPrompt }] },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        detectedGarment = parsed.garmentType || detectedGarment;
        if (parsed.colors) detectedPalette = parsed.colors;

        const candidateCategory = parsed.category;
        const matches = products.filter(p => p.category.toLowerCase() === candidateCategory?.toLowerCase());
        matchedIds = matches.map(m => m.id);
      } catch (err: any) {
        console.warn('Gemini visual search fallback:', err.message);
      }
    }

    if (matchedIds.length === 0) {
      matchedIds = [products[0].id, products[1].id, products[2].id];
    }

    const matchedProducts = products.filter(p => matchedIds.includes(p.id));

    res.json({
      detectedGarment,
      detectedPalette,
      similarityScore: 94.6,
      matchedProducts,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error procesando búsqueda visual' });
  }
});

// ---------------------------------------------------------------------
// 7. PEDIDOS Y CHECKOUT (Protected with RBAC, Dual-Auth)
// ---------------------------------------------------------------------

function mapSupabaseOrderToModel(row: any): Order {
  const items = Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : []);
  const shippingAddress = typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : (row.shipping_address || {});
  const subtotal = Number(row.subtotal) || 0;
  const subtotalBase = row.subtotal_base != null ? Number(row.subtotal_base) : calcularBaseGravable(subtotal);
  const iva = row.iva != null ? Number(row.iva) : calcularIva(subtotal);

  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name || shippingAddress.recipientName || '',
    userEmail: row.user_email || '',
    items,
    subtotal,
    subtotalBase,
    iva,
    tarifaIva: row.tarifa_iva != null ? Number(row.tarifa_iva) : 0.19,
    shipping: Number(row.shipping) || 0,
    discount: Number(row.discount) || 0,
    couponCode: row.coupon_code || undefined,
    total: Number(row.total) || 0,
    status: row.status || 'Pendiente',
    shippingAddress,
    paymentMethod: row.payment_method || 'credit_card',
    paymentStatus: row.payment_status || 'paid',
    trackingNumber: row.tracking_number || '',
    simulated: Boolean(row.simulated),
    createdAt: row.created_at || new Date().toISOString(),
    customer: {
      name: row.user_name || shippingAddress.recipientName || '',
      email: row.user_email || '',
      phone: shippingAddress.phone || '',
      documentId: shippingAddress.documentId || '1020304050',
      address: shippingAddress.street || '',
      city: shippingAddress.city || 'Bogotá',
    },
  };
}

function hasPermission(user: JWTPayload | undefined, perm: string): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'super_admin' || user.roleId === 'super_admin') return true;
  const userPerms = getCachedPermissions(user.roleId || user.role);
  return userPerms.includes('*') || userPerms.includes(perm);
}

// Admin and staff with 'pedidos.ver' see ALL orders
app.get('/api/orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const canView = user.role === 'admin' || user.roleId === 'super_admin' || hasPermission(user, 'pedidos.ver');
  if (!canView) {
    res.status(403).json({ error: 'Acceso denegado: se requieren permisos para ver pedidos' });
    return;
  }

  if (supabase) {
    try {
      const { data: supaOrders, error } = await supabase
        .from('app_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ORDERS GET ALL ERROR]', error);
        res.status(500).json({ error: 'Error cargando pedidos desde la base de datos' });
        return;
      }

      const formatted = (supaOrders || []).map(mapSupabaseOrderToModel);
      res.json({ orders: formatted });
      return;
    } catch (err: any) {
      console.error('[ORDERS GET ALL EXCEPTION]', err);
      res.status(500).json({ error: 'Error procesando consulta de pedidos' });
      return;
    }
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders: sorted });
});

// Client sees ONLY their own orders
app.get('/api/orders/mine', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (supabase) {
    try {
      let query = supabase
        .from('app_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.id && user.id.includes('-') && user.id.length > 20) {
        query = query.or(`user_id.eq.${user.id},user_email.eq.${user.email.toLowerCase()}`);
      } else {
        query = query.eq('user_email', user.email.toLowerCase());
      }

      const { data: supaOrders, error } = await query;
      if (error) {
        console.error('[ORDERS MINE ERROR]', error);
        res.status(500).json({ error: 'Error consultando tus pedidos en la base de datos' });
        return;
      }

      const formatted = (supaOrders || []).map(mapSupabaseOrderToModel);
      res.json({ orders: formatted });
      return;
    } catch (err: any) {
      console.error('[ORDERS MINE EXCEPTION]', err);
      res.status(500).json({ error: 'Error consultando tus pedidos' });
      return;
    }
  }

  const userOrders = orders
    .filter(o => o.userId === user.id || o.userEmail?.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders: userOrders });
});

// Create Order (Requires authentication, validates server inventory/prices, 1.5s simulated gateway)
app.post('/api/orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, cardLast4, couponCode, discount, documentId } = req.body;
    const user = req.user!;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'El carrito no puede estar vacío' });
      return;
    }

    // Backend verification of prices and inventory
    let calculatedSubtotal = 0;
    for (const item of items) {
      const prodId = item.productId || item.product?.id;
      const originalProd = products.find(p => p.id === prodId);
      if (!originalProd) {
        res.status(400).json({ error: `Producto no válido: ${item.product?.name || prodId}` });
        return;
      }
      const realPrice = originalProd.discountPrice || originalProd.price;
      calculatedSubtotal += realPrice * (item.quantity || 1);

      if (originalProd.inventory < (item.quantity || 1)) {
        res.status(400).json({
          error: `Inventario insuficiente para ${originalProd.name} (disponibles: ${originalProd.inventory})`,
        });
        return;
      }
    }

    // Validate coupon discount on server
    let validatedDiscount = 0;
    let appliedCouponCode: string | undefined = undefined;
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = activeCoupons.find(c => c.code === cleanCode && c.active);
      if (coupon) {
        if (!coupon.minSubtotal || calculatedSubtotal >= coupon.minSubtotal) {
          validatedDiscount = Math.round((calculatedSubtotal * coupon.discountPercent) / 100);
          appliedCouponCode = coupon.code;
        }
      }
    } else if (typeof discount === 'number' && discount > 0) {
      validatedDiscount = Math.min(discount, Math.round(calculatedSubtotal * 0.3));
    }

    // Simulated payment gateway processing delay (~1.5 seconds)
    await new Promise(r => setTimeout(r, 1500));

    // Shipping rule: Free from $200.000 COP, else $12.000 COP
    const effectiveSubtotal = Math.max(0, calculatedSubtotal - validatedDiscount);
    const shipping = effectiveSubtotal >= EMPRESA.umbralEnvioGratis ? 0 : EMPRESA.costoEnvioNacional;
    const total = effectiveSubtotal + shipping;

    // Colombian Tax Disclosure (IVA 19% Estatuto Tributario)
    const baseGravable = calcularBaseGravable(effectiveSubtotal);
    const valorIva = effectiveSubtotal - baseGravable;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `MOV-COL-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    // Enrich each item with selected color photo
    const enrichedItems = items.map((item: any) => {
      const prodId = item.productId || item.product?.id;
      const originalProd = products.find(p => p.id === prodId) || item.product;
      const colorName = item.selectedColor?.name || item.color;
      const colorImg = (colorName && originalProd?.colorImages?.[colorName]) || originalProd?.images?.[0] || '';
      return {
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product: {
          id: originalProd.id,
          name: originalProd.name,
          price: originalProd.price,
          discountPrice: originalProd.discountPrice,
          images: originalProd.images,
          colorImages: originalProd.colorImages,
          colors: originalProd.colors,
          sizes: originalProd.sizes,
          image: colorImg,
        },
        selectedSize: item.selectedSize || item.size || 'M',
        selectedColor: item.selectedColor || { name: colorName || 'Estándar', hex: '#25232B' },
        quantity: Number(item.quantity) || 1,
        unitPrice: originalProd.discountPrice || originalProd.price,
      };
    });

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      userName: shippingAddress?.recipientName || user.name,
      userEmail: user.email.toLowerCase(),
      items: enrichedItems,
      subtotal: calculatedSubtotal,
      shipping,
      discount: validatedDiscount,
      total,
      status: paymentMethod === 'cash_on_delivery' ? 'Pendiente' : 'Pagado',
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      trackingNumber,
      simulated: false,
      createdAt: nowIso,
      customer: {
        name: shippingAddress?.recipientName || user.name,
        email: user.email.toLowerCase(),
        phone: shippingAddress?.phone || '',
        documentId: documentId || '1020304050',
        address: shippingAddress?.street || '',
        city: shippingAddress?.city || 'Bogotá',
      },
      subtotalBase: baseGravable,
      iva: valorIva,
      tarifaIva: 0.19,
      couponCode: appliedCouponCode,
    } as any;

    // Persist to Supabase if configured - CRITICAL: if it fails, DO NOT CONFIRM
    if (supabase) {
      const orderRecord = {
        id: newOrder.id,
        user_id: user.id.includes('-') && user.id.length > 20 ? user.id : null,
        user_name: newOrder.userName,
        user_email: newOrder.userEmail,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        subtotal_base: baseGravable,
        iva: valorIva,
        tarifa_iva: 0.19,
        shipping: newOrder.shipping,
        discount: newOrder.discount,
        coupon_code: appliedCouponCode || null,
        total: newOrder.total,
        status: newOrder.status,
        shipping_address: newOrder.shippingAddress,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        tracking_number: newOrder.trackingNumber,
        simulated: false,
        created_at: nowIso,
      };

      const { error: insertErr } = await supabase.from('app_orders').insert(orderRecord);
      if (insertErr) {
        console.error('[ORDERS ERROR] No se pudo guardar el pedido en Supabase app_orders:', insertErr);
        res.status(500).json({ error: 'No se pudo guardar tu pedido en la base de datos, intenta de nuevo.' });
        return;
      }

      // Also persist purchase event
      try {
        await supabase.from('app_events').insert({
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          session_id: (req.headers['x-session-id'] as string) || `sess_${Date.now()}`,
          user_id: user.id.includes('-') && user.id.length > 20 ? user.id : null,
          event_type: 'compra',
          metadata: {
            orderId: newOrder.id,
            total: newOrder.total,
            subtotalBase: baseGravable,
            iva: valorIva,
            paymentMethod,
            itemsCount: items.length,
            cardLast4,
            couponCode: appliedCouponCode,
          },
          simulated: false,
          created_at: nowIso,
        });
      } catch (err: any) {
        console.warn('[ORDERS] Error guardando app_events:', err.message);
      }
    }

    // Deduct stock from verified inventory only AFTER successful DB save
    for (const item of items) {
      const prodId = item.productId || item.product?.id;
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        prod.inventory = Math.max(0, prod.inventory - (item.quantity || 1));
      }
    }

    orders.unshift(newOrder);

    recordAudit({
      eventType: 'ORDER_CREATED',
      severity: 'info',
      description: `Nuevo pedido confirmado: ${newOrder.id} - Total: $${newOrder.total.toLocaleString('es-CO')} COP (${user.email})`,
      ip: req.ip || '127.0.0.1',
      userRole: user.role,
      status: 'SUCCESS',
    });

    res.status(201).json({
      order: newOrder,
      ...newOrder,
    });
  } catch (err: any) {
    console.error('[ORDERS POST EXCEPTION]', err);
    res.status(500).json({ error: 'Error procesando el pedido en el servidor' });
  }
});

// Update order status (Admin only - handles stock restore on cancellation)
app.put('/api/orders/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === id);

    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    const previousStatus = order.status;
    order.status = status;

    // If order was cancelled and wasn't already cancelled, restore inventory
    if (status === 'Cancelado' && previousStatus !== 'Cancelado') {
      for (const item of order.items) {
        const prod = products.find(p => p.id === (item.product?.id || item.id));
        if (prod) {
          prod.inventory += item.quantity || 1;
        }
      }
    }

    if (supabase) {
      try {
        await supabase.from('app_orders').update({ status }).eq('id', id);
      } catch (err: any) {
        console.warn('[ORDERS] Error updating order status in Supabase:', err.message);
      }
    }

    recordAudit({
      eventType: 'ADMIN_CHANGE',
      severity: 'info',
      description: `Estado de pedido ${id} actualizado a: ${status}`,
      ip: req.ip || '127.0.0.1',
      userRole: 'admin',
      status: 'SUCCESS',
    });

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
});

// ---------------------------------------------------------------------
// 8. BIG DATA EVENT TRACKING (POST /api/events)
// ---------------------------------------------------------------------
app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const { sessionId, events } = req.body;
    if (!events || !Array.isArray(events)) {
      res.status(400).json({ error: 'Formato de eventos no válido' });
      return;
    }

    const token = extractToken(req);
    let userId: string | undefined = undefined;
    if (token) {
      const user = verifyToken(token);
      if (user) userId = user.id;
    }

    const newEvents: StoredEvent[] = events.map(e => ({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: sessionId || `sess_${Date.now()}`,
      user_id: userId,
      event_type: e.eventType,
      product_id: e.productId,
      category: e.category,
      metadata: e.metadata || {},
      simulated: false,
      created_at: e.timestamp || new Date().toISOString(),
    }));

    appEvents.push(...newEvents);
    if (appEvents.length > 5000) appEvents = appEvents.slice(-5000);

    if (supabase) {
      try {
        await supabase.from('app_events').insert(newEvents);
      } catch (err: any) {
        console.warn('[EVENTS] Error saving events to Supabase:', err.message);
      }
    }

    res.status(202).json({ received: newEvents.length });
  } catch {
    res.status(500).json({ error: 'Error al registrar eventos' });
  }
});

// ---------------------------------------------------------------------
// 9. CLIENT RETURNS & RETRACTOS (Ley 1480 Art. 47)
// ---------------------------------------------------------------------

// Customer Return / Retracto Request
app.post('/api/returns/request', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { orderId, items, motivo, tipo = 'retracto' } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0 || !motivo) {
      res.status(400).json({ error: 'Faltan datos obligatorios para radicar la solicitud de devolución.' });
      return;
    }

    let order = orders.find(
      o => o.id === orderId && (o.userId === user.id || o.userEmail.toLowerCase() === user.email.toLowerCase())
    );

    if (!order && supabase) {
      try {
        const { data: supaOrder } = await supabase.from('app_orders').select('*').eq('id', orderId).maybeSingle();
        if (supaOrder && (supaOrder.user_id === user.id || supaOrder.user_email?.toLowerCase() === user.email.toLowerCase())) {
          order = mapSupabaseOrderToModel(supaOrder);
        }
      } catch (err: any) {
        console.warn('[RETURNS] Error finding order in Supabase:', err.message);
      }
    }

    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado o no pertenece a tu cuenta.' });
      return;
    }

    // Verify timeframe for retracto (5 business days per Ley 1480)
    const orderDate = new Date(order.createdAt).getTime();
    const diffDays = (Date.now() - orderDate) / (1000 * 60 * 60 * 24);
    if (tipo === 'retracto' && diffDays > 7) {
      res.status(400).json({ error: 'El plazo legal para solicitar retracto (5 días hábiles conforme al Art. 47 Ley 1480) ha vencido.' });
      return;
    }

    let refundAmount = 0;
    const returnItems = items.map((reqItem: any) => {
      const match = order.items.find(i => (i.product?.id || i.id) === reqItem.productId);
      const price = match?.product?.discountPrice || match?.product?.price || reqItem.price || 0;
      const qty = Math.min(reqItem.quantity || 1, match?.quantity || 1);
      refundAmount += price * qty;
      return {
        productId: reqItem.productId,
        productName: match?.product?.name || reqItem.productName || 'Prenda MoviFashion',
        quantity: qty,
        size: reqItem.size || match?.selectedSize || 'M',
        color: reqItem.color || (typeof match?.selectedColor === 'object' ? match?.selectedColor.name : String(match?.selectedColor || 'Estándar')),
        price,
      };
    });

    const newReturn: ReturnRequest = {
      id: `RET-2026-${String(returnRequests.length + 1).padStart(4, '0')}`,
      orderId: order.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tipo: tipo as any,
      items: returnItems,
      motivo: String(motivo).slice(0, 1000),
      estado: 'solicitado',
      reembolsoSimulado: refundAmount,
      reponerInventario: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    returnRequests.unshift(newReturn);

    // Push notification to back-office staff
    pushAdminNotification({
      titulo: 'Nueva Solicitud de Devolución',
      mensaje: `El cliente ${user.name} solicitó ${tipo} para el pedido ${order.id} por $${refundAmount.toLocaleString('es-CO')} COP.`,
      tipo: 'devolucion',
      link: '/admin',
    });

    if (supabase) {
      try {
        await supabase.from('app_returns').insert({
          id: newReturn.id,
          order_id: newReturn.orderId,
          user_id: newReturn.userId,
          user_name: newReturn.userName,
          user_email: newReturn.userEmail,
          tipo: newReturn.tipo,
          items: newReturn.items,
          motivo: newReturn.motivo,
          estado: newReturn.estado,
          reembolso_simulado: newReturn.reembolsoSimulado,
          reponer_inventario: newReturn.reponerInventario,
        });
      } catch (err: any) {
        console.warn('[SUPABASE] Returns insert note:', err.message);
      }
    }

    res.status(201).json({
      message: 'Solicitud de devolución radicada con éxito. Será revisada en un plazo máximo de 48 horas hábiles.',
      returnRequest: newReturn,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al procesar la solicitud de devolución.' });
  }
});

app.get('/api/returns/mine', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const myReturns = returnRequests.filter(
    r => r.userId === user.id || r.userEmail.toLowerCase() === user.email.toLowerCase()
  );
  res.json(myReturns);
});

// ---------------------------------------------------------------------
// 10. ENTERPRISE BACK-OFFICE ROUTER (RBAC, Audit, Concurrency, 18 Modules)
// ---------------------------------------------------------------------
app.use(
  '/api/admin',
  requireAuth,
  createAdminRouter(
    () => products,
    (p) => { products = p; },
    () => orders,
    (o) => { orders = o; },
    () => categories,
    (c) => { categories = c; },
    () => inMemoryUsers,
    (u) => { inMemoryUsers = u; },
    () => appEvents,
    supabase,
    verifyPassword,
    hashPassword
  )
);

// ---------------------------------------------------------------------
// SERVER LIFECYCLE (Vite Dev Server & Production Dist)
// ---------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const viteModuleId = 'vite';
    const { createServer: createViteServer } = await import(viteModuleId);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOVIFASHION AI server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

export default app;