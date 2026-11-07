// Global Search Modal (Ctrl + K Spotlight Search)
// Searches across orders, products, customers, and PQRS

import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Users, Package, FileText, ArrowRight, X } from 'lucide-react';
import { Product, Order } from '../../types/index.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onSelectProduct?: (p: Product) => void;
  onSelectOrder?: (o: Order) => void;
  onNavigateTab?: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onSelectProduct,
  onSelectOrder,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.userName.toLowerCase().includes(q) ||
          o.userEmail.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchedProducts = q
    ? products.filter(
        p =>
          !p.deletedAt &&
          (p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7656D6]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar pedidos (ORD-...), productos, clientes, PQRS... (Esc para salir)"
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-slate-100">
          {!q ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-600 mb-1">Búsqueda rápida en todo el sistema</p>
              <p>Escribe el ID de un pedido, nombre de prenda, correo de cliente o número de radicado.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] text-slate-600">Ej: ORD-9842</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] text-slate-600">Ej: Chaqueta Bomber</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] text-slate-600">Ej: Zapatos</span>
              </div>
            </div>
          ) : matchedOrders.length === 0 && matchedProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No se encontraron coincidencias para &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Orders */}
              {matchedOrders.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Pedidos ({matchedOrders.length})
                  </span>
                  <div className="space-y-1">
                    {matchedOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          onSelectOrder?.(o);
                          onNavigateTab?.('pedidos');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-[#7656D6]" />
                          <div>
                            <span className="font-bold text-slate-800">{o.id}</span>
                            <span className="text-slate-400 ml-2">{o.userName} ({o.userEmail})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">${o.total.toLocaleString('es-CO')} COP</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {o.status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Productos ({matchedProducts.length})
                  </span>
                  <div className="space-y-1">
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct?.(p);
                          onNavigateTab?.('productos');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-slate-800">{p.name}</span>
                            <span className="text-slate-400 ml-2">[{p.category}]</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">${p.price.toLocaleString('es-CO')} COP</span>
                          <span className="text-slate-400">Stock: {p.inventory}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navega con flechas y presiona Enter</span>
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">ESC</kbd> para cerrar</span>
        </div>
      </div>
    </div>
  );
};
