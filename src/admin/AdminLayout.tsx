// Main Enterprise Back-Office Layout & Shell
// Collapsible grouped sidebar, Ctrl+K search, 30s notifications polling, session inactivity timeout

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  RotateCcw,
  Users,
  Package,
  Layers,
  Tag,
  Inbox,
  Sparkles,
  FileText,
  TrendingUp,
  Receipt,
  Truck,
  Shield,
  Key,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Menu,
  X,
  QrCode,
  Lock,
} from 'lucide-react';
import { User, Product, Order, ProductCategory } from '../types/index.ts';
import { hasPermission, hasModuleAccess } from './rbac.ts';
import { authFetch } from '../utils/api.ts';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';

// Modules
import { ResumenModule } from './modules/ResumenModule.tsx';
import { PedidosModule } from './modules/PedidosModule.tsx';
import { DevolucionesModule } from './modules/DevolucionesModule.tsx';
import { ProductosModule } from './modules/ProductosModule.tsx';
import { InventarioModule } from './modules/InventarioModule.tsx';
import { CategoriasModule } from './modules/CategoriasModule.tsx';
import { MarketingModule } from './modules/MarketingModule.tsx';
import { ClientesModule } from './modules/ClientesModule.tsx';
import { AtencionModule } from './modules/AtencionModule.tsx';
import { AsistenteModule } from './modules/AsistenteModule.tsx';
import { ContenidoModule } from './modules/ContenidoModule.tsx';
import { AnaliticaModule } from './modules/AnaliticaModule.tsx';
import { FinanzasModule } from './modules/FinanzasModule.tsx';
import { EnviosModule } from './modules/EnviosModule.tsx';
import { UsuariosModule } from './modules/UsuariosModule.tsx';
import { AuditoriaModule } from './modules/AuditoriaModule.tsx';
import { ConfiguracionModule } from './modules/ConfiguracionModule.tsx';

