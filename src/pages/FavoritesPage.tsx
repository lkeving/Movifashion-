import React from 'react';
import { Product, CartItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { EMPRESA } from '../config/empresa';
import { Heart, Layers, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FavoritesPageProps {
  products: Product[];
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenProductDetail: (product: Product, colorName?: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onOpenProductDetail,
}) => {
  const navigate = useNavigate();
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="space-y-8 animate-in fade-in py-4">
      <Seo
        title={`Mis Favoritos (${favoriteProducts.length})`}
        description={`Consulta las prendas y accesorios que has guardado en ${EMPRESA.nombreComercial}.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Favoritos', path: '/favoritos' },
        ]}
      />

      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
            Guardados Personalizados
          </span>
          <h1 className="text-3xl font-extrabold text-[#30234F] tracking-tight">
            Mis Prendas Favoritas
          </h1>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          {favoriteProducts.length} guardadas
        </span>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#30234F]">No tienes prendas en favoritos</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Haz clic en el corazón de cualquier prenda del catálogo para guardarla y revisarla cuando quieras.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Explorar el Catálogo</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={(prod, color) => onOpenProductDetail(prod, color)}
              onAddToCart={(prod, size, col) => {
                onAddToCart({
                  id: `${prod.id}-${Date.now()}`,
                  product: prod,
                  selectedSize: size || prod.sizes[0],
                  selectedColor: col || prod.colors[0],
                  quantity: 1,
                });
              }}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
