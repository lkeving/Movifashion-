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
  FileSpreadsheet,
  Image as ImageIcon,
  Bot,
  BarChart3,
  Download,
} from 'lucide-react';
import { User, Product, Order, ProductCategory } from '../types/index.ts';
import { hasPermission, hasModuleAccess } from './rbac.ts';
import { authFetch } from '../utils/api.ts';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';

// Modules
import { ResumenModule } from './modules/ResumenModule.tsx';
import { VentasModule } from './modules/VentasModule.tsx';
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
import { AuditoriaImagenesModule } from './modules/AuditoriaImagenesModule.tsx';
import { InformesModule } from './modules/InformesModule.tsx';

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
  const [globalOrigin, setGlobalOrigin] = useState<'all' | 'real' | 'simulado'>('all');
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
  const [twoFaError, setTwoFaError] = useState('');

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

  // 14 Numbered modules according to specifications
  const numberedModules = [
    { num: '1', id: 'resumen', label: 'Resumen General', icon: LayoutDashboard, perm: 'resumen.ver' },
    { num: '2', id: 'ventas', label: 'Ventas', icon: Receipt, perm: 'ventas.ver' },
    { num: '3', id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, perm: 'pedidos.ver' },
    { num: '4', id: 'inventario', label: 'Inventario y Stock', icon: Layers, perm: 'inventario.ver' },
    { num: '5', id: 'productos', label: 'Catálogo de Prendas', icon: Package, perm: 'productos.ver' },
    { num: '6', id: 'clientes', label: 'Clientes y Recurrencia', icon: Users, perm: 'clientes.ver' },
    { num: '7', id: 'marketing', label: 'Promociones', icon: Tag, perm: 'marketing.ver' },
    { num: '8', id: 'analitica', label: 'Analítica y Proyecciones', icon: TrendingUp, perm: 'analitica.ver' },
    { num: '9', id: 'bigdata', label: 'Inteligencia de Mercado y Big Data', icon: BarChart3, perm: 'bigdata.ver' },
    { num: '10', id: 'asistente', label: 'Asistente IA (Movi)', icon: Bot, perm: 'asistente.ver' },
    { num: '11', id: 'imagenes', label: 'Auditoría de Imágenes', icon: ImageIcon, perm: 'imagenes.ver' },
    { num: '12', id: 'informes', label: 'Informes Descargables', icon: FileSpreadsheet, perm: 'informes.ver' },
    { num: '13', id: 'usuarios', label: 'Usuarios y Permisos', icon: Key, perm: 'usuarios.ver' },
    { num: '14', id: 'configuracion', label: 'Configuración', icon: Settings, perm: 'configuracion.ver' },
  ];

  // Additional operational group at the bottom
  const operacionModules = [
    { id: 'devoluciones', label: 'Devoluciones y Retractos', icon: RotateCcw, perm: 'devoluciones.ver' },
    { id: 'categorias', label: 'Categorías del Catálogo', icon: Tag, perm: 'categorias.ver' },
    { id: 'atencion', label: 'Atención al cliente (PQRS y contacto)', icon: Inbox, perm: 'atencion.ver' },
    { id: 'contenido', label: 'Páginas y contenido', icon: FileText, perm: 'contenido.ver' },
    { id: 'envios', label: 'Envíos', icon: Truck, perm: 'envios.ver' },
    { id: 'auditoria', label: 'Auditoría y seguridad', icon: Shield, perm: 'auditoria.ver' },
    { id: 'finanzas', label: 'Ventas e IVA 19 %', icon: Receipt, perm: 'finanzas.ver' },
  ];

  // RBAC Filtering: each item only appears if role has permission
  const visibleNumbered = numberedModules.filter(item => hasPermission(userPerms, item.perm, userRole));
  const visibleOperacion = operacionModules.filter(item => hasPermission(userPerms, item.perm, userRole));

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
    setTwoFaError('');
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
          setTwoFaError('');
        }, 2000);
      } else {
        const err = await res.json().catch(() => ({}));
        setTwoFaError(err.error || 'Código incorrecto o expirado.');
      }
    } catch (err) {
      console.error(err);
      setTwoFaError('Error de conexión al verificar el código.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-800">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Platform Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] text-white flex items-center justify-center font-black text-sm shadow-md border border-slate-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#7656D6]">M</span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-sm block leading-tight">
                  MoviFashion Analytics & Control
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Plataforma Central Corporativa
                </span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full font-black text-[9px] tracking-wider uppercase bg-[#7656D6]/10 text-[#7656D6] border border-[#7656D6]/30">
                PANEL ADMINISTRATIVO
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Origin Context Banner */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {globalOrigin === 'real'
                ? 'Solo datos reales en vivo (sin simulación)'
                : globalOrigin === 'simulado'
                ? 'Datos simulados con fines académicos (Colección 2026)'
                : 'Prioridad datos reales (respaldo simulado si no hay reales)'}
            </span>
          </div>

          {/* Global Origin Filter Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setGlobalOrigin('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                globalOrigin === 'all'
                  ? 'bg-white shadow-xs text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setGlobalOrigin('real')}
              className={`px-2.5 py-1 rounded-lg transition ${
                globalOrigin === 'real'
                  ? 'bg-white shadow-xs text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Real
            </button>
            <button
              type="button"
              onClick={() => setGlobalOrigin('simulado')}
              className={`px-2.5 py-1 rounded-lg transition ${
                globalOrigin === 'simulado'
                  ? 'bg-white shadow-xs text-purple-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Simulado
            </button>
          </div>

          {/* Spotlight Search (Ctrl + K) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-xs border border-slate-200 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px] lg:max-w-none">Buscar órdenes, prendas, clientes...</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 ml-1">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition"
              title="Notificaciones del sistema"
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
                  <span className="text-[10px] text-slate-400 font-mono">Sondeo 30s</span>
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

          {/* Session Email & Role */}
          <div className="hidden lg:flex flex-col text-right pl-2 border-l border-slate-200">
            <span className="font-bold text-xs text-slate-800 truncate max-w-[180px]" title={currentUser.email}>
              {currentUser.email}
            </span>
            <span className="text-[10px] font-semibold text-[#7656D6] uppercase tracking-wider">
              {currentUser.name} · {userRole}
            </span>
          </div>

          {/* Button: Ir a la tienda */}
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs"
            title="Ver catálogo público de MoviFashion"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Ir a la tienda</span>
          </a>

          {/* Button: Cerrar sesión */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition shadow-xs"
            title="Finalizar sesión segura"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>

          {/* User profile dropdown trigger for 2FA */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#7656D6] text-white font-bold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-purple-200 transition"
              title="Ajustes de cuenta"
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
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
                  <span>Configurar 2FA</span>
                </button>

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

      {/* Main Body: Dark Navy Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dark Navy Blue Sidebar (#0B1120) */}
        <aside
          className={`bg-[#0B1120] text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 shadow-xl ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'}`}
        >
          {/* Scrollable Nav Items */}
          <div className="overflow-y-auto p-3 space-y-1 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Header category label */}
            {!isSidebarCollapsed && (
              <div className="px-2 pb-2 pt-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Módulos de Control
                </span>
              </div>
            )}

            {/* 14 Numbered modules */}
            {visibleNumbered.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  title={`${item.num}. ${item.label}`}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#7656D6] text-white shadow-lg shadow-purple-900/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span
                    className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.num}
                  </span>
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  {!isSidebarCollapsed && (
                    <span className="truncate text-left leading-tight">{item.label}</span>
                  )}
                </button>
              );
            })}

            {/* Operación y cumplimiento section */}
            {visibleOperacion.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-800/80">
                {!isSidebarCollapsed && (
                  <span className="px-2 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                    Operación y Cumplimiento
                  </span>
                )}
                {visibleOperacion.map(item => {
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
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#7656D6] text-white shadow-lg shadow-purple-900/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" />
                      {!isSidebarCollapsed && (
                        <span className="truncate text-left leading-tight">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom collapse toggle button */}
          <div className="p-3 border-t border-slate-800 hidden lg:block bg-[#070D18]">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isSidebarCollapsed ? 'Expandir barra' : 'Colapsar barra'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Module Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'resumen' && <ResumenModule origin={globalOrigin} onNavigateTab={tab => setActiveTab(tab)} />}
            {activeTab === 'ventas' && <VentasModule origin={globalOrigin} />}
            {activeTab === 'pedidos' && <PedidosModule orders={orders} origin={globalOrigin} onOrderUpdated={onRefreshData} />}
            {activeTab === 'devoluciones' && <DevolucionesModule />}
            {activeTab === 'inventario' && <InventarioModule origin={globalOrigin} onStockChanged={onRefreshData} />}
            {activeTab === 'productos' && (
              <ProductosModule
                products={products}
                categories={categories}
                userRole={userRole}
                onProductsChanged={onRefreshData}
              />
            )}
            {activeTab === 'categorias' && <CategoriasModule onCategoriesChanged={onRefreshData} />}
            {activeTab === 'clientes' && <ClientesModule userRole={userRole} origin={globalOrigin} />}
            {activeTab === 'marketing' && <MarketingModule origin={globalOrigin} />}
            {activeTab === 'analitica' && <AnaliticaModule defaultTab="forecast" origin={globalOrigin} />}
            {activeTab === 'bigdata' && <AnaliticaModule defaultTab="bigdata" origin={globalOrigin} />}
            {activeTab === 'asistente' && <AsistenteModule origin={globalOrigin} />}
            {activeTab === 'imagenes' && <AuditoriaImagenesModule />}
            {activeTab === 'informes' && <InformesModule />}
            {activeTab === 'usuarios' && <UsuariosModule currentUserId={currentUser.id} />}
            {activeTab === 'configuracion' && <ConfiguracionModule userRole={userRole} />}
            {activeTab === 'atencion' && <AtencionModule />}
            {activeTab === 'contenido' && <ContenidoModule />}
            {activeTab === 'envios' && <EnviosModule />}
            {activeTab === 'auditoria' && <AuditoriaModule />}
            {activeTab === 'finanzas' && <FinanzasModule origin={globalOrigin} />}
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

                {twoFaError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-center">
                    {twoFaError}
                  </div>
                )}

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
