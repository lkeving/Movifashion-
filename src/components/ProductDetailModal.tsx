import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';
import { Product, CartItem } from '../types';
import { SafeProductImage } from './SafeProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  initialColorName?: string;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  catalog: Product[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialColorName,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  catalog,
}) => {
  if (!product) return null;

  // Filter to colors that have actual photos
  const availableColors = (product.colors || []).filter(
    (c) => Boolean(product.colorImages?.[c.name]?.length) || (product.colors && product.colors.length <= 1)
  );

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Única');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    availableColors.find(c => c.name === initialColorName) || availableColors[0] || product.colors[0] || { name: 'Estándar', hex: '#25232B' }
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'Única');
      const filtered = (product.colors || []).filter(
        (c) => Boolean(product.colorImages?.[c.name]?.length) || (product.colors && product.colors.length <= 1)
      );
      const initial = filtered.find(c => c.name === initialColorName) || filtered[0] || product.colors[0] || { name: 'Estándar', hex: '#25232B' };
      setSelectedColor(initial);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product, initialColorName]);

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  // Active images based on selected color
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

  // Complementary products (Completa tu outfit)
  const complementaryProducts = catalog
    .filter(p => p.id !== product.id && p.category !== product.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery / Image View */}
          <div className="relative bg-[#EDEDF0] p-6 flex flex-col justify-between">
            <div>
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-xs">
                <SafeProductImage
                  src={mainImage}
                  fallbackSrc={product.images[0] || '/images/hero_fashion_editorial.jpg'}
                  alt={`${product.name} - ${selectedColor.name}`}
                  productName={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnails of available color images */}
              {colorImages.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {colorImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#7656D6] ring-1 ring-[#7656D6]' : 'border-transparent opacity-70 hover:opacity-100'
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
            </div>

            {/* Badges / Guarantees */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-600">
              <div className="p-2 rounded-xl bg-white border border-gray-100 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#7656D6] mb-1" />
                <span>Envío asegurado</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-gray-100 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#7656D6] mb-1" />
                <span>Cambios gratis</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-gray-100 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-[#7656D6] mb-1" />
                <span>Garantía MOVI</span>
              </div>
            </div>
          </div>

          {/* Product Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase font-bold tracking-wider text-[#7656D6]">
                  {product.brand} · {product.category}
                </div>
                <button
                  onClick={() => onToggleFavorite(product)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                  aria-label="Favorito"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Title */}
              <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#30234F] leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-gray-800">{product.rating}</span>
                </div>
                <span>·</span>
                <span>{product.reviewCount} valoraciones de clientes</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">En stock ({product.inventory} unidades)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#30234F] tabular-nums">
                  ${currentPrice.toLocaleString('es-CO')} COP
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through tabular-nums">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Color: <span className="text-[#30234F] font-bold">{selectedColor.name}</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color);
                          setActiveImageIndex(0);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedColor.name === color.name
                            ? 'border-[#7656D6] scale-110 shadow-sm ring-2 ring-[#E9E2FA]'
                            : 'border-gray-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Talla: <span className="text-[#30234F] font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#30234F] text-white border-[#30234F]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Feature bullets */}
              {product.features && (
                <div className="mt-4 space-y-1">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7656D6]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-gray-200 rounded-xl px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 text-gray-500 hover:text-black font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 text-xs font-bold tabular-nums text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="px-2 py-1 text-gray-500 hover:text-black font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al Carrito ({selectedColor.name})</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Section: Completa tu outfit */}
        {complementaryProducts.length > 0 && (
          <div className="p-6 bg-[#F5F5F8]/50 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#30234F] mb-3">
              Completa tu outfit · Recomendaciones IA
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {complementaryProducts.map((comp) => {
                const compImg = comp.images[0];
                return (
                  <div
                    key={comp.id}
                    onClick={() => onSelectProduct(comp)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 hover:border-[#7656D6] cursor-pointer transition-all shadow-2xs"
                  >
                    <SafeProductImage
                      src={compImg}
                      fallbackSrc="/images/hero_fashion_editorial.jpg"
                      alt={comp.name}
                      productName={comp.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#25232B] truncate">{comp.name}</p>
                      <p className="text-[11px] font-bold text-[#7656D6] tabular-nums">
                        ${(comp.discountPrice || comp.price).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
