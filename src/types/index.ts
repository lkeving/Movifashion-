export type UserRole = 'cliente' | 'admin';

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
  avatarUrl?: string;
  preferences: UserPreferences;
  addresses: UserAddress[];
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
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: UserAddress;
  paymentMethod: 'credit_card' | 'pse' | 'cash_on_delivery';
  paymentStatus: 'paid' | 'pending';
  trackingNumber: string;
  createdAt: string;
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
  eventType: 'AUTH_LOGIN' | 'AUTH_REGISTER' | 'AUTH_FAILED' | 'ROLE_CHECK' | 'ADMIN_CHANGE' | 'AI_PROMPT_CHECK' | 'ORDER_CREATED';
  severity: 'info' | 'warning' | 'alert';
  description: string;
  ip: string;
  userRole?: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
}
