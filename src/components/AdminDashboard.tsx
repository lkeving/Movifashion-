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
  Upload,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Layers,
  Search,
} from 'lucide-react';
import { Product, ProductCategory, Order, SecurityAuditLog, SalesPredictionData } from '../types';
import { SUPABASE_SQL_MIGRATIONS } from '../data/supabaseSchema';
import { HERO_BANNER_IMAGE } from '../data/mockProducts';
import { authFetch } from '../utils/api';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: any) => void;
}

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  ordersCount: number;
  totalSpent: number;
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
    'bi' | 'categories' | 'products' | 'orders' | 'customers' | 'behavior' | 'predictions' | 'security' | 'database'
  >('bi');

  const [predictionData, setPredictionData] = useState<SalesPredictionData | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([]);
  const [customersList, setCustomersList] = useState<AdminCustomer[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [isClearingDemo, setIsClearingDemo] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters for product list
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Camisetas');
  const [newProdBrand, setNewProdBrand] = useState('MOVI STUDIO');
  const [newProdPrice, setNewProdPrice] = useState(120000);
  const [newProdInventory, setNewProdInventory] = useState(25);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // New category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Editing product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchPredictions = async () => {
    try {
      const res = await authFetch('/api/admin/predictions');
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
      const res = await authFetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await authFetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await authFetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await authFetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPredictions();
    fetchAuditLogs();
    fetchCategories();
    fetchCustomers();
    fetchAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchPredictions(),
      fetchAuditLogs(),
      fetchCategories(),
      fetchCustomers(),
      fetchAnalytics(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATIONS);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('La imagen no debe superar 1 MB de tamaño.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await authFetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            filename: file.name,
            mimeType: file.type,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setNewProdImageUrl(data.url);
        } else {
          setNewProdImageUrl(base64);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const mainImg = newProdImageUrl || products[0]?.images[0] || HERO_BANNER_IMAGE;
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
    setNewProdImageUrl('');
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await authFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDescription.trim(),
          iconName: 'Sparkles',
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCategoriesList([...categoriesList, created]);
        setShowAddCategoryModal(false);
        setNewCatName('');
        setNewCatDescription('');
        setActionNotice(`Categoría "${created.name}" creada exitosamente.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const linkedCount = products.filter(p => p.category.toLowerCase() === name.toLowerCase()).length;
    if (linkedCount > 0) {
      alert(`No es posible eliminar "${name}" porque contiene ${linkedCount} prendas asociadas en el catálogo.`);
      return;
    }

    if (!confirm(`¿Deseas eliminar la categoría "${name}"?`)) return;

    try {
      const res = await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategoriesList(categoriesList.filter(c => c.id !== id));
        setActionNotice(`Categoría "${name}" eliminada correctamente.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDemoData = async () => {
    setIsSeedingDemo(true);
    try {
      const res = await authFetch('/api/admin/seed-demo-data', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActionNotice(`¡Éxito! Se generaron ${data.ordersCreated} pedidos y ${data.eventsCreated} eventos de demostración.`);
        setTimeout(() => setActionNotice(null), 4000);
        await handleRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleClearDemoData = async () => {
    if (!confirm('¿Deseas eliminar todos los pedidos y eventos de prueba simulados?')) return;
    setIsClearingDemo(true);
    try {
      const res = await authFetch('/api/admin/clear-demo-data', { method: 'POST' });
      if (res.ok) {
        setActionNotice('Datos de demostración eliminados. El catálogo conserva únicamente las órdenes reales.');
        setTimeout(() => setActionNotice(null), 4000);
        await handleRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearingDemo(false);
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgTicket = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const filteredProducts = products.filter(p => {
    if (productCatFilter !== 'all' && p.category.toLowerCase() !== productCatFilter.toLowerCase()) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refrescar métricas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7656D6] hover:bg-white hover:text-[#30234F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'bi', label: 'Dashboard BI', icon: BarChart3 },
          { id: 'categories', label: 'Categorías', icon: Layers, badge: categoriesList.length },
          { id: 'products', label: 'Gestión Productos', icon: Package, badge: products.length },
          { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: orders.length },
          { id: 'customers', label: 'Clientes', icon: Users, badge: customersList.length },
          { id: 'behavior', label: 'Analítica Big Data', icon: Brain },
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                <span>+14.8% en ventas</span>
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
                <span>+9.2% recurrencia</span>
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
      {/* 2. GESTIÓN DE CATEGORÍAS TAB (CRUD) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Gestión de Categorías ({categoriesList.length})
              </h2>
              <p className="text-xs text-gray-500">Recuento dinámico de prendas vinculadas y validación de eliminación</p>
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Nueva Categoría</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesList.map(cat => {
              const activeCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <div key={cat.id} className="p-4 rounded-2xl bg-[#F5F5F8] border border-gray-200/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#30234F]">{cat.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#7656D6]">
                        {activeCount} prendas
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{cat.description || 'Sin descripción'}</p>
                    <span className="text-[10px] font-mono text-gray-400 block mt-2">slug: {cat.slug}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200/60 flex justify-end">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GESTIÓN DE PRODUCTOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Catálogo de Productos en Tiempo Real ({products.length} prendas)
              </h2>
              <p className="text-xs text-gray-500">Operaciones CRUD de inventario, precios y fotos</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar prenda..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                />
              </div>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#7656D6]"
              >
                <option value="all">Todas las categorías</option>
                {categoriesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Prenda</span>
              </button>
            </div>
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
                {filteredProducts.map((p) => (
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
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#7656D6] hover:bg-gray-100 cursor-pointer"
                        title="Editar stock/precio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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
      {/* 4. GESTIÓN DE PEDIDOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Control y Despacho de Pedidos ({orders.length})
              </h2>
              <p className="text-xs text-gray-500">Transiciones de estado validadas en backend con retorno de stock al cancelar</p>
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
                  <th className="p-3 rounded-r-xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#30234F]">
                      {o.id}
                      {o.simulated && (
                        <span className="block text-[9px] text-amber-600 font-sans font-medium">Simulado</span>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-gray-800">{o.userName}</p>
                      <p className="text-[11px] text-gray-400">{o.userEmail}</p>
                    </td>
                    <td className="p-3 text-gray-600">{o.items.length} prenda(s)</td>
                    <td className="p-3 font-bold tabular-nums text-gray-900">
                      ${o.total.toLocaleString('es-CO')}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{o.trackingNumber}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        o.status === 'Entregado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'Enviado'
                          ? 'bg-blue-100 text-blue-800'
                          : o.status === 'Cancelado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {o.status !== 'Entregado' && (
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'Entregado')}
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 cursor-pointer"
                        >
                          Entregar
                        </button>
                      )}
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7656D6] cursor-pointer"
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
      {/* 5. GESTIÓN DE CLIENTES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Clientes Registrados ({customersList.length})
              </h2>
              <p className="text-xs text-gray-500">Historial de compras y valor de vida del cliente (LTV)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Cliente</th>
                  <th className="p-3">Correo Electrónico</th>
                  <th className="p-3">Fecha Registro</th>
                  <th className="p-3">Pedidos Realizados</th>
                  <th className="p-3 rounded-r-xl text-right">Total Comprado COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customersList.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-bold text-[#30234F]">{c.name}</td>
                    <td className="p-3 text-gray-600">{c.email}</td>
                    <td className="p-3 text-gray-500">{new Date(c.registeredAt).toLocaleDateString('es-CO')}</td>
                    <td className="p-3 font-semibold text-[#7656D6]">{c.ordersCount} pedidos</td>
                    <td className="p-3 font-bold tabular-nums text-right text-gray-900">
                      ${c.totalSpent.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ANALÍTICA BIG DATA & COMPORTAMIENTO TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'behavior' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Controls: Demo Data Generation & Reset */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#E9E2FA]/50 to-white border border-[#7656D6]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#30234F]">Simulador Big Data para Demostración</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Genera ~300 pedidos con estacionalidad de quincenas y fines de semana + 3.000 eventos de comportamiento.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDemoData}
                disabled={isSeedingDemo}
                className="px-4 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSeedingDemo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generando datos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generar datos de demostración</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClearDemoData}
                disabled={isClearingDemo}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isClearingDemo ? 'Borrando...' : 'Borrar datos demo'}
              </button>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
              Embudo de Conversión de Clientes (Funnel)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {(analyticsData?.funnel || [
                { stage: 'Vistas de Producto', count: 1840, percent: 100 },
                { stage: 'Agregado al Carrito', count: 620, percent: 34 },
                { stage: 'Inicio de Checkout', count: 310, percent: 17 },
                { stage: 'Compra Confirmada', count: orders.length, percent: 8 },
              ]).map((st: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F5F5F8] border border-gray-200/60 text-center">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">{st.stage}</span>
                  <p className="text-lg font-black text-[#30234F] mt-1 tabular-nums">{st.count.toLocaleString('es-CO')}</p>
                  <span className="text-xs font-bold text-[#7656D6]">{st.percent}% del total</span>
                </div>
              ))}
            </div>
          </div>

          {/* RFM Segmentation & Association Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Segmentación RFM de Clientes
              </h3>
              <div className="space-y-2.5">
                {(analyticsData?.rfmSegments || [
                  { segment: 'Campeones (Champions)', count: 48, percentage: 22, description: 'Compran con alta frecuencia y mayor ticket' },
                  { segment: 'Clientes Leales', count: 76, percentage: 35, description: 'Responden favorablemente a novedades y lanzamientos' },
                  { segment: 'Potenciales', count: 52, percentage: 24, description: 'Han realizado 1 o 2 compras con alta afinidad' },
                  { segment: 'En Riesgo', count: 28, percentage: 13, description: 'Sin compras en los últimos 45 días' },
                ]).map((rfm: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{rfm.segment}</p>
                      <p className="text-[11px] text-gray-500">{rfm.description}</p>
                    </div>
                    <span className="font-mono font-bold text-[#7656D6] tabular-nums">{rfm.count} clientes ({rfm.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Reglas de Asociación ("Completa tu outfit")
              </h3>
              <div className="space-y-2.5">
                {(analyticsData?.associationRules || [
                  { itemA: 'Tenis Deportivos Urbanos', itemB: 'Pantalón Cargo Sartorial', confidence: 78, lift: 2.4 },
                  { itemA: 'Blazer Ejecutivo Ciruela', itemB: 'Camiseta Cuello Henley', confidence: 64, lift: 1.9 },
                  { itemA: 'Bolso Tote en Cuero', itemB: 'Vestido Midi Minimalista', confidence: 58, lift: 1.8 },
                ]).map((rule: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#E9E2FA]/30 border border-[#E9E2FA] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#30234F]">{rule.itemA}</span>
                      <span className="text-gray-400 mx-1.5">→</span>
                      <span className="font-bold text-[#7656D6]">{rule.itemB}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600">Confianza: {rule.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Strategic Insights */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
              Insights Estratégicos Automatizados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(analyticsData?.automatedInsights || [
                { title: 'Patrón Quincena', description: 'El 54% de las ventas ocurren en días 15 y 30. Se recomienda lanzar campañas promocionales un día antes.' },
                { title: 'Stock Crítico en Calzado', description: 'Zapatos y sneakers tienen una velocidad de rotación alta con inventario estimado de 4 días.' },
                { title: 'Fricción de Checkout Reducida', description: 'La pasarela simulada con un solo clic redujo los carritos abandonados en un 18%.' },
              ]).map((ins: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">{ins.title}</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">{ins.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. PREDICCIÓN DE VENTAS (ML) TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'predictions' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#30234F] to-[#7656D6] text-white">
              <span className="text-xs text-[#E9E2FA] uppercase tracking-wider">Pronóstico Próximos 7 Días</span>
              <p className="text-2xl font-black mt-2 tabular-nums">
                ${(predictionData?.nextWeekEstimate || 64200000).toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-white/80 mt-1">Estimación con intervalo de confianza del 95%</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Pronóstico Mensual</span>
              <p className="text-2xl font-black text-[#30234F] mt-2 tabular-nums">
                ${(predictionData?.nextMonthEstimate || 268000000).toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Crecimiento proyectado +18.5%</p>
            </div>
          </div>

          {/* Time Series Projection Table */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
              Serie Temporal (Ridge Regression & Suavizado Exponencial)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Período</th>
                    <th className="p-3">Histórico COP</th>
                    <th className="p-3">Proyectado COP</th>
                    <th className="p-3">Límite Inferior</th>
                    <th className="p-3 rounded-r-xl">Límite Superior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {predictionData?.timeSeries.map((ts, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80">
                      <td className="p-3 font-semibold text-gray-800">{ts.period}</td>
                      <td className="p-3 font-mono tabular-nums text-gray-700">
                        {ts.historical ? `$${ts.historical.toLocaleString('es-CO')}` : '-'}
                      </td>
                      <td className="p-3 font-mono font-bold tabular-nums text-[#7656D6]">
                        {ts.projected ? `$${ts.projected.toLocaleString('es-CO')}` : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-gray-400">
                        {ts.lowerBound ? `$${ts.lowerBound.toLocaleString('es-CO')}` : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-gray-400">
                        {ts.upperBound ? `$${ts.upperBound.toLocaleString('es-CO')}` : '-'}
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
      {/* 8. SEGURIDAD OWASP TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Registros de Auditoría de Seguridad OWASP Top 10
              </h2>
              <p className="text-xs text-gray-500">Eventos de autenticación, control de acceso y mitigación de prompt injection</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F8] text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Fecha / Hora</th>
                  <th className="p-3">Evento</th>
                  <th className="p-3">Severidad</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3">IP Origen</th>
                  <th className="p-3 rounded-r-xl">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="p-3 font-mono text-[11px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-bold text-gray-800">{log.eventType}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.severity === 'alert'
                          ? 'bg-red-100 text-red-700'
                          : log.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 max-w-xs truncate">{log.description}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{log.ip}</td>
                    <td className="p-3 font-bold text-gray-800">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. ESQUEMA DE BASE DE DATOS SUPABASE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'database' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Esquema PostgreSQL & Supabase (Tablas Principales + RLS)
              </h2>
              <p className="text-xs text-gray-500">
                Migración completa lista para ejecutar en el SQL Editor de Supabase
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
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#30234F] mb-4">Agregar Nueva Prenda al Catálogo</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de la Prenda</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Chaqueta Bomber Tech Lavanda"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#7656D6]"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inventario Inicial</label>
                  <input
                    type="number"
                    value={newProdInventory}
                    onChange={(e) => setNewProdInventory(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                    required
                  />
                </div>
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fotografía de Producto (JPG, PNG o WebP - Máx 1 MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E9E2FA] file:text-[#7656D6] hover:file:bg-[#7656D6] hover:file:text-white cursor-pointer"
                  />
                  {isUploadingImage && <Loader2 className="w-4 h-4 animate-spin text-[#7656D6]" />}
                </div>
                {newProdImageUrl && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-xs">{newProdImageUrl}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Detalles de corte, materiales y confección..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Crear Prenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#30234F] mb-4">Nueva Categoría de Catálogo</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej: Calzado Formal"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  placeholder="Prendas y siluetas que componen esta categoría..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Guardar Categoría
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Inventario Disponible</label>
                <input
                  type="number"
                  value={editingProduct.inventory}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#7656D6]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all cursor-pointer"
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
