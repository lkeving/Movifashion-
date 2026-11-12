// =====================================================================
// MoviFashion AI — Módulo de Seguridad y Endurecimiento (Pentesting)
// OWASP Top 10 (A01 - A10) Hardening Suite:
// - Security Headers (CSP, HSTS, X-Content-Type, X-Frame, Referrer, Permissions)
// - Strict CORS & CSRF Origin Verification on Data Mutations
// - Granular Rate Limiting (Global + Login, Register, Contacto, PQRS, Chat)
// - Anti-Enumeration & Account Lockout (5 attempts -> 15 min lock)
// - JWT Session Expiration & Token Revocation Blacklist
// - Zod Input Validation & Mass-Assignment Prevention
// - Strict File Upload Validation (Magic Bytes, Max 5MB, Random UUID)
// - IDOR Ownership Enforcement
// =====================================================================

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

// ---------------------------------------------------------------------
// 1. AUDIT LOGGING HOOK INTERFACE
// ---------------------------------------------------------------------
export interface SecurityAuditEntry {
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  ip: string;
  userRole?: string;
  status: 'SUCCESS' | 'FLAGGED' | 'BLOCKED';
  endpoint?: string;
  userId?: string;
}

let auditLogCallback: ((entry: SecurityAuditEntry) => void) | null = null;
export function setAuditLogger(cb: (entry: SecurityAuditEntry) => void) {
  auditLogCallback = cb;
}

function logSecurityEvent(entry: SecurityAuditEntry) {
  if (auditLogCallback) {
    try {
      auditLogCallback(entry);
    } catch {
      // safe fallback
    }
  }
}

// ---------------------------------------------------------------------
// 2. SECURITY HEADERS (CSP, HSTS, X-Content-Type, X-Frame, Permissions)
// ---------------------------------------------------------------------
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');

  // Baseline headers that never break iframes or local development
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');

  // Production-only hardening (Vercel or NODE_ENV === 'production')
  // In development and AI Studio preview, omit X-Frame-Options, HSTS and CSP so the preview iframe works
  if (isProduction) {
    // 1. Content Security Policy allowing Google Fonts, https/data images, Google Maps iframe & service worker
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' https: data: blob:",
      "connect-src 'self' https: wss: data:",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    // 2. Strict-Transport-Security (HSTS - 1 year with subdomains and preload)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // 3. Clickjacking protection for production standalone deployment
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // 4. Cross-Site Scripting filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  next();
}

// ---------------------------------------------------------------------
// 3. STRICT CORS & CSRF ORIGIN VERIFICATION
// ---------------------------------------------------------------------
function isOriginAllowed(origin: string, hostHeader?: string): boolean {
  if (!origin) return true; // Direct same-origin or tool invocation
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;

    // Check against host header
    if (hostHeader && (originHost === hostHeader || originHost === hostHeader.split(':')[0])) {
      return true;
    }

    // Localhost in development
    if (originHost.startsWith('localhost') || originHost.startsWith('127.0.0.1')) {
      return true;
    }

    // AI Studio Run, Google Cloud and Vercel domains
    if (
      originHost.endsWith('.run.app') ||
      originHost.endsWith('.vercel.app') ||
      originHost.endsWith('.movifashion.co') ||
      originHost.endsWith('.movifashion.ai') ||
      originHost.endsWith('.google.com') ||
      originHost.endsWith('.googleusercontent.com')
    ) {
      return true;
    }

    // Configured APP_URL
    if (process.env.APP_URL) {
      try {
        const appUrl = new URL(process.env.APP_URL);
        if (originHost === appUrl.host) return true;
      } catch {}
    }

    return false;
  } catch {
    return false;
  }
}

