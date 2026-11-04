import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
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
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      
      {/* Product Image Container */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 sm:aspect-square w-full bg-[#F5F5F8] overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Resilient fallback if any image network issues occur
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
          onClick={() => onSelect(product)}
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
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E9E2FA] text-[#7656D6] hover:bg-[#7656D6] hover:text-white transition-all text-xs font-semibold shadow-2xs active:scale-95"
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
