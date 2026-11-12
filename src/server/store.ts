// =====================================================================
// MoviFashion AI — Capa de Almacenamiento Compartido (Store)
// Prioridad:
// 1. Upstash Redis (KV_REST_API_URL/TOKEN o UPSTASH_REDIS_REST_URL/TOKEN)
// 2. Supabase PostgreSQL (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
// 3. Memoria (Fallback en desarrollo / demostración volátil)
// =====================================================================

import { Redis } from '@upstash/redis';
import { SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderStatus, ReturnRequest, SecurityAuditLog } from '../types/index.ts';
import { generateSimulatedDataset } from './datasetSimulado.ts';

export interface DBUser {
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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ip: string;
  created_at: string;
}

export interface PQRSItem {
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
  createdAt: string;
  updatedAt?: string;
  user_id?: string;
}

// ---------------------------------------------------------------------
// CONFIGURACIÓN DE CLIENTES
// ---------------------------------------------------------------------
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

let redisClient: Redis | null = null;
if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[STORE] Almacenamiento Upstash Redis inicializado correctamente.');
  } catch (err: any) {
    console.warn('[STORE WARN] Error al inicializar cliente Upstash Redis:', err.message);
    redisClient = null;
  }
}

let supabaseClient: SupabaseClient | null = null;
export function setSupabaseClient(client: SupabaseClient | null) {
  supabaseClient = client;
}

// ---------------------------------------------------------------------
// ALMACÉN EN MEMORIA (FALLBACK)
// ---------------------------------------------------------------------
let inMemoryOrders: Order[] = [];
let inMemoryUsers: DBUser[] = [];
let inMemoryPQRS: PQRSItem[] = [];
let inMemoryContacts: ContactMessage[] = [];
let inMemoryReturns: ReturnRequest[] = [];
let inMemoryAuditLogs: SecurityAuditLog[] = [];
let inMemoryNewsletter: Set<string> = new Set();

// ---------------------------------------------------------------------
// CACHÉ EN MEMORIA PARA REDIS (15 a 30 segundos)
// ---------------------------------------------------------------------
let cachedOrders: Order[] | null = null;
let lastOrdersCacheTime = 0;
const ORDERS_CACHE_TTL_MS = 20000; // 20 segundos

export function invalidateOrdersCache() {
  cachedOrders = null;
  lastOrdersCacheTime = 0;
}

// ---------------------------------------------------------------------
// TIPO DE ALMACENAMIENTO ACTIVO
// ---------------------------------------------------------------------
export type StorageType = 'redis' | 'supabase' | 'memoria';

export function getStorageType(): StorageType {
  if (redisClient) return 'redis';
  if (supabaseClient) return 'supabase';
  return 'memoria';
}

export function hasPersistentStorage(): boolean {
  return redisClient !== null || supabaseClient !== null;
}

export function isVolatile(): boolean {
  return !hasPersistentStorage();
}

// Función callback para devolver inventario si un pedido se cancela
let restoreInventoryCallback: ((items: any[]) => void) | null = null;
export function setInventoryRestorer(cb: (items: any[]) => void) {
  restoreInventoryCallback = cb;
}

// ---------------------------------------------------------------------
// MÉTODOS DE PEDIDOS (ORDERS)
// ---------------------------------------------------------------------