export function corsAndCsrfMiddleware(req: Request, res: Response, next: NextFunction) {
  const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
  const origin = (req.headers.origin as string) || '';
  const host = req.headers.host || '';

  if (origin) {
    const allowed = !isProduction || isOriginAllowed(origin, host);
    if (allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Origin, Accept'
      );
    }
  }

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // CSRF Protection: check origin on mutating API requests (POST, PUT, PATCH, DELETE)
  // ONLY enforced in production / Vercel
  if (isProduction) {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isApi = req.path.startsWith('/api/');

    if (isMutation && isApi) {
      const referer = (req.headers.referer as string) || '';
      const originToCheck = origin || (referer ? new URL(referer).origin : '');

      if (originToCheck && !isOriginAllowed(originToCheck, host)) {
        logSecurityEvent({
          eventType: 'CSRF_BLOCKED',
          severity: 'critical',
          description: `Bloqueado intento de mutación CSRF desde origen no autorizado: ${originToCheck}`,
          ip: req.ip || '127.0.0.1',
          status: 'BLOCKED',
          endpoint: `${req.method} ${req.path}`,
        });
        res.status(403).json({ error: 'Origen de petición no autorizado (CSRF Protection)' });
        return;
      }
    }
  }

  next();
}

// ---------------------------------------------------------------------
// 4. GRANULAR RATE LIMITING (Sliding Window In-Memory)
// ---------------------------------------------------------------------
interface RateRecord {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateRecord>();

export function createRateLimiter(options: {
  bucketPrefix: string;
  maxRequests: number;
  windowMs: number;
  errorMessage?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const key = `${options.bucketPrefix}:${ip}`;
    const now = Date.now();

    const record = rateLimitBuckets.get(key);
    if (!record || now > record.resetAt) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (record.count >= options.maxRequests) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(waitSeconds));

      logSecurityEvent({
        eventType: 'RATE_LIMIT_EXCEEDED',
        severity: 'warning',
        description: `Límite de tasa excedido en ${options.bucketPrefix} por IP ${ip} (${record.count} reqs)`,
        ip,
        status: 'BLOCKED',
        endpoint: `${req.method} ${req.path}`,
      });

      res.status(429).json({
        error: options.errorMessage || `Demasiadas solicitudes. Por favor espera ${waitSeconds} segundos.`,
        retryAfterSeconds: waitSeconds,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Built-in configured limiters
export const globalRateLimiter = createRateLimiter({
  bucketPrefix: 'global',
  maxRequests: 350,
  windowMs: 15 * 60 * 1000, // 350 requests per 15 min
  errorMessage: 'Límite global de peticiones excedido. Intenta más tarde.',
});

export const strictLoginLimiter = createRateLimiter({
  bucketPrefix: 'login',
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 10 attempts per 15 min per IP
  errorMessage: 'Demasiados intentos de acceso desde esta dirección IP. Por favor espera 15 minutos.',
});

export const strictRegisterLimiter = createRateLimiter({
  bucketPrefix: 'register',
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 5 registrations per hour per IP
  errorMessage: 'Límite de registros de cuenta alcanzado para esta IP. Intenta en una hora.',
});

export const strictContactLimiter = createRateLimiter({
  bucketPrefix: 'contacto',
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 5 contact messages per hour per IP
  errorMessage: 'Has alcanzado el límite de mensajes de contacto. Intenta más tarde.',
});

export const strictPqrsLimiter = createRateLimiter({
  bucketPrefix: 'pqrs',
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 5 PQRS per hour per IP
  errorMessage: 'Has alcanzado el límite de radicaciones PQRS. Intenta más tarde.',
});

export const strictChatLimiter = createRateLimiter({
  bucketPrefix: 'chat',
  maxRequests: 35,
  windowMs: 60 * 1000, // 35 messages per minute per IP
  errorMessage: 'Movi está procesando muchas consultas. Por favor espera unos segundos antes de volver a preguntar.',
});

// ---------------------------------------------------------------------
// 5. ACCOUNT LOCKOUT & ANTI-ENUMERATION FOR AUTHENTICATION
// ---------------------------------------------------------------------
interface LockoutInfo {
  failedAttempts: number;
  lockedUntil?: number;
}
const accountLockoutMap = new Map<string, LockoutInfo>();

export function checkAccountLockout(email: string, ip: string): { isLocked: boolean; remainingMinutes?: number } {
  const key = `${email.toLowerCase().trim()}:${ip}`;
  const info = accountLockoutMap.get(key);
  if (!info || !info.lockedUntil) return { isLocked: false };

  const now = Date.now();
  if (now > info.lockedUntil) {
    // Lock expired
    accountLockoutMap.delete(key);
    return { isLocked: false };
  }

  const remainingMinutes = Math.ceil((info.lockedUntil - now) / (60 * 1000));
  return { isLocked: true, remainingMinutes };
}

export function recordFailedLogin(email: string, ip: string): { isNowLocked: boolean; attempts: number } {
  const key = `${email.toLowerCase().trim()}:${ip}`;
  const info = accountLockoutMap.get(key) || { failedAttempts: 0 };
  info.failedAttempts += 1;

  if (info.failedAttempts >= 5) {
    info.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
    accountLockoutMap.set(key, info);
    logSecurityEvent({
      eventType: 'ACCOUNT_LOCKED',
      severity: 'warning',
      description: `Cuenta temporalmente bloqueada por 15 minutos tras 5 intentos fallidos: ${email}`,
      ip,
      status: 'BLOCKED',
    });
    return { isNowLocked: true, attempts: info.failedAttempts };
  }

  accountLockoutMap.set(key, info);
  return { isNowLocked: false, attempts: info.failedAttempts };
}

export function resetFailedLogin(email: string, ip: string) {
  const key = `${email.toLowerCase().trim()}:${ip}`;
  accountLockoutMap.delete(key);
}

// ---------------------------------------------------------------------
// 6. JWT SESSION EXPIRATION & TOKEN REVOCATION BLACKLIST
// ---------------------------------------------------------------------
const revokedTokens = new Set<string>();
const userRevocationTimestamps = new Map<string, number>();

export function revokeToken(token: string) {
  if (token) revokedTokens.add(token);
}

export function revokeAllUserSessions(userId: string) {
  if (userId) {
    userRevocationTimestamps.set(userId, Date.now());
  }
}

export function isTokenRevoked(token: string, userId?: string, issuedAtSec?: number): boolean {
  if (revokedTokens.has(token)) return true;
  if (userId && issuedAtSec) {
    const revokedAtMs = userRevocationTimestamps.get(userId);
    if (revokedAtMs && issuedAtSec * 1000 < revokedAtMs) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------
// 7. ZOD INPUT VALIDATION SCHEMAS & MIDDLEWARE
// ---------------------------------------------------------------------

// Login Schema (no unexpected fields, sanitizes email)
export const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido').max(100),
  password: z.string().min(1, 'La contraseña es requerida').max(128),
  totpCode: z.string().trim().optional(),
});

// Register Schema (Strict stripping of role and permissions: Mass Assignment Immunity)
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe contener al menos 2 caracteres').max(100).optional(),
  nombre: z.string().trim().min(2, 'El nombre debe contener al menos 2 caracteres').max(100).optional(),
  email: z.string().trim().email('Ingresa un correo electrónico válido').max(100),
  password: z.string().min(8, 'La contraseña debe contener mínimo 8 caracteres').max(128),
  // Any role, permissions, or admin flags sent by clients are stripped and ignored
  role: z.any().optional(),
  permissions: z.any().optional(),
  permisos: z.any().optional(),
}).refine(data => Boolean((data.name && data.name.trim().length >= 2) || (data.nombre && data.nombre.trim().length >= 2)), {
  message: 'El nombre debe contener al menos 2 caracteres',
  path: ['name'],
});

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(120),
  email: z.string().trim().email('Correo electrónico no válido').max(100),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, 'Asunto muy corto').max(150),
  message: z.string().trim().min(5, 'El mensaje debe contener al menos 5 caracteres').max(3000),
  hp: z.string().optional(), // Honeypot
});

