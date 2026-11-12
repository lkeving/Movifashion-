// Module: Devoluciones y Retractos (Ley 1480 de 2011)
// Manages customer return and right-of-retract requests with simulated refunds and restock option

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { ReturnRequest } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const DevolucionesModule: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [reponerStock, setReponerStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/returns');
      if (res.ok) {
        setReturns(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (estado: 'aprobado' | 'rechazado') => {
    if (!selectedReturn) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      const res = await authFetch(`/api/admin/returns/${selectedReturn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          resolucion: resolutionNote || (estado === 'aprobado' ? 'Solicitud aprobada y reembolso simulado procesado.' : 'Solicitud rechazada.'),
          reponerInventario: reponerStock,
        }),
      });
      if (res.ok) {
        setSelectedReturn(null);
        setResolutionNote('');
        await fetchReturns();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo actualizar el estado de la devolución.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al resolver la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<ReturnRequest>[] = [
    {
      key: 'id',
      header: 'Radicado',
      accessor: r => r.id,
      render: r => <span className="font-mono font-bold text-slate-900">{r.id}</span>,
      sortable: true,
    },
    {
      key: 'orderId',
      header: 'Pedido Original',
      accessor: r => r.orderId,
      render: r => <span className="font-mono font-semibold text-[#7656D6]">{r.orderId}</span>,
      sortable: true,
    },
    {
      key: 'tipo',
      header: 'Tipo',
      accessor: r => r.tipo,
      render: r => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#7656D6]">
          {r.tipo}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Solicitante',
      accessor: r => r.userName,
      render: r => (
        <div>
          <span className="font-bold text-slate-800 block">{r.userName}</span>
          <span className="text-[11px] text-slate-400">{r.userEmail}</span>
        </div>
      ),
    },
    {
      key: 'reembolsoSimulado',
      header: 'Valor a Liquidar',
      accessor: r => r.reembolsoSimulado || 0,
      render: r => (
        <span className="font-mono font-bold text-slate-900">
          ${(r.reembolsoSimulado || 0).toLocaleString('es-CO')} COP
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: r => r.estado,
      render: r => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.estado === 'solicitado') badge = 'bg-amber-100 text-amber-800';
        else if (r.estado === 'aprobado') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.estado === 'rechazado') badge = 'bg-rose-100 text-rose-800';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
            {r.estado}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      accessor: r => r.createdAt,
      render: r => (
        <span className="text-slate-500 text-[11px]">
          {new Date(r.createdAt).toLocaleDateString('es-CO')}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <DataTable
        columns={columns}
        data={returns}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Buscar por radicado, pedido o cliente..."
        onRowClick={r => {
          setActionError('');
          setSelectedReturn(r);
        }}
        exportFileName="devoluciones-retractos.csv"
      />

      {/* Detail / Resolve Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative text-xs">
            <button
              onClick={() => setSelectedReturn(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-5 h-5 text-[#7656D6]" />
              <h3 className="text-base font-extrabold text-slate-900 font-mono">
                {selectedReturn.id}
              </h3>
            </div>
            <p className="text-slate-500 mb-4">
              Solicitud de <strong>{selectedReturn.tipo.toUpperCase()}</strong> vinculada al pedido <strong>{selectedReturn.orderId}</strong>.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mb-4">
              <div>
                <strong className="text-slate-700 block">Motivo informado por el cliente:</strong>
                <p className="text-slate-600 mt-0.5 italic">&quot;{selectedReturn.motivo}&quot;</p>
              </div>

              <div>
                <strong className="text-slate-700 block">Prendas a reintegrar:</strong>
                <ul className="list-disc list-inside text-slate-600 mt-1">
                  {selectedReturn.items.map((it, idx) => (
                    <li key={idx}>
                      {it.productName} ({it.quantity} u.) · ${it.price.toLocaleString('es-CO')} COP
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                <span>Reembolso total a liquidar:</span>
                <span className="font-mono text-slate-900">
                  ${(selectedReturn.reembolsoSimulado || 0).toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {selectedReturn.estado === 'solicitado' ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nota de Resolución / Mensaje al Consumidor:
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder="Instrucciones de recepción o motivo de aprobación..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={reponerStock}
                    onChange={e => setReponerStock(e.target.checked)}
                    className="rounded text-[#7656D6]"
                  />
                  <span>Reincorporar prendas al inventario activo (Kardex entrada)</span>
                </label>

                {actionError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                    {actionError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus('rechazado')}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('aprobado')}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Aprobar y Reembolsar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <strong>Estado actual:</strong> {selectedReturn.estado.toUpperCase()}
                {selectedReturn.resolucion && (
                  <p className="mt-1 text-[11px] text-emerald-800">Resolución: {selectedReturn.resolucion}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
