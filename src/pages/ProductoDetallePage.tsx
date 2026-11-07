import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, CartItem } from '../types';
import { Seo } from '../components/Seo.tsx';
import { SafeProductImage } from '../components/SafeProductImage.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP, calcularBaseGravable, calcularIva } from '../utils/impuestos.ts';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  Share2,
  Ruler
} from 'lucide-react';

interface ProductoDetallePageProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
}

export const ProductoDetallePage: React.FC<ProductoDetallePageProps> = ({
  products,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Buscar por slug o por ID
  const product = products.find(p => p.id === slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);

  const availableColors = (product?.colors || []).filter(
    (c) => Boolean(product?.colorImages?.[c.name]?.length) || (product?.colors && product.colors.length <= 1)
  );

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({ name: 'Estándar', hex: '#25232B' });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'Única');
      const filtered = (product.colors || []).filter(
        (c) => Boolean(product.colorImages?.[c.name]?.length) || (product.colors && product.colors.length <= 1)
      );
      setSelectedColor(filtered[0] || product.colors[0] || { name: 'Estándar', hex: '#25232B' });
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#F5F5F8]">
        <h2 className="text-2xl font-bold text-[#30234F] mb-2">Prenda no encontrada</h2>
        <p className="text-xs text-slate-500 mb-6">El producto que buscas ya no está en catálogo o el enlace es incorrecto.</p>
        <Link
          to="/catalogo"
          className="px-5 py-2.5 bg-[#7656D6] text-white text-xs font-semibold rounded-xl hover:bg-[#6344be] transition-colors"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  const colorImages =
    (selectedColor && product.colorImages?.[selectedColor.name]) ||
    product.images ||
    ['/images/hero_fashion_editorial.jpg'];

  const mainImage = colorImages[activeImageIndex] || colorImages[0] || product.images[0];

  const handleAdd = () => {
    onAddToCart({
      id: `${product.id}-${selectedSize}-${selectedColor.name}-${Date.now()}`,
      product,
      selectedSize,
      selectedColor,
      quantity,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const complementaryProducts = products
    .filter(p => p.id !== product.id && p.category !== product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-8 px-4 sm:px-6 lg:px-8">
      <Seo
        title={`${product.name} — Moda Contemporánea`}
        description={`${product.description}. Precio: ${formatCOP(currentPrice)} con IVA 19% incluido en Colombia. Envíos nacionales.`}
        type="product"
        product={product}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
          { name: product.category, path: `/catalogo/${product.category.toLowerCase()}` },
          { name: product.name, path: `/producto/${product.id}` },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-slate-900 transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to="/catalogo" className="hover:text-slate-900 transition-colors">Catálogo</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to={`/catalogo/${product.category.toLowerCase()}`} className="hover:text-slate-900 transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{product.name}</span>
        </nav>

        {/* Contiguous PDP Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Gallery View (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#EDEDF0] shadow-xs relative">
              <SafeProductImage
                src={mainImage}
                fallbackSrc={product.images[0] || '/images/hero_fashion_editorial.jpg'}
                alt={`${product.name} - ${selectedColor.name}`}
                productName={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {hasDiscount && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-[#7656D6] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  Oferta
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {colorImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {colorImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#7656D6] ring-1 ring-[#7656D6]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeProductImage
                      src={img}
                      fallbackSrc={product.images[0]}
                      alt=""
                      productName={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Value Props Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#7656D6] mb-1" />
                <span className="font-semibold text-slate-800">Envío Gratis</span>
                <span className="text-[10px] text-slate-500">desde {formatCOP(EMPRESA.umbralEnvioGratis)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#7656D6] mb-1" />
                <span className="font-semibold text-slate-800">30 Días</span>
                <span className="text-[10px] text-slate-500">para cambios</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-[#7656D6] mb-1" />
                <span className="font-semibold text-slate-800">Garantía Real</span>
                <span className="text-[10px] text-slate-500">{EMPRESA.diasGarantiaLegal} días de respaldo</span>
              </div>
            </div>
          </div>

          {/* Sticky Purchase Module (Right) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[#7656D6]">
                  {product.brand} · {product.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Compartir prenda"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleFavorite(product)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                    title="Guardar en favoritos"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {copiedLink && (
                <div className="text-[11px] text-emerald-600 font-medium">¡Enlace copiado al portapapeles!</div>
              )}

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#30234F] leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-slate-800">{product.rating}</span>
                </div>
                <span>·</span>
                <span>{product.reviewCount} calificaciones verificadas</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">
                  {product.inventory > 0 ? `Disponible (${product.inventory} un.)` : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Price & Colombian Tax Disclosure */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#30234F] tabular-nums">
                  {formatCOP(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatCOP(product.price)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 leading-snug">
                <span>Precio final con IVA 19% incluido en Colombia.</span><br />
                <span className="text-slate-500">
                  Base gravable: <strong>{formatCOP(calcularBaseGravable(currentPrice))}</strong> · IVA liquidado: <strong>{formatCOP(calcularIva(currentPrice))}</strong>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Color: <span className="text-[#7656D6] font-extrabold">{selectedColor.name}</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImageIndex(0);
                      }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor.name === color.name
                          ? 'border-[#7656D6] scale-110 shadow-sm ring-2 ring-[#E9E2FA]'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Talla: <span className="text-[#7656D6] font-extrabold">{selectedSize}</span>
                </label>
                <Link
                  to="/guia-de-tallas"
                  className="inline-flex items-center gap-1 text-[11px] text-[#7656D6] hover:underline font-semibold"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Guía de medidas</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#30234F] text-white border-[#30234F] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs tabular-nums text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.inventory <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white font-bold text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedNotice ? '¡Agregado a la Bolsa!' : 'Agregar a la Bolsa'}</span>
                </button>
              </div>

              {addedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Prenda agregada a tu carrito exitosamente.</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Completa tu outfit (Recommendations) */}
        {complementaryProducts.length > 0 && (
          <div className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6]">
                  Lookbook Sugerido
                </span>
                <h2 className="text-xl font-bold text-[#30234F]">
                  Completa tu Outfit
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {complementaryProducts.map((comp) => (
                <ProductCard
                  key={comp.id}
                  product={comp}
                  onSelect={(p) => navigate(`/producto/${p.id}`)}
                  onAddToCart={(p, size, col) => {
                    onAddToCart({
                      id: `${p.id}-${Date.now()}`,
                      product: p,
                      selectedSize: size || p.sizes[0],
                      selectedColor: col || p.colors[0],
                      quantity: 1,
                    });
                  }}
                  isFavorite={favorites.includes(comp.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
