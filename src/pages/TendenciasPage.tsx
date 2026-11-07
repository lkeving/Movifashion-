import React, { useState } from 'react';
import { Product, CartItem, ProductCategory } from '../types';
import { Seo } from '../components/Seo.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Flame, Star, TrendingUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TendenciasPageProps {
  products: Product[];
  categories: ProductCategory[];
  onAddToCart: (item: CartItem) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
}

export const TendenciasPage: React.FC<TendenciasPageProps> = ({
  products,
  categories,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Ordenar por rating y reviewCount
  const sorted = [...products].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating));

  const filtered = selectedCat === 'all'
    ? sorted
    : sorted.filter(p => p.category.toLowerCase() === selectedCat.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Tendencias & Más Vendidos en Colombia"
        description={`Las prendas más populares y mejor calificadas de ${EMPRESA.nombreComercial}. Opiniones verificadas, envío a toda Colombia y precios con IVA incluido.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Tendencias', path: '/tendencias' },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Top Selecciones de Clientes
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Tendencias & Prendas Destacadas
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            El ranking en tiempo real de las prendas con mayores valoraciones y demanda esta semana en Colombia.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedCat === 'all'
                ? 'bg-[#30234F] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            Todas las Tendencias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                selectedCat === cat.id
                  ? 'bg-[#30234F] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid with Ranking Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p, idx) => (
            <div key={p.id} className="relative">
              {idx < 3 && selectedCat === 'all' && (
                <div className="absolute -top-2.5 -left-2.5 z-20 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  #{idx + 1}
                </div>
              )}
              <ProductCard
                product={p}
                onSelect={(prod) => navigate(`/producto/${prod.id}`)}
                onAddToCart={(prod, size, col) => {
                  onAddToCart({
                    id: `${prod.id}-${Date.now()}`,
                    product: prod,
                    selectedSize: size || prod.sizes[0],
                    selectedColor: col || prod.colors[0],
                    quantity: 1,
                  });
                }}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
