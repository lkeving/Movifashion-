// Module: Operación Logística y Tarifas de Envíos
// Shipping thresholds, city rates, delivery times, carrier configurations

import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Save,
  Check,
  Loader2,
} from 'lucide-react';
import { ShippingConfig } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const EnviosModule: React.FC = () => {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [thresholdInput, setThresholdInput] = useState('200000');
  const [standardRateInput, setStandardRateInput] = useState('12000');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchShippingConfig = async () => {
    try {
      const res = await authFetch('/api/admin/shipping/config');
      if (res.ok) {
        const json = await res.json();
        setConfig(json);
        setThresholdInput(String(json.freeShippingThreshold));
        setStandardRateInput(String(json.standardRate));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShippingConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await authFetch('/api/admin/shipping/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          freeShippingThreshold: Number(thresholdInput),
          standardRate: Number(standardRateInput),
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

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* General Shipping Parameters */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#7656D6]" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Parámetros de Fletes Nacionales (Colombia)
              </h3>
              <p className="text-xs text-slate-500">
                El checkout de la tienda calcula el costo de envío automáticamente según estas reglas.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? '¡Guardado!' : 'Guardar Parámetros'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Umbral para Envío Gratis a Nivel Nacional (COP):
            </label>
            <input
              type="number"
              value={thresholdInput}
              onChange={e => setThresholdInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Compras iguales o superiores a este monto tendrán flete $0 COP.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tarifa Estándar de Flete (COP):
            </label>
            <input
              type="number"
              value={standardRateInput}
              onChange={e => setStandardRateInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tarifa fija aplicada a compras por debajo del umbral de envío gratuito.
            </span>
          </div>
        </div>
      </div>

      {/* Active Carriers & Delivery Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Transportadoras Aliadas
          </h4>
          <div className="space-y-2">
            {config.carriers.map((car, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{car}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Activa
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Cobertura y Tiempos de Entrega por Ciudad
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Ciudad</th>
                  <th className="py-2 px-3">Departamento</th>
                  <th className="py-2 px-3 text-right">Tarifa Fija</th>
                  <th className="py-2 px-3 text-right">Tiempo Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.cities.map((city, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{city.city}</td>
                    <td className="py-2.5 px-3 text-slate-500">{city.department}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${city.rate.toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                      {city.deliveryDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
