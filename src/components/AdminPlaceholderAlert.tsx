import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X, ExternalLink } from 'lucide-react';
import { tieneDatosPendientes, getCamposPendientesConfiguracion } from '../config/empresa.ts';

interface AdminPlaceholderAlertProps {
  userRole?: string;
}

export const AdminPlaceholderAlert: React.FC<AdminPlaceholderAlertProps> = ({ userRole }) => {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Solo se muestra si el usuario es Administrador y hay datos con marcador "[...]"
  if (userRole !== 'admin' || dismissed || !tieneDatosPendientes()) {
    return null;
  }

  const pendientes = getCamposPendientesConfiguracion();

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed top-20 right-4 z-50 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all"
        title="Ver datos de empresa pendientes de configurar"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Configuración legal pendiente ({pendientes.length})</span>
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2.5 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Aviso para Administrador: </span>
            <span>
              La tienda contiene marcadores de empresa pendientes de reemplazo legal en{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">src/config/empresa.ts</code>:
            </span>{' '}
            <span className="font-semibold text-amber-800">
              {pendientes.map(p => `${p.etiqueta} (${p.valor})`).join(' · ')}
            </span>.
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => setMinimized(true)}
            className="text-amber-800 hover:text-amber-950 font-medium underline text-[11px]"
          >
            Minimizar
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-900 p-1"
            title="Cerrar aviso temporalmente"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
