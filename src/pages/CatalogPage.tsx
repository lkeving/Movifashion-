import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Product, ProductCategory, CartItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { EMPRESA } from '../config/empresa';
import { formatCOP } from '../utils/impuestos';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';

interface CatalogPageProps {
  products: Product[];
  categories: ProductCategory[];
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenProductDetail: (product: Product, colorName?: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  categories,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onOpenProductDetail,
}) => {
  const { categoria } = useParams<{ categoria?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoria || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(500000);

  useEffect(() => {
    if (categoria) {
      setSelectedCategory(categoria);
    }
  }, [categoria]);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  const filteredProducts = products.filter((p) => {
    const finalPrice = p.discountPrice || p.price;
    if (finalPrice > maxPrice) return false;
    if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCat && !matchBrand && !matchTags) return false;
    }
    return true;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  const categoryName = categories.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase())?.name || 'Todas las Prendas';

  return (
    <div className="space-y-8 animate-in fade-in">
      <Seo
        title={`${categoryName} — Catálogo Oficial`}
        description={`Explora el catálogo completo de ${categoryName} en ${EMPRESA.nombreComercial}. Precios con IVA del 19% liquidado y envíos gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)} en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
          ...(selectedCategory !== 'all' ? [{ name: categoryName, path: `/catalogo/${selectedCategory}` }] : []),
        ]}
      />

      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
            Colección Disponible
          </span>
          <h1 className="text-3xl font-extrabold text-[#30234F] tracking-tight">
            {categoryName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando <strong>{filteredProducts.length}</strong> prendas con precios en Pesos Colombianos (IVA 19% incluido).
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-500 font-medium">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#7656D6]"
          >
            <option value="popular">Más valoradas</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="rating">Mayor calificación</option>
          </select>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => {
              setSelectedCategory('all');
              navigate('/catalogo');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#30234F] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                navigate(`/catalogo/${cat.id}`);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
                selectedCategory.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-[#30234F] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.name} ({cat.itemCount})
            </button>
          ))}
        </div>

        {/* Search, Brand and Price Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
          
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Búsqueda de prendas
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, material o silueta..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7656D6]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Marca o Línea
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
            >
              <option value="all">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Presupuesto máximo
              </label>
              <span className="font-mono font-bold text-slate-800 text-[11px]">
                {formatCOP(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="500000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#7656D6] cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <p className="text-base font-bold text-[#30234F]">No encontramos prendas que coincidan</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta ajustando el rango de precio, cambiando la categoría o borrando el término de búsqueda.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSearchQuery('');
              setMaxPrice(500000);
              navigate('/catalogo');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#7656D6] text-white text-xs font-semibold hover:bg-[#6344be] transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
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
      )}

    </div>
  );
};
