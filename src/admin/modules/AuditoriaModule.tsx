// Module: Auditoría Inmutable & Seguridad Operativa
// Immutable logs with before/after JSON diffs, security incident alerts, CSV export

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  AlertTriangle,
  Lock,
  UserCheck,
  Eye,
  FileCode,
  Loader2,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { AppAuditLog } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const AuditoriaModule: React.FC = () => {
  const [logs, setLogs] = useState<AppAuditLog[]>([]);
  const [securitySummary, setSecuritySummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDiffLog, setSelectedDiffLog] = useState<AppAuditLog | null>(null);

  const fetchAuditData = async () => {
    setIsLoading(true);
    try {
      const [resLogs, resSec] = await Promise.all([
        authFetch('/api/admin/audit'),
        authFetch('/api/admin/security/summary'),
      ]);
      if (resLogs.ok) setLogs(await resLogs.json());
      if (resSec.ok) setSecuritySummary(await resSec.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const columns: Column<AppAuditLog>[] = [
    {
      key: 'accion',
      header: 'Acción Ejecutada',
      accessor: r => r.accion,
      render: r => (
        <div>
          <span className="font-bold text-slate-800 font-mono block">{r.accion}</span>
          <span className="text-[10px] text-slate-400">Módulo: {r.modulo}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'usuario',
      header: 'Usuario y Rol',
      accessor: r => r.usuarioNombre,
      render: r => (
        <div>
          <span className="font-semibold text-slate-800 block">{r.usuarioNombre || 'Sistema'}</span>
          <span className="text-[10px] text-purple-700 font-bold uppercase">{r.rol || 'admin'}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP de Origen',
      accessor: r => r.ip,
      render: r => <span className="font-mono text-slate-500 text-[11px]">{r.ip}</span>,
    },
    {
      key: 'estado',
      header: 'Resultado',
      accessor: r => r.estado,
      render: r => {
        let badge = 'bg-emerald-100 text-emerald-800';
        if (r.estado === 'DENEGADO') badge = 'bg-rose-100 text-rose-800';
        else if (r.estado === 'ADVERTENCIA') badge = 'bg-amber-100 text-amber-800';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
            {r.estado}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'diff',
      header: 'Diff JSON',
      render: r => {
        const hasDiff = r.antes || r.despues;
        if (!hasDiff) return <span className="text-slate-300 text-[10px]">Sin diff</span>;
        return (
          <button
            onClick={e => {
              e.stopPropagation();
              setSelectedDiffLog(r);
            }}
            className="px-2.5 py-1 text-[11px] font-bold text-[#7656D6] bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center gap-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Ver Diff</span>
          </button>
        );
      },
      align: 'center',
    },
    {
      key: 'timestamp',
      header: 'Fecha y Hora',
      accessor: r => r.timestamp,
      render: r => (
        <span className="text-slate-500 text-[11px]">
          {new Date(r.timestamp).toLocaleString('es-CO')}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Security Incident Summary */}
      {securitySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Personal con 2FA Activo
            </span>
            <div className="text-xl font-black text-emerald-600">
              {securitySummary.with2FA} de {securitySummary.totalStaff}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {securitySummary.mfaAdoptionPercent}% de adopción
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Accesos Denegados (403)
            </span>
            <div className="text-xl font-black text-rose-600">
              {securitySummary.deniedAccessCount} intentos
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Bloqueados por RBAC</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Cuentas Bloqueadas
            </span>
            <div className="text-xl font-black text-amber-600">
              {securitySummary.lockedCount} usuarios
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Por intentos fallidos</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Registro Inmutable
            </span>
            <div className="text-xl font-black text-[#7656D6]">
              {logs.length} eventos
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Cero datos modificables</span>
          </div>
        </div>
      )}

      {/* Main Audit Table */}
      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Filtrar por acción, usuario o IP..."
        exportFileName="bitacora-auditoria.csv"
      />

      {/* Diff JSON Modal */}
      {selectedDiffLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 relative text-xs">
            <button
              onClick={() => setSelectedDiffLog(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1 font-mono">
              Diff de Auditoría: {selectedDiffLog.accion}
            </h3>
            <p className="text-slate-500 mb-4">
              Ejecutado por {selectedDiffLog.usuarioNombre} ({selectedDiffLog.rol}) el {new Date(selectedDiffLog.timestamp).toLocaleString('es-CO')}.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-rose-700 block mb-1.5 uppercase text-[10px] tracking-wider">
                  Estado Anterior (Antes)
                </span>
                <pre className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl font-mono text-[11px] text-slate-800 max-h-60 overflow-auto">
                  {selectedDiffLog.antes ? JSON.stringify(selectedDiffLog.antes, null, 2) : 'null (registro nuevo)'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-emerald-700 block mb-1.5 uppercase text-[10px] tracking-wider">
                  Estado Posterior (Después)
                </span>
                <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-[11px] text-slate-800 max-h-60 overflow-auto">
                  {selectedDiffLog.despues ? JSON.stringify(selectedDiffLog.despues, null, 2) : 'null (eliminado)'}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
              <button
                onClick={() => setSelectedDiffLog(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
