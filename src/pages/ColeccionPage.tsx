import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { Seo } from '../components/Seo.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { formatCOP } from '../utils/impuestos.ts';
import { EMPRESA } from '../config/empresa.ts';
import { Sparkles, Layers, ShoppingBag, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ColeccionPageProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
}

export const ColeccionPage: React.FC<ColeccionPageProps> = ({
  products,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [bundleAdded, setBundleAdded] = useState(false);

  // Seleccionamos las prendas de la nueva colección (primeras 8 o con tags recientes)
  const coleccionProducts = products.slice(0, 12);

  // Bundle destacado "Look Urbano Modular"
  const bundleItems = [products[0], products[1], products[2]].filter(Boolean);
  const bundleTotal = bundleItems.reduce((acc, p) => acc + (p.discountPrice || p.price), 0);
  const bundleDiscounted = Math.round(bundleTotal * 0.85); // 15% descuento en combo

  const handleAddBundle = () => {
    bundleItems.forEach((p, idx) => {
      onAddToCart({
        id: `bundle-${p.id}-${Date.now()}-${idx}`,
        product: p,
        selectedSize: p.sizes[0] || 'M',
        selectedColor: p.colors[0] || { name: 'Estándar', hex: '#25232B' },
        quantity: 1,
      });
    });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Nueva Colección Temporada 2026 — Edición Urbana Modular"
        description={`Descubre la nueva colección contemporánea de ${EMPRESA.nombreComercial}. Prendas urbanas, siluetas modulares y calce impecable con envío nacional en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Nueva Colección', path: '/nueva-coleccion' },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Editorial Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-[#241E33] text-white p-8 sm:p-14 shadow-lg border border-purple-950/40">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-[#C7B5F8] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Lanzamiento Oficial 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Cápsula Urbana Modular
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Inspirada en el dinamismo arquitectónico de Bogotá y Medellín: tejidos de alta resistencia, siluetas cómodas y paleta neutra que se adapta sin esfuerzo de la oficina a la noche.
            </p>
          </div>
        </div>

        {/* Curated Look Bundle "Comprar el Look Completo" */}
        {bundleItems.length >= 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
                  Combo Curado por Estilistas
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#30234F]">
                  Look Completo: Chaqueta + Pantalón + Calzado
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lleva el conjunto armónico con 15% de descuento especial y envío gratis garantizado.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 line-through tabular-nums">
                    {formatCOP(bundleTotal)}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#7656D6] tabular-nums">
                    {formatCOP(bundleDiscounted)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase">
                    Ahorras {formatCOP(bundleTotal - bundleDiscounted)}
                  </div>
                </div>

                <button
                  onClick={handleAddBundle}
                  className="px-6 py-3 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{bundleAdded ? '¡Look Agregado!' : 'Comprar el Look Completo'}</span>
                </button>
              </div>
            </div>

            {/* Bundle Items Mini-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bundleItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/producto/${item.id}`)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FBFBFE] border border-slate-100 hover:border-purple-200 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">{item.category}</span>
                    <h4 className="text-xs font-bold text-[#30234F] truncate">{item.name}</h4>
                    <span className="text-xs font-extrabold text-[#7656D6] tabular-nums">{formatCOP(item.discountPrice || item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            {bundleAdded && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Las 3 prendas del look fueron agregadas a tu carrito con éxito.</span>
              </div>
            )}
          </div>
        )}

        {/* Collection Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
                Catálogo Exclusivo
              </span>
              <h2 className="text-2xl font-bold text-[#30234F]">
                Prendas de la Colección
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {coleccionProducts.length} prendas seleccionadas
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {coleccionProducts.map((p) => (
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
    </div>
  );
};
