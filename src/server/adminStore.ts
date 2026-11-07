// Back-Office Store, State Synchronization & RBAC Cache
// MoviFashion AI - In-memory store with Supabase PostgreSQL bidirectional sync

import { SupabaseClient } from '@supabase/supabase-js';
import {
  StaffRole,
  ProductVariant,
  InventoryMovement,
  PriceHistoryEntry,
  ReturnRequest,
  OrderStatusHistory,
  OrderNote,
  AdminNotification,
  AppAuditLog,
  ContentPage,
  ContentVersion,
  KnowledgeEntry,
  MonthlySalesGoal,
  ShippingConfig,
  StaffSession,
  LoginHistoryEntry,
  Product,
  Order,
  User,
} from '../types/index.ts';
import { SYSTEM_ROLES } from '../admin/rbac.ts';
import { BASE_CONOCIMIENTO as INITIAL_KNOWLEDGE_BASE } from '../data/conocimiento.ts';

// ---------------------------------------------------------------------
// IN-MEMORY BACK-OFFICE COLLECTIONS
// ---------------------------------------------------------------------

export let staffRoles: StaffRole[] = [...SYSTEM_ROLES];
export let productVariants: ProductVariant[] = [];
export let inventoryMovements: InventoryMovement[] = [];
export let priceHistory: PriceHistoryEntry[] = [];
export let returnRequests: ReturnRequest[] = [];
export let orderStatusHistory: OrderStatusHistory[] = [];
export let orderNotes: OrderNote[] = [];
export let adminNotifications: AdminNotification[] = [];
export let appAuditLogs: AppAuditLog[] = [];
export let contentPages: ContentPage[] = [];
export let contentVersions: ContentVersion[] = [];
export let knowledgeEntries: KnowledgeEntry[] = [];
export let staffSessions: StaffSession[] = [];
export let loginHistory: LoginHistoryEntry[] = [];
export let appSettings: Record<string, any> = {
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando mejoras en nuestra tienda. Volveremos en unos minutos.',
  paymentMode: 'simulado',
  freeShippingThreshold: 200000,
  topBannerText: 'Envío gratis a toda Colombia por compras superiores a $200.000 · IVA 19% incluido',
  adminRequire2FA: process.env.ADMIN_REQUIRE_2FA === 'true',
};

export let salesGoals: MonthlySalesGoal[] = [
  {
    month: new Date().toISOString().slice(0, 7), // e.g. '2026-11'
    targetSales: 150000000,
    updatedAt: new Date().toISOString(),
  },
];

export let shippingConfig: ShippingConfig = {
  freeShippingThreshold: 200000,
  standardRate: 12000,
  cities: [
    { city: 'Bogotá D.C.', department: 'Cundinamarca', rate: 10000, deliveryDays: '1-2 días hábiles' },
    { city: 'Medellín', department: 'Antioquia', rate: 12000, deliveryDays: '2-3 días hábiles' },
    { city: 'Cali', department: 'Valle del Cauca', rate: 12000, deliveryDays: '2-4 días hábiles' },
    { city: 'Barranquilla', department: 'Atlántico', rate: 14000, deliveryDays: '3-5 días hábiles' },
    { city: 'Bucaramanga', department: 'Santander', rate: 12000, deliveryDays: '2-4 días hábiles' },
    { city: 'Cartagena', department: 'Bolívar', rate: 14000, deliveryDays: '3-5 días hábiles' },
    { city: 'Pereira', department: 'Risaralda', rate: 12000, deliveryDays: '2-3 días hábiles' },
    { city: 'Cúcuta', department: 'Norte de Santander', rate: 14000, deliveryDays: '3-5 días hábiles' },
  ],
  carriers: ['Coordinadora Mercantil', 'Servientrega', 'Envía'],
};

// ---------------------------------------------------------------------
// RBAC PERMISSION CACHE (60s TTL, invalidated when roles change)
// ---------------------------------------------------------------------
interface RoleCacheEntry {
  roleId: string;
  permissions: string[];
  expiresAt: number;
}
const roleCache = new Map<string, RoleCacheEntry>();

export function getCachedPermissions(roleId: string): string[] {
  const now = Date.now();
  const cached = roleCache.get(roleId);
  if (cached && now < cached.expiresAt) {
    return cached.permissions;
  }

  const role = staffRoles.find(r => r.id === roleId);
  const permissions = role ? role.permisos : [];
  roleCache.set(roleId, {
    roleId,
    permissions,
    expiresAt: now + 60 * 1000, // 60 seconds
  });
  return permissions;
}

export function invalidateRoleCache(roleId?: string) {
  if (roleId) {
    roleCache.delete(roleId);
  } else {
    roleCache.clear();
  }
}

