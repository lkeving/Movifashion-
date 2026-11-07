// Module 1: Resumen Ejecutivo (Executive Dashboard)
// Real KPIs, monthly sales target, hourly/daily sales breakdown, categories, top products, actionable alerts

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
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';

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
  };
  goal: {
    month: string;
    targetSales: number;
    currentSales: number;
    progressPercent: number;
  };
  salesByDay: { day: string; ventas: number; pedidos: number }[];
  salesByHour: { hour: string; ventas: number; pedidos: number }[];
  salesByCategory: { name: string; value: number; percent: number }[];
  salesByCity: { city: string; value: number }[];
  salesByPayment: { tarjeta: number; pse: number; contraentrega: number };
  topProducts: { product: any; units: number; revenue: number }[];
  alerts: {
    unfulfilledOver24h: number;
    lowStockCount: number;
    outOfStockCount: number;
    urgentReturnsCount: number;
  };
  recentActivity: any[];
}

export const ResumenModule: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetGoalInput, setTargetGoalInput] = useState('');

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/summary');
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
  }, []);

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
        <span className="text-xs font-semibold text-slate-500">Calculando métricas del negocio...</span>
      </div>
    );
  }

  const { kpis, goal, salesByDay, salesByHour, salesByCategory, salesByCity, salesByPayment, topProducts, alerts, recentActivity } = data;

  const maxDaySales = Math.max(...salesByDay.map(d => d.ventas), 1);
  const maxHourSales = Math.max(...salesByHour.map(h => h.ventas), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Actionable Alerts */}
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
                  <p className="text-[11px] text-amber-700">Requieren preparación prioritaria</p>
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
                    {alerts.lowStockCount} prenda(s) con stock crítico
                  </h4>
                  <p className="text-[11px] text-rose-700">Por debajo del umbral de seguridad</p>
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
                  <p className="text-[11px] text-purple-700">Plazo legal de 5 días hábiles</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7656D6]" />
            </div>
          )}
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ventas Brutas</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${kpis.totalGrossSales.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Neto: ${kpis.totalNetSales.toLocaleString('es-CO')}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-600 font-semibold">IVA 19% inc.</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pedidos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {kpis.totalOrders}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ticket promedio: <strong className="text-slate-700">${kpis.avgTicket.toLocaleString('es-CO')}</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tasa de Conversión</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {kpis.conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Abandono de carrito: <strong className="text-slate-700">{kpis.cartAbandonmentRate}%</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clientes Registrados</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {kpis.customerCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Margen operativo estimado: <strong className="text-emerald-700">{kpis.marginPercent}%</strong>
          </div>
        </div>
      </div>

      {/* Monthly Sales Goal Progress */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-[#1e1738] rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Meta Mensual ({goal.month})
              </span>
            </div>
            <div className="text-2xl font-black mt-1">
              ${goal.currentSales.toLocaleString('es-CO')} COP
              <span className="text-sm font-normal text-purple-200 ml-2">
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

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-3.5 rounded-full overflow-hidden p-0.5 relative z-10">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-[#7656D6] rounded-full transition-all duration-700"
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-purple-200 mt-2 relative z-10">
          <span>{goal.progressPercent}% completado</span>
          <span>Faltan ${(Math.max(0, goal.targetSales - goal.currentSales)).toLocaleString('es-CO')} COP</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7656D6]" />
            Ventas por Día de la Semana
          </h3>
          <div className="flex-1 flex items-end justify-between gap-2 pt-6 h-48 border-b border-slate-100 pb-2">
            {salesByDay.map(d => {
              const heightPercent = Math.max(8, Math.round((d.ventas / maxDaySales) * 100));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    ${(d.ventas / 1000000).toFixed(1)}M
                  </div>
                  <div
                    className="w-full bg-purple-100 group-hover:bg-[#7656D6] rounded-t-xl transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales by Hour */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Curva de Demanda por Horas (24h)
          </h3>
          <div className="flex-1 flex items-end justify-between gap-1 pt-6 h-48 border-b border-slate-100 pb-2 overflow-x-auto">
            {salesByHour.filter((_, idx) => idx % 2 === 0).map(h => {
              const heightPercent = Math.max(6, Math.round((h.ventas / maxHourSales) * 100));
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-2 group min-w-[20px]">
                  <div
                    className="w-full bg-emerald-100 group-hover:bg-emerald-600 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                    title={`${h.hour}: $${h.ventas.toLocaleString('es-CO')} COP (${h.pedidos} pedidos)`}
                  />
                  <span className="text-[9px] text-slate-400 font-mono">{h.hour.slice(0, 2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Categories, Cities, Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7656D6]" />
            Ventas por Categoría
          </h3>
          <div className="space-y-3">
            {salesByCategory.slice(0, 5).map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="text-slate-500 font-mono">${cat.value.toLocaleString('es-CO')}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7656D6] rounded-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Despachos por Ciudad
          </h3>
          <div className="space-y-2.5">
            {salesByCity.slice(0, 5).map(city => (
              <div key={city.city} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-700">{city.city}</span>
                <span className="text-slate-900 font-mono font-bold">${city.value.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            Métodos de Pago
          </h3>
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Tarjetas Crédito/Débito</span>
                <span className="text-[11px] text-slate-400">Visa, Mastercard, Amex</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.tarjeta.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">PSE / Transferencia</span>
                <span className="text-[11px] text-slate-400">Bancolombia, Davivienda, Nequi</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.pse.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Pago Contraentrega</span>
                <span className="text-[11px] text-slate-400">Efectivo contra entrega en Colombia</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ${salesByPayment.contraentrega.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Products Table */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-[#7656D6]" />
            Top 10 Prendas Más Vendidas
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
                <th className="py-2.5 px-3 text-right">Precio</th>
                <th className="py-2.5 px-3 text-center">Unidades</th>
                <th className="py-2.5 px-3 text-right">Total Facturado</th>
                <th className="py-2.5 px-3 text-right">Existencias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((item, idx) => (
                <tr key={item.product.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2.5">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <span className="truncate max-w-[220px]">{item.product.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{item.product.category}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    ${item.product.price.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-[#7656D6]">{item.units}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                    ${item.revenue.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.product.inventory < 10
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.product.inventory} en stock
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
