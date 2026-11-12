// Module: Atención al Cliente y Radicados PQRS (Ley 1480)
// Unified queue for PQRS and contact messages with 15 business days statutory deadline counter

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  User,
  Tag,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { authFetch } from '../../utils/api.ts';

export const AtencionModule: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/atencion/cases');
      if (res.ok) {
        setCases(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSendReply = async () => {
    if (!selectedCase || !replyMessage.trim()) return;
    setIsSubmitting(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await authFetch(`/api/admin/atencion/cases/${selectedCase.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajeRespuesta: replyMessage }),
      });
      if (res.ok) {
        setSelectedCase(null);
        setReplyMessage('');
        setActionSuccess('Respuesta formal emitida al peticionario.');
        setTimeout(() => setActionSuccess(''), 3500);
        await fetchCases();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo emitir la respuesta.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al enviar respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Radicado / Caso',
      accessor: r => r.id,
      render: r => <span className="font-mono font-bold text-slate-900">{r.id}</span>,
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
      key: 'remitente',
      header: 'Peticionario',
      accessor: r => r.remitente,
      render: r => (
        <div>
          <span className="font-bold text-slate-800 block">{r.remitente}</span>
          <span className="text-[11px] text-slate-400">{r.email}</span>
        </div>
      ),
    },
    {
      key: 'asunto',
      header: 'Asunto',
      accessor: r => r.asunto,
      render: r => <span className="font-semibold text-slate-700 line-clamp-1">{r.asunto}</span>,
    },
    {
      key: 'plazo',
      header: 'Semáforo Legal (15 días)',
      accessor: r => r.diasTranscurridos,
      render: r => {
        const remaining = 15 - (r.diasTranscurridos || 0);
        let badgeColor = 'bg-emerald-100 text-emerald-800';
        if (remaining <= 3) badgeColor = 'bg-rose-100 text-rose-800 animate-pulse';
        else if (remaining <= 7) badgeColor = 'bg-amber-100 text-amber-800';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
            {remaining > 0 ? `${remaining} días restantes` : 'VENCIDO'}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: r => r.estado,
      render: r => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
          {r.estado}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {actionSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}
      <DataTable
        columns={columns}
        data={cases}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Buscar por radicado, remitente o asunto..."
        onRowClick={c => {
          setActionError('');
          setSelectedCase(c);
        }}
        exportFileName="casos-atencion-pqrs.csv"
      />

      {/* Case Detail / Reply Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative text-xs">
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-[#7656D6]" />
              <h3 className="text-base font-extrabold text-slate-900 font-mono">
                {selectedCase.id}
              </h3>
            </div>
            <p className="text-slate-500 mb-4">{selectedCase.asunto}</p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mb-4">
              <div className="flex justify-between">
                <span><strong>Peticionario:</strong> {selectedCase.remitente}</span>
                <span className="text-slate-400">{new Date(selectedCase.createdAt).toLocaleString('es-CO')}</span>
              </div>
              <p className="text-slate-700 italic border-l-2 border-[#7656D6] pl-2.5 mt-2">
                &quot;{selectedCase.mensaje}&quot;
              </p>
              {selectedCase.respuestaEmitida && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>Última respuesta emitida:</strong> {selectedCase.respuestaEmitida}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plantilla de Respuesta Formal al Consumidor:
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Estimado(a) titular: En atención a su comunicación formal radicada con el número..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir Respuesta Legal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
