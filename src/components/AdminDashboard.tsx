import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  Brain,
  Shield,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Copy,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import { Product, Order, SecurityAuditLog, SalesPredictionData } from '../types';
import { SUPABASE_SQL_MIGRATIONS } from '../data/supabaseSchema';
import { HERO_BANNER_IMAGE } from '../data/mockProducts';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  orders,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<
    'bi' | 'products' | 'orders' | 'behavior' | 'predictions' | 'security' | 'database'
  >('bi');

  const [predictionData, setPredictionData] = useState<SalesPredictionData | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Camisetas');
  const [newProdBrand, setNewProdBrand] = useState('MOVI STUDIO');
  const [newProdPrice, setNewProdPrice] = useState(120000);
  const [newProdInventory, setNewProdInventory] = useState(25);
  const [newProdDescription, setNewProdDescription] = useState('');

  // Editing product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/admin/predictions', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setPredictionData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPredictions();
    fetchAuditLogs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPredictions(), fetchAuditLogs()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATIONS);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const mainImg = products[0]?.images[0] || HERO_BANNER_IMAGE;
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      brand: newProdBrand,
      price: Number(newProdPrice),
      inventory: Number(newProdInventory),
      description: newProdDescription || 'Prenda contemporánea de la colección MOVIFASHION AI.',
      images: [mainImg],
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Lavanda', hex: '#E9E2FA' }],
      colorImages: {
        'Morado Noche': [mainImg],
        'Lavanda': [mainImg],
      },
      rating: 5.0,
      reviewCount: 1,
      tags: [newProdCategory.toLowerCase(), 'nueva-coleccion'],
      createdAt: new Date().toISOString(),
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setNewProdName('');
    setNewProdDescription('');
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0) + 48200000;
  const totalOrdersCount = orders.length + 128;
  const avgTicket = Math.round(totalRevenue / totalOrdersCount);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Admin Banner */}
      <div className="p-6 rounded-3xl bg-[#30234F] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#7656D6] text-white">
              Panel Administrativo BI & IA
            </span>
            <span className="text-xs text-[#E9E2FA]/70">· Conexión segura RBAC activa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Centro de Inteligencia de Negocios · MOVIFASHION AI
          </h1>
          <p className="text-xs text-[#E9E2FA]/80 mt-0.5">
            Monitoreo en tiempo real, predicción de ventas con machine learning y auditoría OWASP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refrescar métricas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7656D6] hover:bg-[#7656D6]/80 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'bi', label: 'Dashboard BI', icon: BarChart3 },
          { id: 'products', label: 'Gestión Productos', icon: Package, badge: products.length },
          { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: orders.length },
          { id: 'behavior', label: 'Análisis Clientes & IA', icon: Brain },
          { id: 'predictions', label: 'Predicción Ventas (ML)', icon: TrendingUp },
          { id: 'security', label: 'Seguridad OWASP', icon: Shield },
          { id: 'database', label: 'Esquema Supabase', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#30234F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-[#F5F5F8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#7656D6] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DASHBOARD BI TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bi' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingresos Totales</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-xl sm:text-2xl font-black text-[#30234F] tabular-nums">
                ${totalRevenue.toLocaleString('es-CO')}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.8% vs mes anterior</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos Totales</span>
                <div className="p-2 rounded-xl bg-[#E9E2FA] text-[#7656D6]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-xl sm:text-2xl font-black text-[#30234F] tabular-nums">
                {totalOrdersCount}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+9.2% tasa de recompra</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Promedio</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-xl sm:text-2xl font-black text-[#30234F] tabular-nums">
                ${avgTicket.toLocaleString('es-CO')}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
                <span>Rango esperado: $210k - $290k</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversión Asistente IA</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-xl sm:text-2xl font-black text-[#7656D6] tabular-nums">
                18.4%
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>4.2x mayor que navegación regular</span>
              </div>
            </div>

          </div>

          {/* Revenue by Category & Daily Trajectory Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Distribution */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F] mb-4">
                Ingresos por Categoría de Moda
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Zapatos (Sneakers & Calzado)', pct: 38, amount: '$18.450.000 COP', color: '#7656D6' },
                  { name: 'Chaquetas (Blazers & Bombers)', pct: 29, amount: '$14.200.000 COP', color: '#30234F' },
                  { name: 'Bolsos & Marroquinería', pct: 16, amount: '$7.850.000 COP', color: '#A080F0' },
                  { name: 'Ropa deportiva (Activewear)', pct: 9, amount: '$4.500.000 COP', color: '#8870C0' },
                  { name: 'Pantalones & Sartorial', pct: 8, amount: '$3.200.000 COP', color: '#D0C2F4' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700">{item.name}</span>
                      <span className="font-mono text-gray-500 tabular-nums">{item.amount} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Sales Chart Simulation */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F] mb-4">
                Evolución de Ventas Semanales (COP)
              </h3>
              <div className="h-44 flex items-end justify-between gap-3 pt-6">
                {[
                  { day: 'Lun', val: 42, label: '$4.2M' },
                  { day: 'Mar', val: 51, label: '$5.1M' },
                  { day: 'Mie', val: 48, label: '$4.8M' },
                  { day: 'Jue', val: 63, label: '$6.3M' },
                  { day: 'Vie', val: 84, label: '$8.4M' },
                  { day: 'Sab', val: 100, label: '$11.2M' },
                  { day: 'Dom', val: 92, label: '$9.2M' },
                ].map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono font-semibold text-[#7656D6] tabular-nums">
                      {col.label}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-[#30234F] to-[#7656D6] rounded-t-lg transition-all"
                      style={{ height: `${col.val}%` }}
                    />
                    <span className="text-xs font-semibold text-gray-500">{col.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. GESTIÓN DE PRODUCTOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Catálogo de Productos en Tiempo Real
              </h2>
              <p className="text-xs text-gray-500">Operaciones CRUD de inventario, precios y disponibilidad</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Prenda</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Prenda / Referencia</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Marca</th>
                  <th className="p-3">Precio COP</th>
                  <th className="p-3">Inventario</th>
                  <th className="p-3">Calificación</th>
                  <th className="p-3 rounded-r-xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-[#30234F]">{p.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">ID: {p.id}</p>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{p.category}</td>
                    <td className="p-3 text-gray-500">{p.brand}</td>
                    <td className="p-3 font-bold tabular-nums text-gray-900">
                      ${(p.discountPrice || p.price).toLocaleString('es-CO')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                        p.inventory <= 15 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.inventory} disp.
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{p.rating} ⭐ ({p.reviewCount})</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#7656D6] hover:bg-gray-100"
                        title="Editar stock/precio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GESTIÓN DE PEDIDOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Control y Despacho de Pedidos
              </h2>
              <p className="text-xs text-gray-500">Transiciones de estado validadas en backend</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">No. Pedido</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Prendas</th>
                  <th className="p-3">Total COP</th>
                  <th className="p-3">Guía</th>
                  <th className="p-3">Estado Actual</th>
                  <th className="p-3 rounded-r-xl text-right">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#30234F]">{o.id}</td>
                    <td className="p-3">
                      <p className="font-semibold text-gray-800">{o.userName}</p>
                      <p className="text-[11px] text-gray-400">{o.userEmail}</p>
                    </td>
                    <td className="p-3 text-gray-600">{o.items.length} artículos</td>
                    <td className="p-3 font-bold tabular-nums text-gray-900">${o.total.toLocaleString('es-CO')}</td>
                    <td className="p-3 font-mono text-gray-500">{o.trackingNumber}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E9E2FA] text-[#7656D6]">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs rounded-lg border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-[#7656D6]"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="En preparación">En preparación</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ANÁLISIS DE CLIENTES & INSIGHTS IA TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'behavior' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* AI Insights Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#7656D6] to-[#30234F] text-white shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#E9E2FA]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Insights Generados por Inteligencia Artificial (Gemini)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <p className="text-xs font-semibold text-[#E9E2FA]">Oportunidad en Calzado & Zapatos</p>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  "Los usuarios están mostrando mayor interés en calzado deportivo con amortiguación y presupuesto &lt; $250.000 COP. Se recomienda mantener destacada la categoría Zapatos en la página principal y reforzar inventario del modelo Ultra Cushion."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <p className="text-xs font-semibold text-[#E9E2FA]">Afinidad Cromática</p>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  "El 62% de las interacciones con el Asistente IA solicitan combinaciones entre lavanda, morado oscuro y negro obsidiana. Las recomendaciones cruzadas de 'Completa tu outfit' han incrementado el ticket promedio un 18%."
                </p>
              </div>
            </div>
          </div>

          {/* Behavior Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#30234F] mb-3">
                Términos Más Buscados
              </h3>
              <div className="space-y-2">
                {[
                  { term: 'tenis deportivos comodos', count: 342 },
                  { term: 'blazer terciopelo noche', count: 219 },
                  { term: 'bolso cuero florentino', count: 184 },
                  { term: 'pantalón cargo minimalista', count: 156 },
                  { term: 'vestido seda lavanda', count: 128 },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-700 font-medium">{item.term}</span>
                    <span className="text-[#7656D6] font-bold tabular-nums">{item.count} búsquedas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#30234F] mb-3">
                Prendas Más Vistas
              </h3>
              <div className="space-y-2">
                {products.slice(0, 5).map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-700 truncate max-w-[170px]">{prod.name}</span>
                    <span className="text-gray-500 font-mono tabular-nums">{prod.reviewCount * 14} vistas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#30234F] mb-3">
                Conversión Asistente IA
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Consultas conversacionales</span>
                  <span className="font-bold text-gray-800">1,248</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Prendas recomendadas</span>
                  <span className="font-bold text-gray-800">3,744</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Clics a ficha de producto</span>
                  <span className="font-bold text-[#7656D6]">892 (71.4%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Compras directas asistidas</span>
                  <span className="font-bold text-emerald-600">230 (18.4%)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PREDICCIÓN DE VENTAS CON MACHINE LEARNING TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'predictions' && predictionData && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Machine Learning Model Header */}
          <div className="p-5 rounded-3xl bg-[#30234F] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#E9E2FA]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E9E2FA]">
                  Modelo Predictivo de Demanda & Ventas
                </h2>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Arquitectura: {predictionData.modelMetrics.modelName} (Scikit-Learn & Pandas pipeline)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-gray-300 block text-[10px]">Precisión R²:</span>
                <span className="font-bold text-emerald-300 font-mono">{(predictionData.modelMetrics.r2Score * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-gray-300 block text-[10px]">Error MAE:</span>
                <span className="font-bold text-white font-mono">${(predictionData.modelMetrics.mae / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>

          {/* Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Proyección de Ventas Próxima Semana
              </span>
              <p className="mt-2 text-2xl font-black text-[#7656D6] tabular-nums">
                ${predictionData.nextWeekEstimate.toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                +12.4% crecimiento estimado basado en comportamiento estacional
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Proyección de Ventas Próximo Mes
              </span>
              <p className="mt-2 text-2xl font-black text-[#30234F] tabular-nums">
                ${predictionData.nextMonthEstimate.toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Intervalo de confianza al 95% [ ${(predictionData.nextMonthEstimate * 0.92 / 1000000).toFixed(1)}M - ${(predictionData.nextMonthEstimate * 1.08 / 1000000).toFixed(1)}M ]
              </p>
            </div>
          </div>

          {/* Comparative Time Series Chart */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F] mb-4">
              Ventas Históricas vs. Estimadas con Banda de Confianza
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 pt-6">
              {predictionData.timeSeries.map((item, idx) => {
                const isProjected = !!item.projected && item.period !== 'Hoy';
                const heightVal = Math.min(100, Math.round(((item.projected || item.historical || 0) / 9500000) * 100));
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isProjected
                          ? 'bg-[#E9E2FA] border-2 border-dashed border-[#7656D6]'
                          : 'bg-[#7656D6]'
                      }`}
                      style={{ height: `${heightVal}%` }}
                      title={`${item.period}: $${((item.projected || item.historical || 0) / 1000000).toFixed(2)}M`}
                    />
                    <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                      {item.period}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#7656D6]" />
                <span>Ventas Históricas Reales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#E9E2FA] border border-dashed border-[#7656D6]" />
                <span>Ventas Estimadas ML (+Intervalo de Error)</span>
              </div>
            </div>
          </div>

          {/* Inventory Alerts from ML model */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Alertas Preventivas de Reabastecimiento de Inventario
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Prenda</th>
                    <th className="p-3">Stock Actual</th>
                    <th className="p-3">Demanda Estimada (14 días)</th>
                    <th className="p-3">Días de Stock Restante</th>
                    <th className="p-3 rounded-r-xl">Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {predictionData.inventoryAlerts.map((alert, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-[#30234F]">{alert.product.name}</td>
                      <td className="p-3 font-mono tabular-nums text-red-600 font-bold">{alert.currentStock} unids.</td>
                      <td className="p-3 font-mono tabular-nums">{alert.estimatedDemand} unids.</td>
                      <td className="p-3 font-bold text-amber-700">{alert.daysRemaining} días</td>
                      <td className="p-3">
                        <span className="text-[11px] font-semibold text-[#7656D6]">
                          Generar orden de confección / reabastecimiento
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. SEGURIDAD INFORMÁTICA OWASP TOP 10 TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="p-6 rounded-3xl bg-[#30234F] text-white space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E9E2FA]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#E9E2FA]">
                Monitoreo de Seguridad · OWASP Top 10 - 2025
              </h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              La plataforma MOVIFASHION AI aplica principios de Secure by Design y Security by Default:
              Control de Acceso basado en Roles (A01 - RBAC), Row Level Security en Supabase, sanitización de entradas frente a Prompt Injection y SQLi (A05/Module 20), verificación de precios desde backend (A06) y registro de auditoría en tiempo real (A09).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
              Registro de Auditoría de Seguridad en Tiempo Real (A09)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Timestamp</th>
                    <th className="p-3">Tipo de Evento</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">IP Origen</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3 rounded-r-xl">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 font-bold text-[#7656D6]">{log.eventType}</td>
                      <td className="p-3 text-gray-700">{log.description}</td>
                      <td className="p-3 font-mono text-gray-500">{log.ip}</td>
                      <td className="p-3 uppercase font-semibold text-gray-600">{log.userRole || 'anónimo'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. ESQUEMA DE BASE DE DATOS SUPABASE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'database' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Esquema PostgreSQL & Supabase (24 Tablas + RLS)
              </h2>
              <p className="text-xs text-gray-500">
                Migración completa lista para desplegar en Supabase Dashboard o CLI
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>¡Código SQL Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Migración SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-[#25232B] text-emerald-300 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed">
              {SUPABASE_SQL_MIGRATIONS}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Add New Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#30234F] mb-4">Agregar Nueva Prenda al Catálogo</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de la Prenda</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Chaqueta Bomber Tech Lavanda"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Camisetas">Camisetas</option>
                    <option value="Pantalones">Pantalones</option>
                    <option value="Vestidos">Vestidos</option>
                    <option value="Chaquetas">Chaquetas</option>
                    <option value="Zapatos">Zapatos</option>
                    <option value="Bolsos">Bolsos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Ropa deportiva">Ropa deportiva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Precio COP</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inventario Inicial</label>
                  <input
                    type="number"
                    value={newProdInventory}
                    onChange={(e) => setNewProdInventory(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Detalles de corte, materiales y confección..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all"
                >
                  Crear Prenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product Price/Stock */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#30234F] mb-1">Actualizar Stock & Precio</h3>
            <p className="text-xs text-gray-500 mb-4">{editingProduct.name}</p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Precio COP</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Inventario Disponible</label>
                <input
                  type="number"
                  value={editingProduct.inventory}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