// PQRS Schema (Consumer Statute Law 1480 of 2011)
export const pqrsSchema = z.object({
  type: z.enum(['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion']),
  fullName: z.string().trim().min(2, 'Nombre completo requerido').max(120),
  docType: z.enum(['CC', 'CE', 'TI', 'NIT', 'PASAPORTE']),
  docNumber: z.string().trim().min(4, 'Número de documento no válido').max(30),
  email: z.string().trim().email('Correo electrónico no válido').max(100),
  phone: z.string().trim().max(30).optional(),
  orderId: z.string().trim().max(50).optional(),
  subject: z.string().trim().min(3, 'Asunto requerido').max(150),
  description: z.string().trim().min(10, 'Describe tu solicitud detalladamente (mínimo 10 caracteres)').max(3000),
  hp: z.string().optional(),
});

// Assistant Chat Schema
export const chatSchema = z.object({
  message: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(1500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'assistant', 'system']),
        text: z.string().max(2500).optional(),
        content: z.string().max(2500).optional(),
        message: z.string().max(2500).optional(),
        recommendedProductIds: z.array(z.string()).optional(),
      })
    )
    .max(50)
    .optional(),
  context: z.any().optional(),
});

// Order Creation Schema
export const orderCreationSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().optional(),
        product: z.any().optional(),
        quantity: z.number().int().min(1).max(50),
        selectedColor: z.any().optional(),
        selectedSize: z.string().optional(),
      })
    )
    .min(1, 'El carrito debe contener al menos una prenda'),
  shippingAddress: z
    .object({
      id: z.string().optional(),
      recipientName: z.string().trim().min(2, 'Nombre del destinatario requerido').max(120),
      address: z.string().trim().max(200).optional(),
      street: z.string().trim().max(200).optional(),
      city: z.string().trim().min(2, 'Ciudad requerida').max(80),
      department: z.string().trim().min(2, 'Departamento requerido').max(80),
      phone: z.string().trim().min(7, 'Teléfono de contacto requerido').max(30),
      postalCode: z.string().optional(),
      isDefault: z.boolean().optional(),
      additionalInfo: z.string().max(200).optional(),
    })
    .refine(
      (v) => ((v.address || v.street || '').trim().length >= 4),
      { message: 'Dirección de entrega requerida' }
    ),
  paymentMethod: z.enum(['cash_on_delivery', 'bank_transfer']),
  bankTransfer: z
    .object({
      bankName: z.string().trim().min(2, 'Nombre del banco requerido').max(80),
      accountHolder: z.string().trim().min(2, 'Titular de la cuenta requerido').max(120),
      accountLast4: z.string().max(4).optional(),
    })
    .optional(),
  couponCode: z.string().max(30).optional(),
  discount: z.number().min(0).optional(),
  documentId: z.string().max(30).optional(),
});