// ---------------------------------------------------------------------
// AUDIT LOG RECORDER WITH BEFORE / AFTER JSON DIFF
// ---------------------------------------------------------------------
export async function recordAppAudit(
  entry: {
    usuarioId?: string;
    usuarioNombre?: string;
    usuarioEmail?: string;
    rol?: string;
    accion: string;
    modulo: string;
    entidad?: string;
    entidadId?: string;
    antes?: Record<string, any> | null;
    despues?: Record<string, any> | null;
    ip: string;
    navegador?: string;
    estado?: 'EXITO' | 'DENEGADO' | 'ADVERTENCIA';
    motivo?: string;
  },
  supabase?: SupabaseClient | null
) {
  const log: AppAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    usuarioId: entry.usuarioId || 'sistema',
    usuarioNombre: entry.usuarioNombre || 'Sistema',
    usuarioEmail: entry.usuarioEmail,
    rol: entry.rol || 'sistema',
    accion: entry.accion,
    modulo: entry.modulo,
    entidad: entry.entidad,
    entidadId: entry.entidadId,
    antes: entry.antes || null,
    despues: entry.despues || null,
    ip: entry.ip || '127.0.0.1',
    navegador: entry.navegador,
    estado: entry.estado || 'EXITO',
    motivo: entry.motivo,
  };

  appAuditLogs.unshift(log);
  if (appAuditLogs.length > 2000) {
    appAuditLogs.pop();
  }

  if (supabase) {
    try {
      await supabase.from('app_audit_logs').insert({
        id: log.id,
        usuario_id: log.usuarioId,
        usuario_nombre: log.usuarioNombre,
        usuario_email: log.usuarioEmail,
        rol: log.rol,
        accion: log.accion,
        modulo: log.modulo,
        entidad: log.entidad,
        entidad_id: log.entidadId,
        antes: log.antes,
        despues: log.despues,
        ip: log.ip,
        navegador: log.navegador,
        estado: log.estado,
        motivo: log.motivo,
        event_type: entry.accion,
        severity: entry.estado === 'DENEGADO' ? 'alert' : 'info',
        description: `${entry.accion} en ${entry.modulo}: ${entry.entidad || ''} (${entry.entidadId || ''})`,
      });
    } catch (err: any) {
      console.warn('[AUDIT] Fallback in-memory error:', err.message);
    }
  }
}

// ---------------------------------------------------------------------
// NOTIFICATION DISPATCHER
// ---------------------------------------------------------------------
export async function pushAdminNotification(
  notif: {
    titulo: string;
    mensaje: string;
    tipo: 'pedido' | 'stock' | 'pqrs' | 'devolucion' | 'seguridad' | 'sistema';
    link?: string;
  },
  supabase?: SupabaseClient | null
) {
  const newNotif: AdminNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    titulo: notif.titulo,
    mensaje: notif.mensaje,
    tipo: notif.tipo,
    leido: false,
    link: notif.link,
    createdAt: new Date().toISOString(),
  };

  adminNotifications.unshift(newNotif);
  if (adminNotifications.length > 200) adminNotifications.pop();

  if (supabase) {
    try {
      await supabase.from('admin_notifications').insert({
        id: newNotif.id,
        titulo: newNotif.titulo,
        mensaje: newNotif.mensaje,
        tipo: newNotif.tipo,
        leido: false,
        link: newNotif.link,
      });
    } catch (err: any) {
      console.warn('[NOTIF] Supabase insert warning:', err.message);
    }
  }
}