interface AdminLayoutProps {
  currentUser: User;
  products: Product[];
  orders: Order[];
  categories: ProductCategory[];
  onLogout: () => void;
  onRefreshData?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  products,
  orders,
  categories,
  onLogout,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // 2FA Setup State
  const [twoFaData, setTwoFaData] = useState<any | null>(null);
  const [twoFaCodeInput, setTwoFaCodeInput] = useState('');
  const [twoFaSuccess, setTwoFaSuccess] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Poll Notifications every 30 seconds
  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/admin/notifications');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Inactivity timeout warning (30 minutes of no user activity)
  useEffect(() => {
    let timeout: any;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert('Tu sesión de personal ha expirado por 30 minutos de inactividad.');
        onLogout();
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [onLogout]);

  const userPerms = currentUser.permissions || [];
  const userRole = currentUser.roleId || currentUser.role;

  // Sidebar navigation structure
  const navGroups = [
    {
      group: 'Principal',
      items: [
        { id: 'resumen', label: 'Resumen Ejecutivo', icon: LayoutDashboard, perm: 'resumen.ver' },
      ],
    },
    {
      group: 'Ventas',
      items: [
        { id: 'pedidos', label: 'Pedidos y Guías', icon: ShoppingBag, perm: 'pedidos.ver' },
        { id: 'devoluciones', label: 'Devoluciones y Retractos', icon: RotateCcw, perm: 'devoluciones.ver' },
        { id: 'clientes', label: 'Clientes y Segmentos', icon: Users, perm: 'clientes.ver' },
      ],
    },
    {
      group: 'Catálogo',
      items: [
        { id: 'productos', label: 'Prendas y Variantes', icon: Package, perm: 'productos.ver' },
        { id: 'inventario', label: 'Inventario y Kardex', icon: Layers, perm: 'inventario.ver' },
        { id: 'categorias', label: 'Categorías', icon: Tag, perm: 'categorias.ver' },
      ],
    },
    {
      group: 'Marketing',
      items: [
        { id: 'marketing', label: 'Campañas y Cupones', icon: Sparkles, perm: 'marketing.ver' },
      ],
    },
    {
      group: 'Atención',
      items: [
        { id: 'atencion', label: 'PQRS y Contacto', icon: Inbox, perm: 'atencion.ver' },
        { id: 'asistente', label: 'Asistente IA (Movi)', icon: Sparkles, perm: 'asistente.ver' },
      ],
    },
    {
      group: 'Contenido',
      items: [
        { id: 'contenido', label: 'Páginas y CMS', icon: FileText, perm: 'contenido.ver' },
      ],
    },
    {
      group: 'Analítica',
      items: [
        { id: 'analitica', label: 'Analítica y Big Data', icon: TrendingUp, perm: 'analitica.ver' },
      ],
    },
    {
      group: 'Finanzas',
      items: [
        { id: 'finanzas', label: 'Ventas e IVA 19%', icon: Receipt, perm: 'finanzas.ver' },
      ],
    },
    {
      group: 'Operación',
      items: [
        { id: 'envios', label: 'Tarifas y Envíos', icon: Truck, perm: 'envios.ver' },
      ],
    },
    {
      group: 'Administración',
      items: [
        { id: 'usuarios', label: 'Equipo y Roles RBAC', icon: Key, perm: 'usuarios.ver' },
        { id: 'auditoria', label: 'Auditoría y Seguridad', icon: Shield, perm: 'auditoria.ver' },
        { id: 'configuracion', label: 'Configuración Global', icon: Settings, perm: 'configuracion.ver' },
      ],
    },
  ];

  // Filter groups according to RBAC permissions
  const visibleGroups = navGroups
    .map(g => ({
      ...g,
      items: g.items.filter(item => hasPermission(userPerms, item.perm, userRole)),
    }))
    .filter(g => g.items.length > 0);

  // Setup 2FA Flow
  const start2FASetup = async () => {
    try {
      const res = await authFetch('/api/admin/auth/2fa/setup', { method: 'POST' });
      if (res.ok) {
        setTwoFaData(await res.json());
        setShow2FAModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirm2FACode = async () => {
    try {
      const res = await authFetch('/api/admin/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFaCodeInput }),
      });
      if (res.ok) {
        setTwoFaSuccess(true);
        setTimeout(() => {
          setShow2FAModal(false);
          setTwoFaSuccess(false);
          setTwoFaData(null);
        }, 2000);
      } else {
        alert('Código incorrecto o expirado.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-800">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-[#7656D6] to-purple-400 text-white flex items-center justify-center font-black text-sm shadow-sm">
              M
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm block leading-tight">
                MoviFashion Back-Office
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                Colombia S.A.S. · Panel Administrativo
              </span>
            </div>
          </div>
        </div>

        {/* Search bar & quick triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-xs border border-slate-200 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Buscar pedidos, clientes, prendas...</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 ml-2">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900">Centro de Notificaciones</span>
                  <span className="text-[10px] text-slate-400 font-mono">Sondeo cada 30s</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-6">Sin notificaciones nuevas</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="font-bold text-slate-800 block">{n.titulo}</span>
                        <p className="text-slate-500 text-[11px]">{n.mensaje}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs text-slate-800 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider block">
                  {userRole}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7656D6] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-fadeIn space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <span className="font-bold text-slate-900 block truncate">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{currentUser.email}</span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    start2FASetup();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7656D6]" />
                  <span>Seguridad 2FA</span>
                </button>

                <a
                  href="/"
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ir a Tienda Pública</span>
                </a>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 z-30 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'}`}
        >
          <div className="overflow-y-auto p-3 space-y-4 flex-1">
            {visibleGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1">
                    {grp.group}
                  </span>
                )}
                {grp.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#7656D6] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom collapse button */}
          <div className="p-3 border-t border-slate-100 hidden lg:block">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={isSidebarCollapsed ? 'Expandir barra' : 'Colapsar barra'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Module Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'resumen' && <ResumenModule onNavigateTab={tab => setActiveTab(tab)} />}
            {activeTab === 'pedidos' && <PedidosModule orders={orders} onOrderUpdated={onRefreshData} />}
            {activeTab === 'devoluciones' && <DevolucionesModule />}
            {activeTab === 'productos' && (
              <ProductosModule
                products={products}
                categories={categories}
                userRole={userRole}
                onProductsChanged={onRefreshData}
              />
            )}
            {activeTab === 'inventario' && <InventarioModule onStockChanged={onRefreshData} />}
            {activeTab === 'categorias' && <CategoriasModule onCategoriesChanged={onRefreshData} />}
            {activeTab === 'marketing' && <MarketingModule />}
            {activeTab === 'clientes' && <ClientesModule userRole={userRole} />}
            {activeTab === 'atencion' && <AtencionModule />}
            {activeTab === 'asistente' && <AsistenteModule />}
            {activeTab === 'contenido' && <ContenidoModule />}
            {activeTab === 'analitica' && <AnaliticaModule />}
            {activeTab === 'finanzas' && <FinanzasModule />}
            {activeTab === 'envios' && <EnviosModule />}
            {activeTab === 'usuarios' && <UsuariosModule currentUserId={currentUser.id} />}
            {activeTab === 'auditoria' && <AuditoriaModule />}
            {activeTab === 'configuracion' && <ConfiguracionModule userRole={userRole} />}
          </div>
        </main>
      </div>

      {/* Spotlight Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        orders={orders}
        onNavigateTab={tab => setActiveTab(tab)}
      />

      {/* 2FA Setup Modal */}
      {show2FAModal && twoFaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Configurar Autenticación en Dos Pasos (2FA)
            </h3>
            <p className="text-slate-500 mb-4">
              Escanea el código QR con Google Authenticator o ingresa la clave manual.
            </p>

            {twoFaSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-center font-bold">
                ✓ 2FA configurado y activado exitosamente.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center p-3 bg-white border border-slate-200 rounded-2xl">
                  <img src={twoFaData.qrImageUrl} alt="QR Code" className="w-44 h-44" />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-center text-slate-700 font-bold select-all border border-slate-100">
                  {twoFaData.secret}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Verificación (6 dígitos):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFaCodeInput}
                    onChange={e => setTwoFaCodeInput(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-center text-base tracking-widest font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                  />
                </div>

                <button
                  onClick={confirm2FACode}
                  disabled={twoFaCodeInput.length !== 6}
                  className="w-full py-2.5 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  Verificar y Activar 2FA
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
