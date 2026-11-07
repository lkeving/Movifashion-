export type UserRole =
  | 'cliente'
  | 'admin'
  | 'super_admin'
  | 'administrador'
  | 'gerente_tienda'
  | 'operador_pedidos'
  | 'marketing_contenido'
  | 'soporte_cliente'
  | 'finanzas'
  | 'analista'
  | string;

export interface StaffRole {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[]; // 'modulo.accion'
  es_sistema: boolean;
  createdAt?: string;
}

export interface UserPreferences {
  style: 'minimalista' | 'streetwear' | 'clasico' | 'deportivo' | 'elegante';
  favoriteCategories: string[];
  typicalBudget: number; // in COP
  preferredSizes: string[];
  favoriteColors: string[];
}

export interface UserAddress {
  id: string;
  recipientName: string;
  street: string;
  city: string;
  department: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: string;
  permissions?: string[];
  avatarUrl?: string;
  preferences: UserPreferences;
  addresses: UserAddress[];
  estado?: 'activo' | 'suspendido' | 'bloqueado' | 'pendiente';
  mfaEnabled?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  failedAttempts?: number;
  lockedUntil?: string;
  notas?: string;
  etiquetas?: string[];
  deletedAt?: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  itemCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  images: string[];
  colorImages?: Record<string, string[]>;
  sizes: string[];
  colors: { name: string; hex: string }[];
  inventory: number;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  cost?: number;
  margin?: number;
  status?: 'borrador' | 'publicado' | 'archivado';
  scheduledAt?: string;
  lowStockThreshold?: number;
  deletedAt?: string;
  updatedAt?: string;
  tags: string[];
  features?: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  quantity: number;
}

export type OrderStatus =
  | 'Pendiente'
  | 'Confirmado'
  | 'En preparación'
  | 'Enviado'
  | 'Entregado'
  | 'Cancelado';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  subtotalBase?: number;
  iva?: number;
  tarifaIva?: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  shippingAddress: UserAddress;
  paymentMethod: 'credit_card' | 'pse' | 'cash_on_delivery';
  paymentStatus: 'paid' | 'pending';
  trackingNumber: string;
  simulated?: boolean;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    documentId?: string;
    address?: string;
    city?: string;
  };
}

export interface IAMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  criteria?: {
    category?: string;
    maxBudget?: number;
    characteristics?: string[];
    affinityScore?: number;
  };
}

export interface RecommendationItem {
  id: string;
  product: Product;
  affinityScore: number; // 0 to 100
  reason:
    | 'Porque te gustó este producto'
    | 'Basado en tus búsquedas'
    | 'Productos similares'
    | 'Completa tu outfit'
    | 'También podría interesarte';
  recommendedAt: string;
}

export interface SalesPredictionData {
  timeSeries: {
    period: string; // 'Día -6', 'Día -5', ... 'Hoy', 'Día +1', etc.
    historical?: number;
    projected?: number;
    upperBound?: number;
    lowerBound?: number;
  }[];
  nextWeekEstimate: number;
  nextMonthEstimate: number;
  growthCategories: { category: string; growthRate: number; projectedSales: number }[];
  inventoryAlerts: { product: Product; currentStock: number; estimatedDemand: number; daysRemaining: number }[];
  modelMetrics: {
    modelName: string;
    r2Score: number;
    mae: number;
    rmse: number;
    trainingDate: string;
    totalHistoricalDataPoints: number;
  };
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'AUTH_LOGIN' | 'AUTH_REGISTER' | 'AUTH_FAILED' | 'ROLE_CHECK' | 'ADMIN_CHANGE' | 'AI_PROMPT_CHECK' | 'ORDER_CREATED' | 'API_REQUEST';
  severity: 'info' | 'warning' | 'alert';
  description: string;
  ip: string;
  userRole?: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
}

export interface AppAuditLog {
  id: string;
  timestamp: string;
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
  estado: 'EXITO' | 'DENEGADO' | 'ADVERTENCIA';
  motivo?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  lowStockAlert?: number;
  priceOverride?: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantSku?: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolución' | 'venta';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  precioAnterior: number;
  precioNuevo: number;
  usuarioId?: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId?: string;
  userName: string;
  userEmail: string;
  tipo: 'retracto' | 'garantia' | 'cambio';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }[];
  motivo: string;
  estado: 'solicitado' | 'en_revision' | 'aprobado' | 'rechazado' | 'completado';
  resolucion?: string;
  reembolsoSimulado?: number;
  reponerInventario?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  estadoAnterior: string;
  estadoNuevo: string;
  nota?: string;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: string;
}

export interface OrderNote {
  id: string;
  orderId: string;
  nota: string;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'pedido' | 'stock' | 'pqrs' | 'devolucion' | 'seguridad' | 'sistema';
  leido: boolean;
  link?: string;
  createdAt: string;
}

export interface ContentPage {
  slug: string;
  titulo: string;
  contenido: string;
  metaDescripcion?: string;
  publicado: boolean;
  versionActual: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface ContentVersion {
  id: string;
  pageSlug: string;
  version: number;
  titulo: string;
  contenido: string;
  createdAt: string;
  createdBy: string;
}

export interface KnowledgeEntry {
  id: string;
  categoria: string;
  titulo: string;
  contenido: string;
  palabrasClave: string[];
  activo: boolean;
  updatedAt: string;
}

export interface MonthlySalesGoal {
  month: string; // YYYY-MM
  targetSales: number;
  updatedAt: string;
}

export interface ShippingConfig {
  freeShippingThreshold: number;
  standardRate: number;
  cities: { city: string; department: string; rate: number; deliveryDays: string }[];
  carriers: string[];
}

export interface StaffSession {
  id: string;
  userId: string;
  userName: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  email: string;
  ip: string;
  userAgent?: string;
  resultado: 'EXITO' | 'FALLIDO' | 'BLOQUEADO';
  motivo?: string;
  createdAt: string;
}
