import React from 'react';
import { Home, Compass, Sparkles, Heart, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: 'home' | 'catalog' | 'ai' | 'favorites' | 'profile') => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  favoritesCount,
}) => {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Explorar', icon: Compass },
    { id: 'ai', label: 'Asistente IA', icon: Sparkles, highlight: true },
    { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favoritesCount },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9E2FA] pb-safe">
      <div className="grid grid-cols-5 h-16 items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className="relative flex flex-col items-center justify-center min-h-[48px] w-full text-center transition-colors"
            >
              {item.highlight ? (
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-transform ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#7656D6] to-[#30234F] text-white shadow-md shadow-[#7656D6]/30 scale-105'
                      : 'bg-[#E9E2FA] text-[#7656D6]'
                  }`}
                >
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
              ) : (
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#7656D6]' : 'text-gray-400'
                    }`}
                  />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#7656D6] text-[9px] font-bold text-white px-0.5">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              )}
              
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#7656D6] font-bold' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
