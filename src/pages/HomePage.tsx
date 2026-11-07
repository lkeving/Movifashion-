import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Truck, ShieldCheck, RotateCcw, Percent, Flame } from 'lucide-react';
import { Product, ProductCategory, CartItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { HERO_BANNER_IMAGE } from '../data/mockProducts';
import { Seo } from '../components/Seo';
import { EMPRESA } from '../config/empresa';
import { formatCOP } from '../utils/impuestos';

interface HomePageProps {
  products: Product[];
  categories: ProductCategory[];
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenProductDetail: (product: Product, colorName?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onOpenProductDetail,
}) => {
  const navigate = useNavigate();

  // Featured and trending slices
  const featured = products.slice(0, 8);
  const trending = products.filter(p => p.rating >= 4.8).slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in">
      <Seo
        title="Inicio — Moda Urbana Inteligente"
        description="MoviFashion Colombia. Tienda oficial de moda, calzado y accesorios contemporáneos. Asesoría inteligente, envíos a todo el país y precios con IVA incluido."
        breadcrumbs={[{ name: 'Inicio', path: '/' }]}
      />

      {/* Storefront Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[#241E33] text-white shadow-xl min-h-[460px] flex items-center border border-purple-950/40">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Editorial MoviFashion Colombia"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-102"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#211832] via-[#211832]/85 to-transparent" />

        <div className="relative z-10 p-6 sm:p-14 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/30 text-xs font-semibold text-[#C7B5F8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección 2026 · Asesoría de Estilo Asistida</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Tu estilo, inteligentemente <span className="text-[#A282FA]">conectado</span>.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Prendas contemporáneas, siluetas modulares y calce impecable diseñadas para el dinamismo urbano de Colombia. Precios con IVA del 19% liquidado y despachos a todo el país.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/catalogo"
              className="px-6 py-3.5 rounded-xl bg-[#7656D6] hover:bg-white hover:text-[#30234F] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explorar el Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/asistente"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C7B5F8]" />
              <span>Consultar a Movi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-xs sm:text-sm text-slate-900 block font-bold">Envío Gratis Nacional</strong>
            <span className="text-[11px] text-slate-500">En compras desde {formatCOP(EMPRESA.umbralEnvioGratis)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-xs sm:text-sm text-slate-900 block font-bold">Cambios y Retracto</strong>
            <span className="text-[11px] text-slate-500">{EMPRESA.diasCambioComercial} días para cambios · {EMPRESA.diasRetractoLegal} días retracto</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-xs sm:text-sm text-slate-900 block font-bold">Garantía Legal</strong>
            <span className="text-[11px] text-slate-500">{EMPRESA.diasGarantiaLegal} días de respaldo por defectos</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
              Explora por Siluetas
            </span>
            <h2 className="text-2xl font-bold text-[#30234F]">
              Categorías de Temporada
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-xs font-semibold text-[#7656D6] hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo/${cat.id}`}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#7656D6] hover:shadow-sm transition-all text-center group flex flex-col items-center justify-center gap-1.5"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#7656D6] transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {cat.itemCount} prendas
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
              Selección Curada
            </span>
            <h2 className="text-2xl font-bold text-[#30234F]">
              Prendas Destacadas
            </h2>
          </div>
          <Link
            to="/nueva-coleccion"
            className="text-xs font-semibold text-[#7656D6] hover:underline flex items-center gap-1"
          >
            <span>Ver nueva colección</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
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
              isFavorite={favorites.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Editorial Craftsmanship Callout */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
            Manufactura & Compromiso
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#30234F] tracking-tight">
            Confección Nacional, Visión Global
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Cada chaqueta, cargo, camiseta y accesorio de MoviFashion se concibe como una inversión de larga vida en tu guardarropa. Fibras seleccionadas, hilos reforzados y costuras de alta resistencia que soportan el dinamismo urbano de nuestras ciudades.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/nosotros"
              className="px-5 py-2.5 rounded-xl bg-[#30234F] hover:bg-[#7656D6] text-white text-xs font-semibold transition-colors"
            >
              Conoce Nuestra Historia
            </Link>
            <Link
              to="/guia-de-tallas"
              className="px-4 py-2.5 rounded-xl bg-purple-50 text-[#7656D6] text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              Guía de Tallas
            </Link>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 relative">
          <img
            src="/images/products/chaqueta-bomber-tecnica-negro.jpg"
            alt="Confección MoviFashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/40 text-xs">
            <span className="font-bold text-slate-800 block">Prendas con respaldo total</span>
            <span className="text-[11px] text-slate-500">Garantía de satisfacción y pago contraentrega en toda Colombia.</span>
          </div>
        </div>
      </section>

    </div>
  );
};
