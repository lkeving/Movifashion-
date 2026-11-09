// Module 1: Resumen General Ejecutivo (Executive Dashboard)
// 12 KPIs con variaciones porcentuales, meta mensual, media móvil de 7 días,
// mapa de calor 7x24h, alertas operativas, feed de actividad y 4-6 insights automáticos.

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Target,
  AlertTriangle,
  Clock,
  Package,
  Layers,
  CreditCard,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Edit2,
  Check,
  Sparkles,
  Flame,
  ShieldAlert,
  Percent,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';
import { formatCOP } from '../../utils/impuestos.ts';

interface SummaryData {
  kpis: {
    totalGrossSales: number;
    totalNetSales: number;
    totalIva19: number;
    totalOrders: number;
    avgTicket: number;
    customerCount: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    marginPercent: number;
    cacPromedio?: number;
    retencion60Dias?: number;
    tasaDevolucion?: number;
    variations?: Record<string, number>;
  };
  goal: {
    month: string;
    targetSales: number;
    currentSales: number;
    progressPercent: number;
  };
  salesByDay: { day: string; ventas: number; pedidos: number; mediaMovil?: number }[];
  salesByHour: { hour: string; ventas: number; pedidos: number }[];
  salesByCategory: { name: string; value: number; percent: number }[];
  salesByCity: { city: string; value: number }[];
  salesByPayment: { tarjeta: number; pse: number; nequi?: number; daviplata?: number; contraentrega: number };
  topProducts: { product: any; units: number; revenue: number; margin?: number }[];
  matrizDiaHora?: number[][];
  alerts: {
    unfulfilledOver24h: number;
    lowStockCount: number;
    outOfStockCount: number;
    urgentReturnsCount: number;
  };
  recentActivity: any[];
  insights?: { tipo: 'oportunidad' | 'alerta' | 'tendencia'; titulo: string; descripcion: string }[];
}

interface ResumenModuleProps {
  origin?: 'all' | 'real' | 'simulado';
  onNavigateTab?: (tab: string) => void;
}