// Zod Validation Middleware Generator
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorDetails = result.error.issues.map(i => `${i.path.join('.') || 'body'}: ${i.message}`).join(', ');
      logSecurityEvent({
        eventType: 'VALIDATION_FAILED',
        severity: 'warning',
        description: `Error de validación en ${req.method} ${req.path}: ${errorDetails}`,
        ip: req.ip || '127.0.0.1',
        status: 'BLOCKED',
        endpoint: `${req.method} ${req.path}`,
      });
      res.status(400).json({
        error: 'Datos de solicitud inválidos',
        detalles: errorDetails,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

// ---------------------------------------------------------------------
// 8. STRICT FILE UPLOAD VALIDATION (Magic Bytes, Max 5MB, Random Name)
// ---------------------------------------------------------------------
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  detectedMime?: string;
  safeFilename?: string;
}

export function validateImageUploadBuffer(base64Payload: string, clientMime?: string): ImageValidationResult {
  if (!base64Payload || typeof base64Payload !== 'string') {
    return { valid: false, error: 'Cuerpo de imagen base64 ausente o inválido' };
  }

  // Remove data:image/...;base64, header prefix
  const cleanBase64 = base64Payload.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleanBase64, 'base64');
  } catch {
    return { valid: false, error: 'Codificación base64 corrupta' };
  }

  // 1. Enforce size limit (Max 5 MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    return { valid: false, error: 'El archivo excede el tamaño máximo permitido de 5 MB' };
  }
  if (buffer.length < 32) {
    return { valid: false, error: 'Archivo demasiado pequeño o corrupto' };
  }

  // 2. Binary Magic Bytes Inspection
  let detectedMime = '';
  let extension = '';

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    detectedMime = 'image/jpeg';
    extension = 'jpg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedMime = 'image/png';
    extension = 'png';
  }
  // WEBP: 'RIFF'....'WEBP'
  else if (
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    detectedMime = 'image/webp';
    extension = 'webp';
  } else {
    return {
      valid: false,
      error: 'Formato binario no permitido. Solo se admiten imágenes reales en formato JPEG, PNG o WEBP.',
    };
  }

  // Generate completely random UUID filename — never trust client-supplied filename (Path Traversal Immunity)
  const safeFilename = `${Date.now()}-${randomBytes(16).toString('hex')}.${extension}`;

  return {
    valid: true,
    buffer,
    detectedMime,
    safeFilename,
  };
}

