import React, { useState } from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product, colorName?: string) => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; hex: string }) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.colors[0] || { name: 'Estándar', hex: '#25232B' }
  );

  const activeImage =
    (selectedColor && product.colorImages?.[selectedColor.name]?.[0]) ||
    product.images[0] ||
    '/images/hero_fashion_editorial.jpg';

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      
      {/* Product Image Container */}
      <div
        onClick={() => onSelect(product, selectedColor.name)}
        className="relative aspect-4/3 sm:aspect-square w-full bg-[#F5F5F8] overflow-hidden cursor-pointer"
      >
        <img
          src={activeImage}
          alt={`${product.name} - ${selectedColor.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-white text-red-500 shadow-sm'
              : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
          }`}
          aria-label="Guardar en favoritos"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Discount / Tag label */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm bg-[#7656D6] text-white text-[10px] font-bold tracking-wider uppercase">
            Oferta
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        
        {/* Brand & Category Clean Metadata */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          <span>{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{product.category}</span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelect(product, selectedColor.name)}
          className="mt-1 text-sm sm:text-base font-semibold text-[#25232B] line-clamp-1 hover:text-[#7656D6] cursor-pointer transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating and Reviews */}
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-800">{product.rating}</span>
          <span className="text-[11px]">({product.reviewCount})</span>
        </div>

        {/* Color swatches preview */}
        {product.colors && product.colors.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onMouseEnter={() => setSelectedColor(c)}
                onClick={() => setSelectedColor(c)}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColor.name === c.name
                    ? 'ring-2 ring-[#7656D6] ring-offset-1 scale-110 border-white'
                    : 'border-gray-300 hover:scale-105 opacity-80'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1 truncate max-w-[100px]">
              {selectedColor.name}
            </span>
          </div>
        )}

        {/* Price and Add CTA */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-[#30234F] tabular-nums">
              ${currentPrice.toLocaleString('es-CO')}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through tabular-nums -mt-0.5">
                ${product.price.toLocaleString('es-CO')}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product, undefined, selectedColor)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E9E2FA] text-[#7656D6] hover:bg-[#7656D6] hover:text-white transition-all text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
            title="Agregar al carrito"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>

      </div>

    </div>
  );
};
