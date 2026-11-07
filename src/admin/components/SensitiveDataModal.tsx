// Sensitive Data Reveal Modal under Ley 1581 de 2012 (Habeas Data)
// Requires mandatory legal reason before unmasking personal data and logs to audit.

import React, { useState } from 'react';
import { Eye, ShieldAlert, Loader2, X } from 'lucide-react';
import { authFetch } from '../../utils/api.ts';

interface SensitiveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onRevealed: (data: { email: string; addresses: any[] }) => void;
}

export const SensitiveDataModal: React.FC<SensitiveDataModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onRevealed,
}) => {
  const [reason, setReason] = useState('Verificación de entrega de pedido y contacto telefónico');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'otro' ? customReason.trim() : reason;
    if (!finalReason) {
      setError('Debes especificar el motivo legal para consultar los datos sensibles.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/admin/customers/reveal-sensitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No autorizado');
      }

      onRevealed({
        email: data.email,
        addresses: data.addresses,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al solicitar acceso a datos sensibles.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7656D6] flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">Consulta de Datos Sensibles</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> (Protección de Datos Personales),
          esta consulta quedará registrada permanentemente en la bitácora de auditoría con tu usuario, fecha e IP.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titular de la información:
            </label>
            <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {customerName}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo justificado de la consulta:
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#7656D6] mb-2"
            >
              <option value="Verificación de entrega de pedido y contacto telefónico">
                Verificación de entrega de pedido y contacto telefónico
              </option>
              <option value="Atención formal de radicado PQRS">
                Atención formal de radicado PQRS
              </option>
              <option value="Gestión de garantía o devolución autorizada">
                Gestión de garantía o devolución autorizada
              </option>
              <option value="otro">Otro motivo legal específico</option>
            </select>

            {reason === 'otro' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Describe el motivo con base en las funciones autorizadas..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#7656D6] hover:bg-[#6042BE] rounded-xl shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Eye className="w-3.5 h-3.5" />
              Revelar y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
