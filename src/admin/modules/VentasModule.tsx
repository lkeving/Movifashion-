// Módulo 2: Registro de Ventas 2026 (Auditable con Margen Bruto)
// Estilo adaptado a la referencia "MotoVerse Analytics & Control"

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Filter,
  Calendar,
  Layers,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';
import { formatCOP } from '../../utils/impuestos.ts';

interface SaleTransaction {
  id: string;
  fecha: string;
  cliente: string;
  clienteEmail: string;
  prenda: string;
  prendasDetalle: string;
  cantidad: number;
  precioFinal: number;
  subtotalBase: number;
  iva: number;
  costoUnitarioPromedio: number;
  costoTotal: number;
  margenBruto: number;
  margenPorcentaje: number;
  canalCiudad: string;
  ciudad: string;
  canal: string;
  estado: string;
}

interface SalesKPIs {
  totalVentas: number;
  totalMargen: number;
  margenPromedio: number;
  totalTransacciones: number;
  clientesUnicos: number;
  unidadesVendidas: number;
}

interface VentasModuleProps {
  origin?: 'all' | 'real' | 'simulado';
}

export const VentasModule: React.FC<VentasModuleProps> = ({ origin = 'all' }) => {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [kpis, setKpis] = useState<SalesKPIs>({
    totalVentas: 0,
    totalMargen: 0,
    margenPromedio: 0,
    totalTransacciones: 0,
    reales: 0,
    simuladas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('todos');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'real' | 'simulado'>(origin);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSelectedOrigin(origin);
  }, [origin]);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        month: selectedMonth,
        origin: selectedOrigin,
      });

      const res = await authFetch(`/api/admin/sales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setKpis(data.kpis || {
          totalVentas: 0,
          totalMargen: 0,
          margenPromedio: 0,
          totalTransacciones: 0,
          reales: 0,
          simuladas: 0,
        });
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching sales transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, selectedMonth, selectedOrigin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSales();
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        search: search.trim(),
        month: selectedMonth,
        origin: selectedOrigin,
      });

      const res = await authFetch(`/api/admin/sales/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registro_ventas_2026_${selectedMonth}_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al generar la exportación a Excel.');
      }
    } catch (err) {
      console.error('Error exporting sales:', err);
      alert('Ocurrió un error al descargar el archivo Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#7656D6] text-white tracking-wider uppercase font-mono">
              Módulo 2
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Registro de Ventas 2026 ({kpis.totalTransacciones} transacciones)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detalle cronológico auditable con desglose de coste unitario y margen bruto.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setPage(1);
              fetchSales();
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#7656D6]' : ''}`} />
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting || kpis.totalTransacciones === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Generando Excel...' : 'Exportar a Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Real KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Facturado (COP)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7656D6] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {formatCOP(kpis.totalVentas)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">IVA 19% incluido en todas las órdenes</span>
        </div>

        {/* Margen Bruto */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Margen Bruto Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {formatCOP(kpis.totalMargen)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
            Margen promedio: {kpis.margenPromedio}% sobre base gravable
          </span>
        </div>

        {/* Transacciones Totales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Volumen de Ventas
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {kpis.totalTransacciones} <span className="text-xs font-semibold text-slate-400">pedidos</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Ticket promedio: {kpis.totalTransacciones > 0 ? formatCOP(Math.round(kpis.totalVentas / kpis.totalTransacciones)) : '$0'}
          </span>
        </div>

        {/* Clientes Únicos y Unidades Vendidas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Clientes y Unidades
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div>
              <span className="text-lg font-black text-slate-900">{(kpis.clientesUnicos || 0).toLocaleString('es-CO')}</span>
              <span className="text-[10px] text-slate-500 block font-medium">Clientes únicos</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-lg font-black text-indigo-600">{(kpis.unidadesVendidas || 0).toLocaleString('es-CO')}</span>
              <span className="text-[10px] text-slate-500 block font-medium">Unidades vendidas</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Consolidado general de ventas</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID de orden, cliente, correo, prenda o ciudad..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#7656D6] transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7656D6] hover:bg-[#6344be] text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los meses (2026)</option>
              <option value="2026-01">Enero 2026</option>
              <option value="2026-02">Febrero 2026</option>
              <option value="2026-03">Marzo 2026</option>
              <option value="2026-04">Abril 2026</option>
              <option value="2026-05">Mayo 2026</option>
              <option value="2026-06">Junio 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">ID / Orden</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Prenda / Artículos</th>
                <th className="py-3 px-3 text-center">Cant.</th>
                <th className="py-3 px-4 text-right">Precio Final (IVA inc.)</th>
                <th className="py-3 px-4 text-right">Margen Bruto</th>
                <th className="py-3 px-4">Canal / Ciudad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#7656D6] mb-2" />
                    Cargando transacciones de ventas...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    {/* ID / Orden */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {tx.id}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(tx.fecha).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                        {tx.cliente}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[150px]">
                        {tx.clienteEmail}
                      </span>
                    </td>

                    {/* Prenda */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[220px]" title={tx.prendasDetalle}>
                        {tx.prenda}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[220px]">
                        {tx.prendasDetalle}
                      </span>
                    </td>

                    {/* Cantidad */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                      {tx.cantidad}
                    </td>

                    {/* Precio Final */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCOP(tx.precioFinal)}
                    </td>

                    {/* Margen Bruto */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-600 block">
                        {formatCOP(tx.margenBruto)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        {tx.margenPorcentaje}%
                      </span>
                    </td>

                    {/* Canal / Ciudad */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {tx.canalCiudad}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando página <strong className="text-slate-800">{page}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong> (
            <strong className="text-slate-800">{kpis.totalTransacciones}</strong> registros totales en BD)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