// ---------------------------------------------------------------------
// SEEDING AND INITIALIZATION
// ---------------------------------------------------------------------
export function initializeAdminStore(products: Product[], orders: Order[]) {
  // 1. Initialize Product Variants and Movements if empty
  if (productVariants.length === 0) {
    products.forEach(p => {
      p.sizes.forEach(sz => {
        p.colors.forEach(col => {
          const colorSlug = col.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
          const sku = `${p.id.slice(0, 8).toUpperCase()}-${sz}-${colorSlug.slice(0, 3).toUpperCase()}`;
          const stockPerVariant = Math.max(2, Math.floor(p.inventory / (p.sizes.length * p.colors.length)));
          productVariants.push({
            id: `var-${sku}`,
            productId: p.id,
            sku,
            size: sz,
            color: col.name,
            stock: stockPerVariant,
            lowStockAlert: 5,
          });
        });
      });
    });
  }

  // 2. Initial Kardex Movements
  if (inventoryMovements.length === 0 && products.length > 0) {
    products.slice(0, 10).forEach(p => {
      inventoryMovements.push({
        id: `mov-init-${p.id}`,
        productId: p.id,
        productName: p.name,
        tipo: 'entrada',
        cantidad: p.inventory,
        stockAnterior: 0,
        stockNuevo: p.inventory,
        motivo: 'Inventario inicial de apertura de tienda',
        usuarioId: 'admin-seed-uuid-01',
        usuarioNombre: 'Administrador MOVIFASHION',
        createdAt: p.createdAt || new Date().toISOString(),
      });
    });
  }

  // 3. Initial Knowledge Entries
  if (knowledgeEntries.length === 0) {
    INITIAL_KNOWLEDGE_BASE.forEach((kb, idx) => {
      knowledgeEntries.push({
        id: `kb-${idx + 1}`,
        categoria: kb.categoria,
        titulo: kb.titulo,
        contenido: kb.contenido,
        palabrasClave: kb.palabrasClave,
        activo: true,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  // 4. Initial Content Pages
  if (contentPages.length === 0) {
    const defaultPages = [
      { slug: 'nosotros', titulo: 'Quiénes Somos', desc: 'Historia y propuesta de valor de MoviFashion Colombia' },
      { slug: 'mision-vision', titulo: 'Misión y Visión', desc: 'Propósito corporativo y horizonte empresarial' },
      { slug: 'terminos-y-condiciones', titulo: 'Términos y Condiciones', desc: 'Términos de servicio bajo la Ley 1480 de 2011' },
      { slug: 'politica-de-privacidad', titulo: 'Política de Privacidad', desc: 'Tratamiento de datos personales Ley 1581 de 2012' },
      { slug: 'politica-de-cookies', titulo: 'Política de Cookies', desc: 'Finalidad técnica y analítica de cookies' },
      { slug: 'envios', titulo: 'Política de Envíos', desc: 'Cobertura nacional, transportadoras y tiempos de entrega' },
      { slug: 'cambios-y-devoluciones', titulo: 'Cambios, Garantías y Retracto', desc: 'Plazos legales de cambio, 5 días de retracto y garantía' },
      { slug: 'guia-de-tallas', titulo: 'Guía de Tallas', desc: 'Tabla de medidas en centímetros para calzado y prendas' },
      { slug: 'preguntas-frecuentes', titulo: 'Preguntas Frecuentes', desc: 'Respuestas a inquietudes usuales de clientes' },
    ];

    defaultPages.forEach(dp => {
      contentPages.push({
        slug: dp.slug,
        titulo: dp.titulo,
        contenido: `Contenido oficial de ${dp.titulo} de MoviFashion Colombia.`,
        metaDescripcion: dp.desc,
        publicado: true,
        versionActual: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Administrador MOVIFASHION',
      });
      contentVersions.push({
        id: `ver-${dp.slug}-1`,
        pageSlug: dp.slug,
        version: 1,
        titulo: dp.titulo,
        contenido: `Contenido oficial de ${dp.titulo} de MoviFashion Colombia.`,
        createdAt: new Date().toISOString(),
        createdBy: 'Administrador MOVIFASHION',
      });
    });
  }

  // 5. Initial Notifications based on real events
  if (adminNotifications.length === 0) {
    const lowStockCount = products.filter(p => p.inventory < 10).length;
    if (lowStockCount > 0) {
      adminNotifications.push({
        id: 'notif-seed-stock',
        titulo: 'Alerta de Existencias Bajas',
        mensaje: `Hay ${lowStockCount} producto(s) con inventario por debajo del umbral mínimo de seguridad.`,
        tipo: 'stock',
        leido: false,
        link: '/admin',
        createdAt: new Date().toISOString(),
      });
    }

    if (orders.length > 0) {
      adminNotifications.push({
        id: 'notif-seed-order',
        titulo: 'Nuevo Pedido Confirmado',
        mensaje: `El pedido ${orders[0].id} por $${orders[0].total.toLocaleString('es-CO')} COP está pendiente de despacho.`,
        tipo: 'pedido',
        leido: false,
        link: '/admin',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 6. Pre-seed a sample return request for testing Devoluciones & Retractos
  if (returnRequests.length === 0 && orders.length > 0) {
    const orderForReturn = orders[0];
    returnRequests.push({
      id: 'RET-2026-0001',
      orderId: orderForReturn.id,
      userId: orderForReturn.userId,
      userName: orderForReturn.userName,
      userEmail: orderForReturn.userEmail,
      tipo: 'retracto',
      items: orderForReturn.items.slice(0, 1).map(i => ({
        productId: i.product?.id || i.id,
        productName: i.product?.name || 'Prenda MoviFashion',
        quantity: i.quantity || 1,
        size: i.selectedSize || 'M',
        color: typeof i.selectedColor === 'object' ? i.selectedColor.name : String(i.selectedColor || 'Negro'),
        price: i.product?.discountPrice || i.product?.price || 150000,
      })),
      motivo: 'Solicitud de derecho de retracto dentro de los 5 días hábiles legales (prenda intacta con etiquetas).',
      estado: 'solicitado',
      reembolsoSimulado: orderForReturn.items[0]?.product?.price || 150000,
      reponerInventario: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}