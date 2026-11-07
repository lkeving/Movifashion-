import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { Seo } from '../components/Seo.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';
import { Percent, Tag, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DescuentosPageProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
}

export const DescuentosPage: React.FC<DescuentosPageProps> = ({
  products,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'mayor_ahorro' | 'menor_precio'>('mayor_ahorro');

  // Filtrar productos con descuento real
  const discounted = products.filter(p => !!p.discountPrice && p.discountPrice < p.price);

  discounted.sort((a, b) => {
    const ahorroA = a.price - (a.discountPrice || a.price);
    const ahorroB = b.price - (b.discountPrice || b.price);
    if (sortOrder === 'mayor_ahorro') return ahorroB - ahorroA;
    return (a.discountPrice || a.price) - (b.discountPrice || b.price);
  });

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Prendas con Descuento y Ofertas Exclusivas"
        description={`Aprovecha descuentos directos en prendas seleccionadas de ${EMPRESA.nombreComercial}. Precios con IVA liquidado y envíos gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)} en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Descuentos', path: '/descuentos' },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-900 to-[#30234F] text-white p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 text-xs font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              Oportunidades de Temporada
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Prendas con Descuento Especial
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Prendas de alta calidad con rebajas de hasta el 35%. Todos los precios incluyen IVA del 19% liquidado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-rose-200 font-bold block">Prendas en Promoción</span>
            <span className="text-3xl font-black font-mono">{discounted.length}</span>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            Mostrando <strong>{discounted.length}</strong> prendas con descuento
          </span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Ordenar por:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#7656D6]"
            >
              <option value="mayor_ahorro">Mayor ahorro en Pesos</option>
              <option value="menor_precio">Menor precio primero</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {discounted.map((p) => (
            <ProductCard
              key={p.id}
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
          ))}
        </div>

      </div>
    </div>
  );
};
