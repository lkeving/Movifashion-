import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Heart, 
  Menu, 
  X, 
  ChevronDown,
  Percent,
  Flame,
  Layers,
  HelpCircle,
  Phone
} from 'lucide-react';
import { User, ProductCategory } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { EMPRESA } from '../config/empresa.ts';

interface HeaderProps {
  user: User | null;
  cartCount: number;
  favoritesCount?: number;
  categories: ProductCategory[];
  onOpenCart: () => void;
  onOpenVisualSearch: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  cartCount,
  favoritesCount = 0,
  categories,
  onOpenCart,
  onOpenVisualSearch,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalogo');
    }
  };

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E2FA]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="h-16 flex items-center justify-between gap-4 md:gap-6">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-[#7656D6] rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7656D6] to-[#30234F] flex items-center justify-center text-white font-black text-lg shadow-sm">
                M
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#30234F] group-hover:text-[#7656D6] transition-colors whitespace-nowrap">
                  MOVIFASHION<span className="text-[#7656D6] ml-0.5">AI</span>
                </span>
                <p className="hidden xl:block text-[9px] text-slate-500 font-medium tracking-tight -mt-1 whitespace-nowrap">
                  {EMPRESA.lema}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-700">
            <Link
              to="/nueva-coleccion"
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/nueva-coleccion')
                  ? 'text-[#7656D6] bg-purple-50'
                  : 'hover:text-[#7656D6] hover:bg-slate-50'
              }`}
            >
              Nueva Colección
            </Link>

            <Link
              to="/tendencias"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/tendencias')
                  ? 'text-[#7656D6] bg-purple-50'
                  : 'hover:text-[#7656D6] hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Tendencias</span>
            </Link>

            <Link
              to="/descuentos"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/descuentos')
                  ? 'text-[#7656D6] bg-purple-50 font-bold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/60'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-[#7656D6]" />
              <span>Descuentos</span>
            </Link>

            {/* Categorías Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowCategoryMenu(true)}
              onMouseLeave={() => setShowCategoryMenu(false)}
            >
              <Link
                to="/catalogo"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isLinkActive('/catalogo')
                    ? 'text-[#7656D6] bg-purple-50'
                    : 'hover:text-[#7656D6] hover:bg-slate-50'
                }`}
              >
                <span>Catálogo</span>
                <ChevronDown className="w-3 h-3" />
              </Link>

              {showCategoryMenu && (
                <div className="absolute left-0 top-full pt-1.5 w-52 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                    <Link
                      to="/catalogo"
                      onClick={() => setShowCategoryMenu(false)}
                      className="block px-4 py-2 text-xs font-semibold text-[#7656D6] hover:bg-purple-50"
                    >
                      Ver todas las prendas
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/catalogo/${cat.id}`}
                        onClick={() => setShowCategoryMenu(false)}
                        className="block px-4 py-1.5 text-xs text-slate-600 hover:text-[#30234F] hover:bg-slate-50"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/asistente"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/asistente')
                  ? 'text-[#7656D6] bg-purple-50'
                  : 'hover:text-[#7656D6] hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7656D6]" />
              <span>Asistente Movi</span>
            </Link>

            <Link
              to="/nosotros"
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/nosotros')
                  ? 'text-[#7656D6] bg-purple-50'
                  : 'hover:text-[#7656D6] hover:bg-slate-50 text-slate-500'
              }`}
            >
              Nosotros
            </Link>

            <Link
              to="/contacto"
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isLinkActive('/contacto')
                  ? 'text-[#7656D6] bg-purple-50'
                  : 'hover:text-[#7656D6] hover:bg-slate-50 text-slate-500'
              }`}
            >
              Contacto
            </Link>
          </nav>

          {/* Zone 2: Smart Search Input */}
          <div className="flex-1 max-w-xs xl:max-w-sm hidden md:flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar prenda, silueta o color..."
                className="w-full pl-9 pr-14 py-2 text-xs rounded-full bg-[#F5F5F8] border border-transparent focus:border-[#7656D6] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
              <button
                type="button"
                onClick={onOpenVisualSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#7656D6] transition-colors"
                title="Búsqueda visual por imagen"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Zone 3: Actions & User Account */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Visual Search mobile trigger */}
            <button
              onClick={onOpenVisualSearch}
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-[#F5F5F8] transition-colors"
              title="Búsqueda visual"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Favorites Icon */}
            <Link
              to="/favoritos"
              className="relative p-2 rounded-full text-slate-700 hover:text-[#7656D6] hover:bg-purple-50 transition-colors"
              title="Mis Favoritos"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white tabular-nums">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag (Cart) */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full text-slate-700 hover:text-[#7656D6] hover:bg-purple-50 transition-colors cursor-pointer"
              aria-label="Abrir Carrito"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7656D6] px-1 text-[9px] font-bold text-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Menu or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#F5F5F8] transition-all cursor-pointer border border-[#E9E2FA]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#30234F] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left pr-1">
                    <span className="text-xs font-semibold text-[#25232B] leading-tight max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'text-[#7656D6]' : 'text-slate-500'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#30234F] truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        user.role === 'admin'
                          ? 'bg-[#30234F] text-white'
                          : 'bg-[#E9E2FA] text-[#7656D6]'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-xs text-[#30234F] font-semibold hover:bg-[#F5F5F8] flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#7656D6]" />
                          <span>Panel de Administración</span>
                        </Link>
                      )}

                      <Link
                        to="/cuenta"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-[#F5F5F8] flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mi Cuenta & Mis Pedidos</span>
                      </Link>

                      <Link
                        to="/favoritos"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-[#F5F5F8] flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mis Favoritos ({favoritesCount})</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar prendas..."
              className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-slate-100 border-none text-slate-800"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              to="/nueva-coleccion"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-purple-50 text-[#7656D6] font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nueva Colección</span>
            </Link>
            <Link
              to="/tendencias"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-amber-50 text-amber-800 font-semibold flex items-center gap-2"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Tendencias</span>
            </Link>
            <Link
              to="/descuentos"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold flex items-center gap-2"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Descuentos</span>
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold flex items-center gap-2"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <Link
              to="/asistente"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#7656D6]" />
                Asistente Virtual Movi
              </span>
            </Link>
            <Link
              to="/nosotros"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Quiénes Somos
            </Link>
            <Link
              to="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Contacto Directo
            </Link>
            <Link
              to="/pqrs"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Radicar / Consultar PQRS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
