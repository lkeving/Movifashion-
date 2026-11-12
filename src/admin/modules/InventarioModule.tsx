// Module 4: Inventario, Kardex & Análisis ABC (Pareto)
// Movement history, manual stock adjustments, inventory valuation, restock recommendations

import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { ProductVariant, InventoryMovement } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const InventarioModule: React.FC<{
  origin?: 'all' | 'real' | 'simulado';
  onStockChanged?: () => void;
}> = ({ origin = 'all', onStockChanged }) => {
  const [tab, setTab] = useState<'movements' | 'variants' | 'abc'>('variants');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [abcData, setAbcData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [actionError, setActionError] = useState('');

  // Adjust Form
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [adjustQuantity, setAdjustQuantity] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Ingreso de lote de producción nacional');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const [resVar, resMov, resAbc] = await Promise.all([
        authFetch(`/api/admin/inventory/variants?origin=${origin}`),
        authFetch(`/api/admin/inventory/movements?origin=${origin}`),
        authFetch(`/api/admin/inventory/abc-analysis?origin=${origin}`),
      ]);

      if (resVar.ok) setVariants(await resVar.json());
      if (resMov.ok) setMovements(await resMov.json());
      if (resAbc.ok) setAbcData(await resAbc.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [origin]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) return;
    setIsSubmitting(true);
    setActionError('');

    try {
      const res = await authFetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustProductId,
          tipo: adjustType,
          cantidad: Number(adjustQuantity),
          motivo: adjustReason,
        }),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        await fetchInventoryData();
        onStockChanged?.();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo registrar el ajuste en Kardex.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al registrar el ajuste.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Valuation summary
  const totalValuationCost = abcData.reduce((sum, item) => sum + (item.inventoryValue || 0), 0);
  const totalValuationSale = abcData.reduce((sum, item) => sum + (item.product.inventory * item.product.price), 0);
  const totalUnits = abcData.reduce((sum, item) => sum + (item.product.inventory || 0), 0);

  const variantColumns: Column<ProductVariant>[] = [
    {
      key: 'sku',
      header: 'SKU Variante',
      accessor: r => r.sku,
      render: r => <span className="font-mono font-bold text-slate-800 text-xs">{r.sku}</span>,
      sortable: true,
    },
    {
      key: 'size',
      header: 'Talla',
      accessor: r => r.size,
      render: r => <span className="font-bold text-slate-700">{r.size}</span>,
      align: 'center',
      sortable: true,
    },
    {
      key: 'color',
      header: 'Color',
      accessor: r => r.color,
      render: r => <span className="text-slate-600">{r.color}</span>,
    },
    {
      key: 'stock',
      header: 'Stock Actual',
      accessor: r => r.stock,
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            r.stock <= 2 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {r.stock} u.
        </span>
      ),
      align: 'center',
      sortable: true,
    },
  ];

  const movementColumns: Column<InventoryMovement>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      accessor: r => r.tipo,
      render: r => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.tipo === 'entrada' || r.tipo === 'devolución') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.tipo === 'salida' || r.tipo === 'venta') badge = 'bg-rose-100 text-rose-800';
        else badge = 'bg-blue-100 text-blue-800';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
            {r.tipo}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'productName',
      header: 'Prenda',
      accessor: r => r.productName,
      render: r => <span className="font-bold text-slate-800">{r.productName}</span>,
      sortable: true,
    },
    {
      key: 'cantidad',
      header: 'Variación',
      accessor: r => r.cantidad,
      render: r => (
        <span className={`font-mono font-bold ${r.tipo === 'salida' || r.tipo === 'venta' ? 'text-rose-600' : 'text-emerald-600'}`}>
          {r.tipo === 'salida' || r.tipo === 'venta' ? `-${r.cantidad}` : `+${r.cantidad}`}
        </span>
      ),
      align: 'center',
      sortable: true,
    },
    {
      key: 'stockNuevo',
      header: 'Stock Resultante',
      accessor: r => r.stockNuevo,
      render: r => <span className="font-mono text-slate-700">{r.stockNuevo} u.</span>,
      align: 'center',
    },
    {
      key: 'motivo',
      header: 'Motivo y Usuario',
      accessor: r => r.motivo,
      render: r => (
        <div>
          <span className="text-slate-800 font-medium block">{r.motivo}</span>
          <span className="text-[10px] text-slate-400">por {r.usuarioNombre}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      accessor: r => r.createdAt,
      render: r => (
        <span className="text-slate-500 text-[11px]">
          {new Date(r.createdAt).toLocaleString('es-CO')}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Valorización al Costo
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            ${totalValuationCost.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Costo de adquisición textil</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Valorización al PVP
          </div>
          <div className="text-xl font-extrabold text-[#7656D6] font-mono">
            ${totalValuationSale.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Potencial comercial total</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Unidades Totales Físicas
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono">
            {totalUnits} prendas
          </div>
          <div className="text-[11px] text-slate-400 mt-1">En bodega de despacho Colombia</div>
        </div>
      </div>

      {/* Navigation tabs & action button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('variants')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'variants' ? 'bg-[#7656D6] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Variantes (Talla × Color)
          </button>
          <button
            onClick={() => setTab('movements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'movements' ? 'bg-[#7656D6] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Kardex de Movimientos
          </button>
          <button
            onClick={() => setTab('abc')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'abc' ? 'bg-[#7656D6] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Análisis ABC (Pareto) & Reposición
          </button>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Ajustar Existencias</span>
        </button>
      </div>

      {/* Tab Contents */}
      {tab === 'variants' && (
        <DataTable
          columns={variantColumns}
          data={variants}
          keyField="id"
          isLoading={isLoading}
          searchPlaceholder="Buscar por SKU, talla o color..."
          exportFileName="variantes-stock.csv"
        />
      )}

      {tab === 'movements' && (
        <DataTable
          columns={movementColumns}
          data={movements}
          keyField="id"
          isLoading={isLoading}
          searchPlaceholder="Buscar por motivo, prenda o usuario..."
          exportFileName="kardex-movimientos.csv"
        />
      )}

      {tab === 'abc' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Clasificación ABC y Pronóstico de Demanda
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                <strong>Clase A:</strong> 80% de la facturación · <strong>Clase B:</strong> 15% · <strong>Clase C:</strong> 5%
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Clase</th>
                  <th className="py-2.5 px-3">Prenda</th>
                  <th className="py-2.5 px-3 text-right">Facturación</th>
                  <th className="py-2.5 px-3 text-center">Stock Actual</th>
                  <th className="py-2.5 px-3 text-center">Días de Stock Restante</th>
                  <th className="py-2.5 px-3 text-right">Reposición Sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {abcData.map(item => (
                  <tr key={item.product.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-extrabold text-[11px] ${
                          item.abcCategory === 'A'
                            ? 'bg-purple-100 text-[#7656D6]'
                            : item.abcCategory === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.abcCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {item.product.name}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        [{item.product.category}]
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${item.revenue.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {item.product.inventory} u.
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-semibold ${
                          item.daysOfStock < 10 ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {item.daysOfStock} días
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.suggestedReorder > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          Pedir +{item.suggestedReorder} u.
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Suficiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Ajuste Manual de Existencias
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cada ajuste queda registrado en el Kardex oficial con tu identidad y motivo.
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prenda a Ajustar *</label>
                <select
                  required
                  value={adjustProductId}
                  onChange={e => setAdjustProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="">Selecciona una prenda...</option>
                  {abcData.map(item => (
                    <option key={item.product.id} value={item.product.id}>
                      {item.product.name} (Stock: {item.product.inventory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Movimiento</label>
                  <select
                    value={adjustType}
                    onChange={e => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="entrada">Entrada (+)</option>
                    <option value="salida">Salida (-)</option>
                    <option value="ajuste">Ajuste de Conteo Físico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjustQuantity}
                    onChange={e => setAdjustQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo Justificado *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="Ej: Conteo físico mensual en bodega..."
                />
              </div>

              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Registrar en Kardex</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
