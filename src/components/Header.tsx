import React, { useState } from 'react';
import { Search, ShoppingBag, Sparkles, Camera, ShieldCheck, User as UserIcon, LogOut, ArrowRightLeft } from 'lucide-react';
import { User, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: User;
  currentRole: UserRole;
  onToggleRole: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenVisualSearch: () => void;
  onOpenAIAssistant: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: 'home' | 'catalog' | 'ai' | 'favorites' | 'profile' | 'admin') => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentRole,
  onToggleRole,
  cartCount,
  onOpenCart,
  onOpenVisualSearch,
  onOpenAIAssistant,
  onOpenAuth,
  onNavigate,
  currentView,
  searchQuery,
  onSearchChange,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E2FA]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(currentRole === 'admin' ? 'admin' : 'home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7656D6] to-[#30234F] flex items-center justify-center text-white font-black text-lg shadow-sm">
              M
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#30234F] group-hover:text-[#7656D6] transition-colors whitespace-nowrap">
                MOVIFASHION<span className="text-[#7656D6] ml-0.5">AI</span>
              </span>
              <p className="hidden md:block text-[10px] text-gray-500 font-medium tracking-tight -mt-1 whitespace-nowrap">
                Your style, intelligently connected
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Smart Search Input & Nav items */}
        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog' && e.target.value.trim().length > 0) {
                  onNavigate('catalog');
                }
              }}
              placeholder="Buscar por prenda, tenis, blazer, estilo o presupuesto..."
              className="w-full pl-10 pr-24 py-2 text-xs rounded-full bg-[#F5F5F8] border border-transparent focus:border-[#7656D6] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 text-[#25232B]"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={onOpenVisualSearch}
                className="p-1.5 rounded-full text-gray-500 hover:text-[#7656D6] hover:bg-white transition-colors"
                title="Búsqueda visual con imagen"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenAIAssistant}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#E9E2FA] text-[#7656D6] hover:bg-[#7656D6] hover:text-white text-[11px] font-semibold transition-all shadow-2xs"
                title="Abrir Asistente IA"
              >
                <Sparkles className="w-3 h-3" />
                <span>Asistente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zone 3: Actions, Role Toggle & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Role Switcher Pill (Instant testing for Admin vs Client) */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              currentRole === 'admin'
                ? 'bg-[#30234F] text-white border-[#30234F] shadow-xs'
                : 'bg-white text-[#7656D6] border-[#E9E2FA] hover:bg-[#E9E2FA]/50'
            }`}
            title="Cambiar entre vista de Cliente y Administrador"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Modo:</span>
            <span>{currentRole === 'admin' ? 'Admin' : 'Cliente'}</span>
          </button>

          {/* Visual Search mobile trigger */}
          <button
            onClick={onOpenVisualSearch}
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-[#F5F5F8] transition-colors"
            title="Búsqueda Visual"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Shopping Bag Button (Cart) */}
          {currentRole === 'cliente' && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full text-gray-700 hover:text-[#7656D6] hover:bg-[#E9E2FA]/40 transition-colors cursor-pointer"
              aria-label="Abrir Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#7656D6] px-1 text-[10px] font-extrabold text-white tabular-nums animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-[#E9E2FA] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#E9E2FA] text-[#7656D6] flex items-center justify-center font-bold text-xs overflow-hidden border border-[#7656D6]/20">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#30234F] truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#E9E2FA] text-[#7656D6]">
                    Rol: {user.role}
                  </span>
                </div>

                <div className="py-1">
                  {currentRole === 'cliente' ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-[#F5F5F8] flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span>Mi Perfil & Preferencias</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('favorites');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-[#F5F5F8] flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                        <span>Mis Favoritos</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-[#F5F5F8] flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7656D6]" />
                      <span>Panel de Administración</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cambiar / Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