/** Guarda un nuevo pedido completo */
export async function saveOrder(order: Order): Promise<boolean> {
  invalidateOrdersCache();

  // 1. Upstash Redis
  if (redisClient) {
    try {
      const orderKey = `order:${order.id}`;
      await redisClient.set(orderKey, JSON.stringify(order));
      await redisClient.lpush('orders', order.id);
      await redisClient.ltrim('orders', 0, 1999);

      if (order.userId) {
        await redisClient.lpush(`orders:user:${order.userId}`, order.id);
        await redisClient.ltrim(`orders:user:${order.userId}`, 0, 1999);
      }

      // También mantener en memoria local
      inMemoryOrders.unshift(order);
      return true;
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] Error al guardar pedido en Redis:', err.message);
      return false;
    }
  }

  // 2. Supabase
  if (supabaseClient) {
    try {
      const orderRecord = {
        id: order.id,
        user_id: order.userId && order.userId.includes('-') && order.userId.length > 20 ? order.userId : null,
        user_name: order.userName,
        user_email: order.userEmail,
        items: order.items,
        subtotal: order.subtotal,
        subtotal_base: order.subtotalBase || Math.round(order.subtotal / 1.19),
        iva: order.iva || Math.round(order.subtotal - order.subtotal / 1.19),
        tarifa_iva: 0.19,
        shipping: order.shipping,
        discount: order.discount,
        coupon_code: order.couponCode || null,
        total: order.total,
        status: order.status,
        shipping_address: order.shippingAddress,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        tracking_number: order.trackingNumber,
        simulated: false,
        created_at: order.createdAt,
      };

      const { error } = await supabaseClient.from('app_orders').insert(orderRecord);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] Error al guardar pedido en app_orders [${error.code}]:`, error.message);
        return false;
      }
      inMemoryOrders.unshift(order);
      return true;
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] Error al insertar pedido:', err.message);
      return false;
    }
  }

  // 3. Memoria
  inMemoryOrders.unshift(order);
  return true;
}

/** Obtiene un pedido por ID */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (redisClient) {
    try {
      const data = await redisClient.get(`order:${orderId}`);
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : (data as Order);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getOrderById:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('app_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getOrderById [${error.code}]:`, error.message);
      } else if (data) {
        return mapSupabaseOrder(data);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getOrderById:', err.message);
    }
  }

  return inMemoryOrders.find(o => o.id === orderId) || null;
}

/** Obtiene los pedidos de un cliente específico */
export async function getOrdersByUser(userId: string, userEmail?: string): Promise<Order[]> {
  if (redisClient) {
    try {
      const orderIds = await redisClient.lrange(`orders:user:${userId}`, 0, 999);
      if (!orderIds || orderIds.length === 0) {
        // Fallback: buscar en memoria
        return inMemoryOrders.filter(o => o.userId === userId || (userEmail && o.userEmail === userEmail.toLowerCase()));
      }

      // Lectura por lotes con mget para no gastar cuota de peticiones
      const keys = orderIds.map(id => `order:${id}`);
      const rawOrders = await redisClient.mget<any[]>(...keys);
      const orders: Order[] = [];
      for (const raw of rawOrders) {
        if (!raw) continue;
        const parsed: Order = typeof raw === 'string' ? JSON.parse(raw) : raw;
        orders.push(parsed);
      }
      return orders;
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getOrdersByUser:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      let query = supabaseClient.from('app_orders').select('*').order('created_at', { ascending: false });
      if (userId && userId.includes('-') && userId.length > 20) {
        query = query.or(`user_id.eq.${userId},user_email.eq.${userEmail || ''}`);
      } else if (userEmail) {
        query = query.eq('user_email', userEmail.toLowerCase());
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getOrdersByUser [${error.code}]:`, error.message);
      } else if (data) {
        return data.map(mapSupabaseOrder);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getOrdersByUser:', err.message);
    }
  }

  return inMemoryOrders.filter(
    o => o.userId === userId || (userEmail && o.userEmail === userEmail.toLowerCase())
  );
}

/** Obtiene todos los pedidos reales guardados en Redis, Supabase o memoria (con caché de 20s) */
export async function getRealOrders(): Promise<Order[]> {
  const now = Date.now();
  if (cachedOrders && now - lastOrdersCacheTime < ORDERS_CACHE_TTL_MS) {
    return cachedOrders;
  }

  let resultOrders: Order[] = [];

  if (redisClient) {
    try {
      const orderIds = await redisClient.lrange('orders', 0, 1999);
      if (orderIds && orderIds.length > 0) {
        // Batch read con chunks de 50 para optimizar cuota Upstash
        const CHUNK_SIZE = 50;
        for (let i = 0; i < orderIds.length; i += CHUNK_SIZE) {
          const chunkIds = orderIds.slice(i, i + CHUNK_SIZE);
          const keys = chunkIds.map(id => `order:${id}`);
          const chunkOrders = await redisClient.mget<any[]>(...keys);
          for (const raw of chunkOrders) {
            if (!raw) continue;
            const parsed: Order = typeof raw === 'string' ? JSON.parse(raw) : raw;
            resultOrders.push(parsed);
          }
        }
      }
      if (resultOrders.length > 0) {
        cachedOrders = resultOrders;
        lastOrdersCacheTime = now;
        return resultOrders;
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getRealOrders:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('app_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getRealOrders [${error.code}]:`, error.message);
      } else if (data) {
        resultOrders = data.map(mapSupabaseOrder);
        cachedOrders = resultOrders;
        lastOrdersCacheTime = now;
        return resultOrders;
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getRealOrders:', err.message);
    }
  }

  resultOrders = [...inMemoryOrders];
  cachedOrders = resultOrders;
  lastOrdersCacheTime = now;
  return resultOrders;
}

