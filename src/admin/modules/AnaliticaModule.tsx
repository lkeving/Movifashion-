// Module: Analítica Avanzada, Big Data & Predicciones
// Conversion funnel, market basket affinities, demand runway forecast

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  ShoppingBag,
  ArrowRight,
  PieChart,
  Brain,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';

export const AnaliticaModule: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/analytics/deep');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Procesando modelos predictivos...</span>
      </div>
    );
  }

  const { funnel, marketBasket, demandForecast } = data;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Conversion Funnel */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#7656D6]" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Embudo de Conversión del Comercio Electrónico
            </h3>
            <p className="text-xs text-slate-500">
              Pérdidas y conversiones entre visualización y compra confirmada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {funnel.map((stage: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Paso {idx + 1}
              </span>
              <span className="font-extrabold text-slate-800 text-xs block">{stage.etapa}</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {stage.cantidad.toLocaleString('es-CO')}
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#7656D6] h-full" style={{ width: `${stage.porcentaje}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block text-right font-bold">
                {stage.porcentaje}% del tráfico
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Market Basket (Combinaciones Frecuentes) */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Canasta de Compra (Prendas que se Compran Juntas)
            </h3>
            <p className="text-xs text-slate-500">
              Correlaciones reales detectadas en las órdenes procesadas para ofertas cruzadas (&quot;Completa tu outfit&quot;).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {marketBasket.map((mb: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-800 line-clamp-2">{mb.pair}</span>
              </div>
              <span className="font-mono text-emerald-700 font-extrabold shrink-0 ml-2">
                {mb.count}x juntos
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Demand Forecasting Table */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Predicción de Demanda & Cobertura de Stock (30 Días)
            </h3>
            <p className="text-xs text-slate-500">
              Cálculo con promedio móvil diario de compras para evitar rotura de inventario en bodega.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Prenda</th>
                <th className="py-2.5 px-3 text-center">Velocidad Diaria</th>
                <th className="py-2.5 px-3 text-center">Stock Actual</th>
                <th className="py-2.5 px-3 text-center">Demanda 30 Días</th>
                <th className="py-2.5 px-3 text-center">Días de Stock Restante</th>
                <th className="py-2.5 px-3 text-right">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demandForecast.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-bold text-slate-800">{item.name}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">{item.dailyVelocity} u/día</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{item.currentStock} u.</td>
                  <td className="py-3 px-3 text-center font-mono text-[#7656D6] font-bold">{item.projected30DayDemand} u.</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">{item.daysRemaining} días</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Crítico'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'Alerta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
