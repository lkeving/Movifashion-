// Module: Finanzas e Impuestos (IVA 19% Colombia & DIAN)
// Tax base, VAT collected, gross/net reconciliation, monthly fiscal report, CSV export

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  Calendar,
  FileCheck,
  Percent,
  Receipt,
  Loader2,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';

export const FinanzasModule: React.FC<{ origin?: 'all' | 'real' | 'simulado' }> = ({
  origin = 'all',
}) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/admin/finance/summary?origin=${origin}`);
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
    fetchFinance();
  }, [origin]);

  const handleExportFiscalCSV = () => {
    if (!data || !data.monthlyReport) return;
    const headers = 'Mes,Ventas Brutas COP,Base Gravable Neta COP,IVA 19% Generado COP,Pedidos';
    const rows = data.monthlyReport.map(
      (m: any) => `${m.month},${m.gross},${m.net},${m.iva},${m.orders}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-fiscal-dian-iva19-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Consolidando liquidación tributaria...</span>
      </div>
    );
  }

  const { summary, monthlyReport } = data;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#7656D6]" />
            Consolidado Fiscal y Liquidación de IVA (19%)
          </h3>
          <p className="text-xs text-slate-500">
            Cálculo conforme al Estatuto Tributario y normatividad comercial colombiana.
          </p>
        </div>

        <button
          onClick={handleExportFiscalCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Informe DIAN (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Facturado Bruto
          </span>
          <div className="text-xl font-black text-slate-900 font-mono">
            ${summary.grossSales.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Incluye IVA y fletes</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Base Gravable Neta
          </span>
          <div className="text-xl font-black text-[#7656D6] font-mono">
            ${summary.netSales.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ingreso real antes de IVA</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            IVA Generado (Tarifa 19%)
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono">
            ${summary.iva19.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Pasivo fiscal por enterar</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Fletes de Envío Facturados
          </span>
          <div className="text-xl font-black text-slate-700 font-mono">
            ${summary.shippingTotal.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Servicio de transporte nacional</span>
        </div>
      </div>

      {/* Monthly Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Liquidación Mensual de IVA para Declaración Bimestral / Cuatrimestral
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Periodo (Mes)</th>
                <th className="py-2.5 px-3 text-right">Facturación Bruta</th>
                <th className="py-2.5 px-3 text-right">Base Gravable Neta</th>
                <th className="py-2.5 px-3 text-right">IVA 19% Generado</th>
                <th className="py-2.5 px-3 text-center">Pedidos</th>
                <th className="py-2.5 px-3 text-right">Estado Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyReport.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay facturación registrada para el origen de datos seleccionado.
                  </td>
                </tr>
              ) : (
                monthlyReport.map((m: any) => (
                  <tr key={m.month} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-800 font-mono">{m.month}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 font-semibold">
                      ${m.gross.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#7656D6] font-bold">
                      ${m.net.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">
                      ${m.iva.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{m.orders}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Conciliado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