/** Obtiene todos los pedidos para el panel unificado (reales + dataset determinista simulado) */
export async function getAllOrders(): Promise<Order[]> {
  const realOrders = await getRealOrders();
  const dataset = generateSimulatedDataset();
  const simulatedOrders = dataset.pedidos;

  const map = new Map<string, Order>();
  // 1. Cargar simulados
  for (const sim of simulatedOrders) {
    map.set(sim.id, sim);
  }
  // 2. Sobrescribir/anteponer reales
  for (const real of realOrders) {
    map.set(real.id, { ...real, simulated: false });
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Actualiza el estado de un pedido y devuelve inventario si se cancela */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  invalidateOrdersCache();

  const currentOrder = await getOrderById(orderId);
  const previousStatus = currentOrder?.status;

  if (redisClient) {
    try {
      if (currentOrder) {
        currentOrder.status = status;
        await redisClient.set(`order:${orderId}`, JSON.stringify(currentOrder));
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] updateOrderStatus:', err.message);
      return false;
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('app_orders')
        .update({ status })
        .eq('id', orderId);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] updateOrderStatus [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] updateOrderStatus:', err.message);
    }
  }

  // Actualizar en memoria
  const mem = inMemoryOrders.find(o => o.id === orderId);
  if (mem) {
    mem.status = status;
  }

  // Devolver inventario si se cancela
  if (status === 'Cancelado' && previousStatus !== 'Cancelado' && currentOrder && restoreInventoryCallback) {
    try {
      restoreInventoryCallback(currentOrder.items);
      console.log(`[STORE INVENTARIO] Inventario restituido por cancelación de pedido ${orderId}`);
    } catch (err: any) {
      console.warn('[STORE INVENTARIO] Error restituyendo inventario:', err.message);
    }
  }

  return true;
}

// ---------------------------------------------------------------------
// MÉTODOS DE USUARIOS (ACCOUNTS)
// ---------------------------------------------------------------------

/** Guarda o actualiza un usuario en la capa de persistencia */
export async function saveUser(user: DBUser): Promise<boolean> {
  const cleanEmail = user.email.toLowerCase().trim();

  if (redisClient) {
    try {
      await redisClient.set(`users:${cleanEmail}`, JSON.stringify(user));
      await redisClient.sadd('users:index', cleanEmail);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveUser:', err.message);
      return false;
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('app_users').upsert({
        id: user.id,
        name: user.name,
        email: cleanEmail,
        password_hash: user.password_hash,
        role: user.role,
        role_id: user.roleId || user.role,
        estado: user.estado || 'activo',
        must_change_password: user.mustChangePassword || false,
        mfa_enabled: user.mfaEnabled || false,
        mfa_secret: user.mfa_secret || null,
        created_at: user.created_at || user.createdAt || new Date().toISOString(),
      });
      if (error) {
        console.error(`[STORE SUPABASE ERROR] saveUser [${error.code}]:`, error.message);
        return false;
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] saveUser:', err.message);
      return false;
    }
  }

  // Mantener en memoria
  const existingIdx = inMemoryUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    inMemoryUsers[existingIdx] = user;
  } else {
    inMemoryUsers.push(user);
  }

  return true;
}