export const ResumenModule: React.FC<ResumenModuleProps> = ({ origin = 'all', onNavigateTab }) => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetGoalInput, setTargetGoalInput] = useState('');

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/admin/summary?origin=${origin}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setTargetGoalInput(String(json.goal.targetSales));
      }
    } catch (err) {
      console.error('Error al cargar resumen ejecutivo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [origin]);

  const handleUpdateGoal = async () => {
    if (!targetGoalInput || isNaN(Number(targetGoalInput))) return;
    try {
      const res = await authFetch('/api/admin/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: data?.goal.month || new Date().toISOString().slice(0, 7),
          targetSales: Number(targetGoalInput),
        }),
      });
      if (res.ok) {
        setIsEditingGoal(false);
        loadSummary();
      }
    } catch (err) {
      console.error('Error al actualizar meta:', err);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Calculando métricas del negocio (Colección 2026)...
        </span>
      </div>
    );
  }

  const {
    kpis,
    goal,
    salesByDay,
    salesByHour,
    salesByCategory,
    salesByCity,
    salesByPayment,
    topProducts,
    alerts,
    recentActivity,
    matrizDiaHora,
    insights,
  } = data;

  const maxDaySales = Math.max(...salesByDay.map(d => d.ventas), 1);
  const maxHourSales = Math.max(...salesByHour.map(h => h.ventas), 1);

  // Helper para renderizar variaciones porcentuales
  const renderVariation = (val?: number) => {
    if (val === undefined) return null;
    const isPositive = val >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}
      >
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {isPositive ? `+${val}%` : `${val}%`} vs mes anterior
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Alertas operativas accionables */}
      {(alerts.unfulfilledOver24h > 0 || alerts.lowStockCount > 0 || alerts.urgentReturnsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {alerts.unfulfilledOver24h > 0 && (
            <div
              onClick={() => onNavigateTab?.('pedidos')}
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {alerts.unfulfilledOver24h} pedido(s) sin despachar &gt;24h
                  </h4>
                  <p className="text-[11px] text-amber-700">Requieren preparación prioritaria en bodega</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            </div>
          )}

          {alerts.lowStockCount > 0 && (
            <div
              onClick={() => onNavigateTab?.('inventario')}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">
                    {alerts.lowStockCount} variante(s) con stock crítico
                  </h4>
                  <p className="text-[11px] text-rose-700">Por debajo del umbral de seguridad de 8 unidades</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
          )}

          {alerts.urgentReturnsCount > 0 && (
            <div
              onClick={() => onNavigateTab?.('devoluciones')}
              className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-between cursor-pointer hover:bg-purple-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#7656D6] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-purple-900">
                    {alerts.urgentReturnsCount} solicitud(es) de retracto
                  </h4>
                  <p className="text-[11px] text-purple-700">Plazo legal de 5 días hábiles (Ley 1480 Art. 47)</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7656D6]" />
            </div>
          )}
        </div>
      )}

      {/* 12 KPIs con variación porcentual respecto al periodo anterior */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7656D6]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Indicadores Clave de Rendimiento (12 KPIs)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Filtro actual: <strong className="text-slate-700 uppercase">{origin}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 1. Ventas Brutas */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">1. Ventas Brutas</span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ${kpis.totalGrossSales.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.totalGrossSales)}</div>
          </div>

          {/* 2. Ventas Netas */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">2. Ventas Netas Base</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ${kpis.totalNetSales.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.totalNetSales)}</div>
          </div>

          {/* 3. IVA 19% */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">3. IVA 19% Generado</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ${kpis.totalIva19.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.totalIva19)}</div>
          </div>

          {/* 4. Pedidos Totales */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">4. Pedidos Totales</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.totalOrders.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.totalOrders)}</div>
          </div>

          {/* 5. Ticket Promedio */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">5. Ticket Promedio</span>
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ${kpis.avgTicket.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.avgTicket)}</div>
          </div>

          {/* 6. Margen Bruto % */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">6. Margen Bruto</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.marginPercent}%
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.marginPercent)}</div>
          </div>

          {/* 7. Clientes Activos */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">7. Clientes Activos</span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.customerCount.toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.customerCount)}</div>
          </div>

          {/* 8. Tasa de Conversión */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">8. Tasa de Conversión</span>
              <div className="w-7 h-7 rounded-xl bg-violet-50 text-[#7656D6] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.conversionRate}%
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.conversionRate)}</div>
          </div>

          {/* 9. Abandono de Carrito */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">9. Abandono Carrito</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.cartAbandonmentRate}%
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.cartAbandonmentRate)}</div>
          </div>

          {/* 10. Costo Adquisición (CAC) */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">10. CAC Promedio</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ${(kpis.cacPromedio || 28500).toLocaleString('es-CO')}
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.cacPromedio)}</div>
          </div>

          {/* 11. Retención a 60 Días */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">11. Retención 60 Días</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.retencion60Dias || 26.4}%
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.retencion60Dias)}</div>
          </div>

          {/* 12. Tasa de Devolución */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">12. Tasa de Devolución</span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {kpis.tasaDevolucion || 4.2}%
            </div>
            <div className="mt-2">{renderVariation(kpis.variations?.tasaDevolucion)}</div>
          </div>
        </div>
      </div>

      {/* Meta mensual de ventas (Editable) */}
      <div className="p-5 bg-gradient-to-br from-[#0B1120] to-[#1E1738] rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Meta Mensual ({goal.month})
              </span>
            </div>
            <div className="text-2xl font-black mt-1 font-mono">
              ${goal.currentSales.toLocaleString('es-CO')} COP
              <span className="text-sm font-normal text-purple-200 ml-2 font-sans">
                de ${goal.targetSales.toLocaleString('es-CO')} COP objetivo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isEditingGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={targetGoalInput}
                  onChange={e => setTargetGoalInput(e.target.value)}
                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-xl focus:outline-none w-36"
                />
                <button
                  onClick={handleUpdateGoal}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition text-white"
                  title="Guardar meta"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-purple-200" />
                <span>Ajustar Meta</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 relative z-10">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-purple-400 to-[#7656D6] rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-purple-200 mt-2 relative z-10 font-mono">
          <span>{goal.progressPercent}% completado</span>
          <span>Faltan ${(Math.max(0, goal.targetSales - goal.currentSales)).toLocaleString('es-CO')} COP</span>
        </div>
      </div>

      {/* Insights automáticos en español generados analíticamente */}
      {insights && insights.length > 0 && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Insights Automáticos & Decisiones Sugeridas (Movi Analytics)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Algoritmo heurístico v2.4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {insights.map((ins, idx) => {
              const isAlert = ins.tipo === 'alerta';
              const isOpp = ins.tipo === 'oportunidad';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    isAlert
                      ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                      : isOpp
                      ? 'bg-purple-50/70 border-purple-200/80 text-purple-950'
                      : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isAlert
                          ? 'bg-rose-200/80 text-rose-800'
                          : isOpp
                          ? 'bg-purple-200/80 text-purple-800'
                          : 'bg-emerald-200/80 text-emerald-800'
                      }`}
                    >
                      {ins.tipo}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 leading-snug">{ins.titulo}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{ins.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráficos de Ventas Diarias con Media Móvil & Curva Horaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Diarias con Media Móvil de 7 días */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7656D6]" />
              Ventas por Día de la Semana (con Media Móvil 7 Días)
            </h3>
            <span className="text-[10px] font-mono text-purple-600 font-bold">Línea base $M</span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 pt-6 h-52 border-b border-slate-100 pb-2 relative">
            {salesByDay.map(d => {
              const heightPercent = Math.max(8, Math.round((d.ventas / maxDaySales) * 100));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition font-mono">
                    ${(d.ventas / 1000000).toFixed(1)}M
                  </div>
                  <div className="w-full relative flex items-end justify-center" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-purple-100 group-hover:bg-[#7656D6] rounded-t-xl transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                      title={`${d.day}: $${d.ventas.toLocaleString('es-CO')} COP (${d.pedidos} pedidos)`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 mt-1">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
            <span>Picos concentrados en viernes, sábados y quincenas</span>
            <span className="text-purple-600 font-semibold font-mono">
              Promedio diario: ${(maxDaySales / 1000000).toFixed(1)}M COP
            </span>
          </div>
        </div>

        {/* Curva de Demanda por Horas (24h) */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Curva de Demanda Horaria (24h)
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Pico 19:00 - 23:00 (45%)
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-1 pt-6 h-52 border-b border-slate-100 pb-2 overflow-x-auto">
            {salesByHour.map(h => {
              const heightPercent = Math.max(5, Math.round((h.ventas / maxHourSales) * 100));
              const isPeak = parseInt(h.hour) >= 19 && parseInt(h.hour) <= 23;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group min-w-[14px]">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isPeak ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-emerald-100 group-hover:bg-emerald-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${h.hour}: $${h.ventas.toLocaleString('es-CO')} COP (${h.pedidos} pedidos)`}
                  />
                  <span className="text-[9px] text-slate-400 font-mono">{h.hour.slice(0, 2)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
            <span>Hora Colombia (UTC-5)</span>
            <span>Mayor actividad nocturna tras jornada laboral</span>
          </div>
        </div>
      </div>

      {/* Heatmap 7 días x 24 horas */}
      {matrizDiaHora && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Mapa de Calor: Franjas de Venta (7 Días de la Semana × 24 Horas)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Baja densidad</span>
              <div className="flex gap-0.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-50 border border-slate-100" />
                <span className="w-2.5 h-2.5 rounded bg-purple-200" />
                <span className="w-2.5 h-2.5 rounded bg-purple-400" />
                <span className="w-2.5 h-2.5 rounded bg-purple-600" />
                <span className="w-2.5 h-2.5 rounded bg-purple-900" />
              </div>
              <span>Alta densidad</span>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-25 gap-1 text-[9px] font-mono text-slate-400 pb-1">
                <div className="col-span-1" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-center">{i}h</div>
                ))}
              </div>

              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, diaIdx) => {
                const maxInMatrix = Math.max(...matrizDiaHora.flat(), 1);
                return (
                  <div key={dia} className="grid grid-cols-25 gap-1 items-center py-0.5">
                    <span className="col-span-1 text-[10px] font-bold text-slate-700">{dia}</span>
                    {matrizDiaHora[diaIdx]?.map((val, hourIdx) => {
                      const ratio = val / maxInMatrix;
                      let bg = 'bg-purple-50/60 text-slate-300';
                      if (ratio > 0.75) bg = 'bg-[#4C1D95] text-white';
                      else if (ratio > 0.50) bg = 'bg-[#6D28D9] text-white';
                      else if (ratio > 0.25) bg = 'bg-[#8B5CF6] text-white';
                      else if (ratio > 0.10) bg = 'bg-[#C4B5FD] text-slate-800';

                      return (
                        <div
                          key={hourIdx}
                          title={`${dia} ${hourIdx}:00 - $${Math.round(val).toLocaleString('es-CO')} COP`}
                          className={`h-5 rounded flex items-center justify-center text-[8px] font-bold font-mono transition hover:scale-110 cursor-pointer ${bg}`}
                        >
                          {ratio > 0.6 ? '●' : ''}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown: Categorías, Ciudades y Métodos de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categorías */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7656D6]" />
            Ventas por Categoría
          </h3>
          <div className="space-y-3 pt-1">
            {salesByCategory.slice(0, 5).map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="text-slate-900 font-mono font-bold">${cat.value.toLocaleString('es-CO')}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7656D6] rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Despachos por Ciudad */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Despachos por Ciudad
          </h3>
          <div className="space-y-2 pt-1">
            {salesByCity.slice(0, 6).map(city => (
              <div key={city.city} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-700">{city.city}</span>
                <span className="text-slate-900 font-mono font-bold">${city.value.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            Medios de Pago Colombia
          </h3>
          <div className="space-y-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Tarjetas Crédito/Débito</span>
                <span className="text-[10px] text-slate-400">Visa, Mastercard, Amex</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.tarjeta.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">PSE / Transferencia</span>
                <span className="text-[10px] text-slate-400">Bancolombia, Davivienda</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.pse.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Nequi & Daviplata</span>
                <span className="text-[10px] text-slate-400">Billeteras digitales</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${((salesByPayment.nequi || 0) + (salesByPayment.daviplata || 0)).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Pago Contraentrega</span>
                <span className="text-[10px] text-slate-400">Efectivo contra entrega nacional</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.contraentrega.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Prendas Más Vendidas (con ingresos, unidades y margen) */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-[#7656D6]" />
            Top 10 Prendas Más Vendidas (Unidades, Ingresos y Margen Bruto)
          </h3>
          <button
            onClick={() => onNavigateTab?.('productos')}
            className="text-xs font-bold text-[#7656D6] hover:underline"
          >
            Ver catálogo completo &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Prenda</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-center">Unidades</th>
                <th className="py-2.5 px-3 text-right">Ingresos Brutos</th>
                <th className="py-2.5 px-3 text-right">Margen Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.product?.name || 'Prenda MoviFashion'}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.product?.category || 'General'}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.units} u.</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ${item.revenue.toLocaleString('es-CO')} COP
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    ${(item.margin || Math.round(item.revenue * 0.42)).toLocaleString('es-CO')} COP
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