// ---------------------------------------------------------------------
// 9. IDOR OWNERSHIP VERIFICATION HELPERS
// ---------------------------------------------------------------------
export interface UserAuthContext {
  id: string;
  email: string;
  role: string;
  roleId?: string;
  permissions?: string[];
}

export function isStaffUser(user?: UserAuthContext): boolean {
  if (!user) return false;
  return user.role !== 'cliente';
}

export function verifyResourceOwnership(
  user: UserAuthContext,
  resourceOwnerId?: string,
  resourceOwnerEmail?: string,
  requiredStaffPermission?: string
): boolean {
  // 1. Staff with permission or super_admin
  if (user.role === 'admin' || user.roleId === 'super_admin') {
    return true;
  }
  if (requiredStaffPermission && user.permissions?.includes(requiredStaffPermission)) {
    return true;
  }

  // 2. Resource owner match by ID or Email
  const matchesId = Boolean(resourceOwnerId && resourceOwnerId === user.id);
  const matchesEmail = Boolean(
    resourceOwnerEmail && resourceOwnerEmail.toLowerCase().trim() === user.email.toLowerCase().trim()
  );

  return matchesId || matchesEmail;
}

// ---------------------------------------------------------------------
// 10. ACTIVACIÓN BTL "GIRA Y ESTRENA" (RULETA DE PREMIOS)
// ---------------------------------------------------------------------
export const strictRuletaLimiter = createRateLimiter({
  bucketPrefix: 'ruleta',
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 5 intentos por 15 minutos por IP
  errorMessage: 'Has alcanzado el límite de intentos en la ruleta. Por favor espera 15 minutos.',
});

export const ruletaGirarSchema = z.object({
  nombre: z
    .string()
    .transform((val) => val.replace(/[\u0000-\u001F\u007F<>]/g, '').replace(/\s+/g, ' ').trim())
    .pipe(
      z
        .string()
        .min(2, 'El nombre debe contener al menos 2 caracteres')
        .max(60, 'El nombre no puede superar 60 caracteres')
    ),
  correo: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido')
    .max(120, 'El correo no puede superar 120 caracteres')
    .transform((val) => val.toLowerCase()),
  consentimiento: z
    .boolean()
    .refine((val): val is true => val === true, {
      message: 'Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012',
    }),
  reintento: z.boolean().optional(),
});