/** Obtiene un usuario por correo electrónico */
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const cleanEmail = email.toLowerCase().trim();

  if (redisClient) {
    try {
      const data = await redisClient.get(`users:${cleanEmail}`);
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : (data as DBUser);
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getUserByEmail:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('app_users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getUserByEmail [${error.code}]:`, error.message);
      } else if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          role: data.role,
          roleId: data.role_id || data.role,
          estado: data.estado || 'activo',
          mustChangePassword: data.must_change_password || false,
          mfaEnabled: data.mfa_enabled || false,
          mfa_secret: data.mfa_secret || null,
          created_at: data.created_at,
          createdAt: data.created_at,
        };
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getUserByEmail:', err.message);
    }
  }

  return inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

/** Elimina un usuario */
export async function deleteUser(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();

  if (redisClient) {
    try {
      await redisClient.del(`users:${cleanEmail}`);
      await redisClient.srem('users:index', cleanEmail);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] deleteUser:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('app_users').delete().eq('email', cleanEmail);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] deleteUser [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] deleteUser:', err.message);
    }
  }

  inMemoryUsers = inMemoryUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
  return true;
}

/** Obtiene todos los usuarios del sistema */
export async function getAllUsers(): Promise<DBUser[]> {
  if (redisClient) {
    try {
      const emails = await redisClient.smembers('users:index');
      if (emails && emails.length > 0) {
        const keys = emails.map(e => `users:${e}`);
        const rawUsers = await redisClient.mget<any[]>(...keys);
        const users: DBUser[] = [];
        for (const raw of rawUsers) {
          if (!raw) continue;
          const u: DBUser = typeof raw === 'string' ? JSON.parse(raw) : raw;
          users.push(u);
        }
        if (users.length > 0) return users;
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getAllUsers:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('app_users').select('*');
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getAllUsers [${error.code}]:`, error.message);
      } else if (data) {
        return data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password_hash: u.password_hash,
          role: u.role,
          roleId: u.role_id || u.role,
          estado: u.estado || 'activo',
          mustChangePassword: u.must_change_password || false,
          mfaEnabled: u.mfa_enabled || false,
          mfa_secret: u.mfa_secret || null,
          created_at: u.created_at,
          createdAt: u.created_at,
        }));
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getAllUsers:', err.message);
    }
  }

  return [...inMemoryUsers];
}

// ---------------------------------------------------------------------
// PQRS, CONTACTO, DEVOLUCIONES, AUDITORÍA Y BOLETÍN
// ---------------------------------------------------------------------

/** Guarda un radicado de PQRS */
export async function savePQRS(pqrs: PQRSItem): Promise<boolean> {
  if (redisClient) {
    try {
      await redisClient.lpush('pqrs', JSON.stringify(pqrs));
      await redisClient.ltrim('pqrs', 0, 999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] savePQRS:', err.message);
    }
  }
  inMemoryPQRS.unshift(pqrs);
  return true;
}

/** Obtiene la lista de PQRS */
export async function getPQRSList(): Promise<PQRSItem[]> {
  if (redisClient) {
    try {
      const raw = await redisClient.lrange('pqrs', 0, 999);
      if (raw && raw.length > 0) {
        return raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getPQRSList:', err.message);
    }
  }
  return [...inMemoryPQRS];
}

/** Obtiene una PQRS por radicado */
export async function getPQRSByRadicado(radicado: string): Promise<PQRSItem | null> {
  const all = await getPQRSList();
  return all.find(p => p.radicado.toLowerCase() === radicado.toLowerCase()) || null;
}

/** Actualiza el estado o respuesta de una PQRS */
export async function updatePQRS(radicado: string, patch: Partial<PQRSItem>): Promise<boolean> {
  const all = await getPQRSList();
  const target = all.find(p => p.radicado.toLowerCase() === radicado.toLowerCase());
  if (!target) return false;

  Object.assign(target, patch, { updatedAt: new Date().toISOString() });

  if (redisClient) {
    try {
      // Reescribir lista acotada
      await redisClient.del('pqrs');
      for (let i = all.length - 1; i >= 0; i--) {
        await redisClient.lpush('pqrs', JSON.stringify(all[i]));
      }
      await redisClient.ltrim('pqrs', 0, 999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] updatePQRS:', err.message);
    }
  }
  return true;
}

/** Mensajes de contacto */
export async function saveContactMessage(msg: ContactMessage): Promise<boolean> {
  if (redisClient) {
    try {
      await redisClient.lpush('contacts', JSON.stringify(msg));
      await redisClient.ltrim('contacts', 0, 999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveContactMessage:', err.message);
    }
  }
  inMemoryContacts.unshift(msg);
  return true;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (redisClient) {
    try {
      const raw = await redisClient.lrange('contacts', 0, 999);
      if (raw && raw.length > 0) {
        return raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getContactMessages:', err.message);
    }
  }
  return [...inMemoryContacts];
}

/** Devoluciones y Retractos (tabla 'returns' en Supabase como exige Parte 4.1) */
export async function saveReturnRequest(ret: ReturnRequest): Promise<boolean> {
  if (redisClient) {
    try {
      await redisClient.lpush('returns', JSON.stringify(ret));
      await redisClient.ltrim('returns', 0, 999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveReturnRequest:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('returns').insert({
        id: ret.id,
        order_id: ret.orderId,
        user_id: ret.userId || null,
        user_name: ret.userName,
        user_email: ret.userEmail,
        tipo: ret.tipo,
        items: ret.items,
        motivo: ret.motivo,
        estado: ret.estado,
        resolucion: ret.resolucion || null,
        reembolso_simulado: ret.reembolsoSimulado || null,
        reponer_inventario: ret.reponerInventario || false,
        created_at: ret.createdAt,
      });
      if (error) {
        console.error(`[STORE SUPABASE ERROR] saveReturnRequest en returns [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] saveReturnRequest:', err.message);
    }
  }

  inMemoryReturns.unshift(ret);
  return true;
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  if (redisClient) {
    try {
      const raw = await redisClient.lrange('returns', 0, 999);
      if (raw && raw.length > 0) {
        return raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getReturnRequests:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('returns').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getReturnRequests en returns [${error.code}]:`, error.message);
      } else if (data) {
        return data.map(d => ({
          id: d.id,
          orderId: d.order_id,
          userId: d.user_id,
          userName: d.user_name,
          userEmail: d.user_email,
          tipo: d.tipo,
          items: d.items,
          motivo: d.motivo,
          estado: d.estado,
          resolucion: d.resolucion,
          reembolsoSimulado: d.reembolso_simulado,
          reponerInventario: d.reponer_inventario,
          createdAt: d.created_at,
          updatedAt: d.updated_at || d.created_at,
        }));
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getReturnRequests:', err.message);
    }
  }

  return [...inMemoryReturns];
}

/** Bitácora de Seguridad (últimos 5.000 eventos) */
export async function saveAuditLog(log: SecurityAuditLog): Promise<boolean> {
  if (redisClient) {
    try {
      await redisClient.lpush('audit_logs', JSON.stringify(log));
      await redisClient.ltrim('audit_logs', 0, 4999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveAuditLog:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('app_audit_logs').insert({
        id: log.id,
        event_type: log.eventType,
        severity: log.severity,
        description: log.description,
        ip: log.ip,
        user_role: log.userRole,
        status: log.status,
        created_at: log.timestamp,
      });
      if (error) {
        console.error(`[STORE SUPABASE ERROR] saveAuditLog [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] saveAuditLog:', err.message);
    }
  }

  inMemoryAuditLogs.unshift(log);
  if (inMemoryAuditLogs.length > 5000) inMemoryAuditLogs.pop();
  return true;
}

export async function getAuditLogs(): Promise<SecurityAuditLog[]> {
  if (redisClient) {
    try {
      const raw = await redisClient.lrange('audit_logs', 0, 4999);
      if (raw && raw.length > 0) {
        return raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getAuditLogs:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('app_audit_logs').select('*').order('created_at', { ascending: false }).limit(5000);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getAuditLogs [${error.code}]:`, error.message);
      } else if (data) {
        return data.map(d => ({
          id: d.id,
          timestamp: d.created_at,
          eventType: d.event_type,
          severity: d.severity,
          description: d.description,
          ip: d.ip,
          userRole: d.user_role,
          status: d.status,
        }));
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getAuditLogs:', err.message);
    }
  }

  return [...inMemoryAuditLogs];
}

/** Suscriptores de Boletín */
export async function saveNewsletterSubscriber(email: string): Promise<boolean> {
  const clean = email.toLowerCase().trim();
  if (redisClient) {
    try {
      await redisClient.sadd('newsletter', clean);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveNewsletterSubscriber:', err.message);
    }
  }
  inMemoryNewsletter.add(clean);
  return true;
}

export async function getNewsletterSubscribers(): Promise<string[]> {
  if (redisClient) {
    try {
      const members = await redisClient.smembers('newsletter');
      if (members && members.length > 0) return members;
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getNewsletterSubscribers:', err.message);
    }
  }
  return Array.from(inMemoryNewsletter);
}

// ---------------------------------------------------------------------
// HELPERS DE MAPEO
// ---------------------------------------------------------------------
function mapSupabaseOrder(d: any): Order {
  return {
    id: d.id,
    userId: d.user_id || '',
    userName: d.user_name || '',
    userEmail: d.user_email || '',
    items: d.items || [],
    subtotal: Number(d.subtotal) || 0,
    subtotalBase: Number(d.subtotal_base) || 0,
    iva: Number(d.iva) || 0,
    tarifaIva: Number(d.tarifa_iva) || 0.19,
    shipping: Number(d.shipping) || 0,
    discount: Number(d.discount) || 0,
    couponCode: d.coupon_code,
    total: Number(d.total) || 0,
    status: d.status || 'Pagado',
    shippingAddress: d.shipping_address,
    paymentMethod: d.payment_method || 'bank_transfer',
    paymentStatus: d.payment_status || 'paid',
    bankTransfer: d.shipping_address?.bankTransfer || undefined,
    trackingNumber: d.tracking_number || '',
    simulated: false,
    createdAt: d.created_at,
    customer: {
      name: d.user_name || '',
      email: d.user_email || '',
      phone: d.shipping_address?.phone || '',
      documentId: d.shipping_address?.documentId || '',
      address: d.shipping_address?.street || d.shipping_address?.address || '',
      city: d.shipping_address?.city || '',
    },
  };
}

// ---------------------------------------------------------------------
// RULETA BTL ("Gira y estrena") — FUNCIONES ADITIVAS
// ---------------------------------------------------------------------
export interface RuletaParticipacion {
  nombre: string;
  correo: string;
  premioId: string;
  codigo: string | null;
  consentimiento: boolean;
  fecha: string;
  expira: string;
  canjeado: boolean;
}

const inMemoryRuleta = new Map<string, RuletaParticipacion>();
const RULETA_REDIS_TTL_SEC = 8 * 24 * 60 * 60;

export async function saveRuletaParticipacion(participacion: RuletaParticipacion): Promise<boolean> {
  const cleanEmail = participacion.correo.toLowerCase().trim();
  const record: RuletaParticipacion = {
    ...participacion,
    correo: cleanEmail,
  };

  inMemoryRuleta.set(cleanEmail, record);

  if (redisClient) {
    try {
      await redisClient.set(`ruleta:${cleanEmail}`, JSON.stringify(record), {
        ex: RULETA_REDIS_TTL_SEC,
      });
      await redisClient.lpush('ruleta:lista', JSON.stringify(record));
      await redisClient.ltrim('ruleta:lista', 0, 4999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] saveRuletaParticipacion:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('ruleta_participaciones').upsert(
        {
          correo: cleanEmail,
          nombre: record.nombre,
          premio_id: record.premioId,
          codigo: record.codigo,
          consentimiento: record.consentimiento,
          fecha: record.fecha,
          expira: record.expira,
          canjeado: record.canjeado,
        },
        { onConflict: 'correo' }
      );
      if (error) {
        console.error(`[STORE SUPABASE ERROR] saveRuletaParticipacion [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] saveRuletaParticipacion:', err.message);
    }
  }

  return true;
}

export async function getRuletaParticipacionByEmail(correo: string): Promise<RuletaParticipacion | null> {
  const cleanEmail = correo.toLowerCase().trim();

  if (redisClient) {
    try {
      const raw = await redisClient.get(`ruleta:${cleanEmail}`);
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : (raw as RuletaParticipacion);
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getRuletaParticipacionByEmail:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('ruleta_participaciones')
        .select('*')
        .eq('correo', cleanEmail)
        .maybeSingle();
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getRuletaParticipacionByEmail [${error.code}]:`, error.message);
      } else if (data) {
        return {
          nombre: data.nombre,
          correo: data.correo,
          premioId: data.premio_id,
          codigo: data.codigo ?? null,
          consentimiento: Boolean(data.consentimiento),
          fecha: data.fecha,
          expira: data.expira,
          canjeado: Boolean(data.canjeado),
        };
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getRuletaParticipacionByEmail:', err.message);
    }
  }

  return inMemoryRuleta.get(cleanEmail) || null;
}

export async function getRuletaParticipaciones(): Promise<RuletaParticipacion[]> {
  if (redisClient) {
    try {
      const raw = await redisClient.lrange('ruleta:lista', 0, 4999);
      if (raw && raw.length > 0) {
        const byEmail = new Map<string, RuletaParticipacion>();
        for (const item of raw) {
          const parsed: RuletaParticipacion = typeof item === 'string' ? JSON.parse(item) : item;
          if (parsed?.correo && !byEmail.has(parsed.correo)) {
            byEmail.set(parsed.correo, parsed);
          }
        }
        return Array.from(byEmail.values());
      }
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] getRuletaParticipaciones:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('ruleta_participaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(5000);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] getRuletaParticipaciones [${error.code}]:`, error.message);
      } else if (data) {
        return data.map((d) => ({
          nombre: d.nombre,
          correo: d.correo,
          premioId: d.premio_id,
          codigo: d.codigo ?? null,
          consentimiento: Boolean(d.consentimiento),
          fecha: d.fecha,
          expira: d.expira,
          canjeado: Boolean(d.canjeado),
        }));
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] getRuletaParticipaciones:', err.message);
    }
  }

  return Array.from(inMemoryRuleta.values()).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

export async function markRuletaCanjeadaByEmail(correo: string, couponCode?: string): Promise<boolean> {
  const cleanEmail = correo.toLowerCase().trim();
  const existing = await getRuletaParticipacionByEmail(cleanEmail);
  if (!existing) return false;

  if (couponCode && existing.codigo && existing.codigo.toUpperCase() !== couponCode.toUpperCase()) {
    return false;
  }

  const updated: RuletaParticipacion = {
    ...existing,
    canjeado: true,
  };

  inMemoryRuleta.set(cleanEmail, updated);

  if (redisClient) {
    try {
      await redisClient.set(`ruleta:${cleanEmail}`, JSON.stringify(updated), {
        ex: RULETA_REDIS_TTL_SEC,
      });
      await redisClient.lpush('ruleta:lista', JSON.stringify(updated));
      await redisClient.ltrim('ruleta:lista', 0, 4999);
    } catch (err: any) {
      console.error('[STORE REDIS ERROR] markRuletaCanjeadaByEmail:', err.message);
    }
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('ruleta_participaciones')
        .update({ canjeado: true })
        .eq('correo', cleanEmail);
      if (error) {
        console.error(`[STORE SUPABASE ERROR] markRuletaCanjeadaByEmail [${error.code}]:`, error.message);
      }
    } catch (err: any) {
      console.error('[STORE SUPABASE EXCEPTION] markRuletaCanjeadaByEmail:', err.message);
    }
  }

  return true;
}

