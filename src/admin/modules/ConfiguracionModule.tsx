// Module: Configuración Global de la Empresa & Parámetros
// Overrides empresa.ts placeholders, payment mode, maintenance mode, and demo data generator

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  AlertTriangle,
  Save,
  Check,
  Trash2,
  Database,
  Loader2,
  Lock,
  Sparkles,
  RefreshCw,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { EMPRESA } from '../../config/empresa.ts';
import { authFetch } from '../../utils/api.ts';
import { ReauthModal } from '../components/ReauthModal.tsx';

export const ConfiguracionModule: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [settings, setSettings] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reauthAction, setReauthAction] = useState<(() => void) | null>(null);

  // Big Data & Simulation controls state
  const [seedInput, setSeedInput] = useState('20260101');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateMsg, setRegenerateMsg] = useState('');
  const [isExportingFull, setIsExportingFull] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [razonSocial, setRazonSocial] = useState(EMPRESA.razonSocial);
  const [nit, setNit] = useState(EMPRESA.nit);
  const [direccion, setDireccion] = useState(EMPRESA.direccion);
  const [ciudad, setCiudad] = useState(EMPRESA.ciudad);
  const [telefono, setTelefono] = useState(EMPRESA.telefono);
  const [whatsapp, setWhatsapp] = useState(EMPRESA.whatsapp);
  const [correoContacto, setCorreoContacto] = useState(EMPRESA.correoContacto);
  const [paymentMode, setPaymentMode] = useState('simulado');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const handleRegenerateDataset = async () => {
    setIsRegenerating(true);
    setRegenerateMsg('');
    try {
      const res = await authFetch('/api/admin/dataset/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: Number(seedInput) || 20260101 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRegenerateMsg(
          `✓ ${data.message || 'Dataset regenerado con éxito'} (${(data.totalPedidos || 0).toLocaleString('es-CO')} pedidos, ${(data.totalLineas || 0).toLocaleString('es-CO')} líneas, ${(data.totalClientes || 0).toLocaleString('es-CO')} clientes).`
        );
        setTimeout(() => setRegenerateMsg(''), 7000);
      } else {
        setRegenerateMsg('Error al regenerar dataset.');
      }
    } catch (err) {
      console.error(err);
      setRegenerateMsg('Error de red al regenerar dataset.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportFullDataset = async () => {
    setIsExportingFull(true);
    setStatusBanner(null);
    try {
      const res = await authFetch('/api/admin/dataset/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MoviFashion_Dataset_BigData_2026_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        setStatusBanner({ type: 'success', text: 'Libro completo de operaciones descargado.' });
      } else {
        setStatusBanner({ type: 'error', text: 'Error al descargar el dataset completo.' });
      }
    } catch (err) {
      console.error(err);
      setStatusBanner({ type: 'error', text: 'Error de conexión al exportar el dataset.' });
    } finally {
      setIsExportingFull(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await authFetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        setSettings(json);
        if (json.razonSocial) setRazonSocial(json.razonSocial);
        if (json.nit) setNit(json.nit);
        if (json.direccion) setDireccion(json.direccion);
        if (json.ciudad) setCiudad(json.ciudad);
        if (json.telefono) setTelefono(json.telefono);
        if (json.whatsapp) setWhatsapp(json.whatsapp);
        if (json.correoContacto) setCorreoContacto(json.correoContacto);
        if (json.paymentMode) setPaymentMode(json.paymentMode);
        if (json.maintenanceMode !== undefined) setMaintenanceMode(json.maintenanceMode);
        if (json.maintenanceMessage) setMaintenanceMessage(json.maintenanceMessage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          razonSocial,
          nit,
          direccion,
          ciudad,
          telefono,
          whatsapp,
          correoContacto,
          paymentMode,
          maintenanceMode,
          maintenanceMessage,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDemoData = () => {
    setStatusBanner(null);
    setReauthAction(() => async () => {
      try {
        const res = await authFetch('/api/admin/clear-demo-data', { method: 'POST' });
        if (res.ok) {
          setStatusBanner({
            type: 'success',
            text: 'Datos de demostración eliminados. Solo se conservan órdenes y eventos reales.',
          });
        } else {
          const err = await res.json().catch(() => ({}));
          setStatusBanner({
            type: 'error',
            text: err.error || 'No se pudieron limpiar los datos de demostración.',
          });
        }
      } catch (err) {
        console.error(err);
        setStatusBanner({ type: 'error', text: 'Error de conexión al limpiar datos demo.' });
      } finally {
        setReauthAction(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {statusBanner && (
        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button onClick={() => setStatusBanner(null)} className="font-bold">Cerrar</button>
        </div>
      )}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Legal Information */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#7656D6]" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Datos Corporativos y Tributarios (Colombia S.A.S.)
                </h3>
                <p className="text-xs text-slate-500">
                  Sobrescriben los marcadores de empresa.ts en footer, facturas y correos.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saved ? '¡Guardado!' : 'Guardar Cambios'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={razonSocial}
                onChange={e => setRazonSocial(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIT / Identificación Tributaria</label>
              <input
                type="text"
                value={nit}
                onChange={e => setNit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dirección Comercial</label>
              <input
                type="text"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ciudad y Departamento</label>
              <input
                type="text"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono PBX</label>
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp de Atención</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico de Contacto</label>
              <input
                type="email"
                value={correoContacto}
                onChange={e => setCorreoContacto(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
              />
            </div>
          </div>
        </div>

        {/* Operational Parameters & Maintenance Mode */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">
              Modo de Operación y Pagos
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1">Modo de Pasarela de Pagos:</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="simulado">Modo Simulado (Sandbox seguro de pruebas)</option>
                <option value="produccion">Modo Producción Real (Wompi / PayU)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                En modo simulado los pagos se aprueban tras 1.5s de espera sin cobro real.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                  className="rounded text-[#7656D6]"
                />
                <span>Activar Modo Mantenimiento en Tienda Pública</span>
              </label>
              <input
                type="text"
                value={maintenanceMessage}
                onChange={e => setMaintenanceMessage(e.target.value)}
                placeholder="Mensaje para los visitantes..."
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white mt-1"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Big Data & Simulated Dataset Controls (Academic 2026) */}
      <div className="p-5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 rounded-2xl border border-purple-200/80 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#7656D6]">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-sm">
                Dataset Simulado & Motor Big Data (2026)
              </h3>
              <p className="text-slate-500 text-[11px] font-medium">
                Generador determinista (Mulberry32) con estacionalidad colombiana, quincenas y ~150k eventos.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            Académico
          </span>
        </div>

        {/* Export Full XLSX */}
        <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Libro Completo de Operaciones (.xlsx)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Descarga consolidada en formato Excel con hojas de Registro_Ventas, Pedidos_Cabecera, Clientes_RFM, Inventario_Kardex, Embudo_Eventos y Reglas_Apriori.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportFullDataset}
            disabled={isExportingFull}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isExportingFull ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExportingFull ? 'Generando Excel...' : 'Descargar Libro Completo (.xlsx)'}</span>
          </button>
        </div>

        {/* Seed regeneration and cleanup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-purple-100 space-y-2.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-[#7656D6]" />
              <span>Regenerar Semilla del Dataset</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Cambia la semilla del generador determinista para recalcular pedidos simulados y series de Big Data.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                className="w-36 px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
              />
              <button
                type="button"
                onClick={handleRegenerateDataset}
                disabled={isRegenerating}
                className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] disabled:opacity-60 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Regenerar Dataset</span>
              </button>
            </div>
            {regenerateMsg && (
              <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                {regenerateMsg}
              </p>
            )}
          </div>

          <div className="p-4 bg-white rounded-xl border border-rose-100 space-y-2.5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Limpiar Pedidos Demo en Memoria</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Elimina los pedidos marcados como demo conservando íntegramente las órdenes y eventos reales de clientes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearDemoData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition self-start"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Limpiar Pedidos Demo</span>
            </button>
          </div>
        </div>
      </div>

      {reauthAction && (
        <ReauthModal
          isOpen={true}
          onClose={() => setReauthAction(null)}
          onConfirm={reauthAction}
          title="Confirmar Acción Crítica"
          description="Esta operación modifica o depura registros de demostración en el servidor. Ingresa tu contraseña para continuar."
        />
      )}
    </div>
  );
};
