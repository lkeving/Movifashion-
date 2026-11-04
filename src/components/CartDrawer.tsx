import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const freeShippingThreshold = 200000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const shipping = subtotal > 0 && subtotal >= freeShippingThreshold ? 0 : subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7656D6]" />
            <h2 className="text-base font-bold text-[#30234F]">Tu Carrito de Compras</h2>
            <span className="text-xs text-gray-500">({items.length} prendas)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-[#E9E2FA]/40 px-4 py-3 border-b border-[#E9E2FA]/60 text-xs">
          <div className="flex items-center justify-between mb-1.5 text-gray-700">
            <div className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-[#7656D6]" />
              <span>
                {freeShippingRemaining === 0
                  ? '¡Felicitaciones! Tienes Envío Gratis'
                  : `Te faltan $${freeShippingRemaining.toLocaleString('es-CO')} para Envío Gratis`}
              </span>
            </div>
            <span className="font-bold tabular-nums text-[#7656D6]">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7656D6] to-[#30234F] rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Tu carrito está vacío</p>
              <p className="text-xs text-gray-500 mt-1">Explora nuestro catálogo y conecta con tu estilo.</p>
            </div>
          ) : (
            items.map((item) => {
              const price = item.product.discountPrice || item.product.price;
              const itemImg =
                (item.selectedColor && item.product.colorImages?.[item.selectedColor.name]?.[0]) ||
                item.product.images[0];
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl bg-[#F5F5F8]/70 border border-gray-100"
                >
                  <img
                    src={itemImg}
                    alt={`${item.product.name} - ${item.selectedColor.name}`}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#30234F] truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Talla: {item.selectedSize} · {item.selectedColor.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7656D6] tabular-nums">
                        ${price.toLocaleString('es-CO')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-0.5 text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-1 text-gray-500 hover:text-black font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-semibold tabular-nums text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-1 text-gray-500 hover:text-black font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                  ${subtotal.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                  {shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString('es-CO')} COP`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#30234F] pt-2 border-t border-gray-100">
                <span>Total Estimado</span>
                <span className="text-base tabular-nums text-[#7656D6]">
                  ${total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
