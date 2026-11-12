import React from 'react';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';
import { Order } from '../types';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP, calcularBaseGravable, calcularIva } from '../utils/impuestos.ts';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const baseGravable = order.subtotal ? calcularBaseGravable(order.subtotal) : calcularBaseGravable(order.total - (order.shipping || 0));
  const valorIva = order.subtotal ? calcularIva(order.subtotal) : (order.total - (order.shipping || 0) - baseGravable);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 print:p-0 print:border-none print:shadow-none">
        
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-2.5 py-1 rounded-md">
              Comprobante de Compra
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30234F] hover:bg-[#7656D6] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="space-y-6 text-slate-800 text-xs sm:text-sm">
          
          {/* Company & Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-[#30234F] text-white font-black flex items-center justify-center text-sm">
                  M
                </div>
                <span className="font-extrabold text-base tracking-tight text-[#30234F]">
                  MOVIFASHION
                </span>
              </div>
              <p className="font-bold text-xs text-slate-700">{EMPRESA.razonSocial}</p>
              <p className="text-[11px] text-slate-500">NIT: {EMPRESA.nit}</p>
              <p className="text-[11px] text-slate-500">{EMPRESA.direccion} · {EMPRESA.ciudad}, Colombia</p>
              <p className="text-[11px] text-slate-500">Tel: {EMPRESA.telefono} · {EMPRESA.correoContacto}</p>
            </div>

            <div className="sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                COMPROBANTE EQUIVALENTE
              </span>
              <span className="font-mono font-black text-sm text-[#30234F] block">
                {order.id}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Fecha: {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Estado: {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <strong className="block text-slate-900 mb-1">Datos del Cliente:</strong>
              <p className="text-slate-700 font-semibold">{order.customer?.name || order.userName || 'Cliente MoviFashion'}</p>
              <p className="text-slate-500">{order.customer?.email || order.userEmail || '—'}</p>
              {order.customer?.phone && <p className="text-slate-500">Tel: {order.customer.phone}</p>}
              {order.customer?.documentId && (
                <p className="text-slate-500">Doc: {order.customer.documentId}</p>
              )}
            </div>

            <div>
              <strong className="block text-slate-900 mb-1">Destino de Entrega:</strong>
              <p className="text-slate-700">{order.customer?.address || order.shippingAddress?.street || order.shippingAddress?.address || 'Dirección registrada'}</p>
              <p className="text-slate-500">{order.customer?.city || order.shippingAddress?.city || 'Colombia'}, Colombia</p>
              <p className="text-slate-500 mt-1">
                Método de pago:{' '}
                <strong className="text-slate-700">
                  {order.paymentMethod === 'cash_on_delivery'
                    ? 'Contraentrega'
                    : order.paymentMethod === 'bank_transfer'
                      ? 'Cuenta bancaria / transferencia simulada'
                      : order.paymentMethod === 'pse'
                        ? 'PSE (Transferencia en línea)'
                        : 'Tarjeta de Crédito'}
                </strong>
              </p>
              {order.trackingNumber && (
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  Guía: <strong>{order.trackingNumber}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">Prenda / Concepto</th>
                  <th className="py-2.5 px-2 text-center">Talla</th>
                  <th className="py-2.5 px-2 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit. (IVA inc.)</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">Color: {item.selectedColor.name}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">{item.selectedSize}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      {formatCOP(item.product.discountPrice || item.product.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCOP((item.product.discountPrice || item.product.price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Accounting and Tax Totals Breakdown */}
          <div className="border-t border-slate-200 pt-3 flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Base Gravable):</span>
                <span className="tabular-nums font-mono">{formatCOP(baseGravable)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA Liquidado (19%):</span>
                <span className="tabular-nums font-mono">{formatCOP(valorIva)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de Envío:</span>
                <span className="tabular-nums font-mono">
                  {order.shipping > 0 ? formatCOP(order.shipping) : 'GRATIS'}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento aplicado:</span>
                  <span className="tabular-nums font-mono">-{formatCOP(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#30234F] pt-2 border-t border-slate-200">
                <span>TOTAL PAGADO:</span>
                <span className="tabular-nums">{formatCOP(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Legal Footnote */}
          <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 text-center leading-relaxed">
            <p>
              Documento equivalente a comprobante de pedido comercial. Operado por {EMPRESA.razonSocial} · NIT: {EMPRESA.nit}.
            </p>
            <p>
              Para garantías o cambios, comunícate a {EMPRESA.correoContacto} o a la línea {EMPRESA.telefono} citando el número de orden {order.id}.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
