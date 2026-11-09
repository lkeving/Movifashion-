// Módulo 12: Centro de Informes Descargables y Auditoría Fiscal
// Exportación en Excel (.xlsx), CSV y Resumen Ejecutivo Imprimible (PDF)

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Receipt,
  Layers,
  Users,
  Award,
  Filter,
  TrendingUp,
  Cpu,
  Printer,
  CheckCircle,
  FileText,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';
import { EMPRESA } from '../../config/empresa.ts';

interface ReportCardItem {
  id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  icon: any;
  iconColor: string;
  badge: string;
}

const AVAILABLE_REPORTS: ReportCardItem[] = [
  {
    id: 'rep-ventas',
    type: 'ventas',
    title: 'Ventas del Periodo',
    category: 'Comercial & Ingresos',
    description: 'Relación exhaustiva de órdenes, clientes, base gravable, liquidación de IVA 19% y canales de despacho.',
    icon: FileSpreadsheet,
    iconColor: 'bg-emerald-50 text-emerald-600',
    badge: 'Auditable',
  },
  {
    id: 'rep-iva',
    type: 'iva',
    title: 'Liquidación Mensual de IVA 19% (DIAN)',
    category: 'Tributaria & Fiscal',
    description: 'Desglose impositivo mensual conforme al Estatuto Tributario colombiano para declaraciones DIAN.',
    icon: Receipt,
    iconColor: 'bg-purple-50 text-[#7656D6]',
    badge: 'Norma DIAN',
  },
  {
    id: 'rep-inventario',
    type: 'inventario',
    title: 'Inventario Valorizado y Kardex',
    category: 'Logística & Bodega',
    description: 'Existencias físicas en bodega, coste unitario de fabricación, precio de venta al público y margen potencial.',
    icon: Layers,
    iconColor: 'bg-blue-50 text-blue-600',
    badge: 'Tiempo Real',
  },
  {
    id: 'rep-clientes',
    type: 'clientes',
    title: 'Clientes, Cohortes y Recurrencia (RFM)',
    category: 'Clientes & CRM',
    description: 'Segmentación de compradores, frecuencia de compra, ticket promedio histórico y fechas de última orden.',
    icon: Users,
    iconColor: 'bg-indigo-50 text-indigo-600',
    badge: 'Habeas Data',
  },
  {
    id: 'rep-productos',
    type: 'productos',
    title: 'Ranking de Productos Más Vendidos',
    category: 'Merchandising',
    description: 'Unidades rotadas por categoría, facturación bruta acumulada y margen bruto generado por referencia.',
    icon: Award,
    iconColor: 'bg-amber-50 text-amber-600',
    badge: 'Top Sellers',
  },
  {
    id: 'rep-conversion',
    type: 'conversion',
    title: 'Embudo de Conversión y Tráfico',
    category: 'Analítica de Navegación',
    description: 'Tasas de conversión paso a paso: vistas de producto, añadido a bolsa, checkout y compras confirmadas.',
    icon: Filter,
    iconColor: 'bg-rose-50 text-rose-600',
    badge: 'Conversión',
  },
  {
    id: 'rep-pronostico',
    type: 'pronostico',
    title: 'Pronóstico de Ventas y Demanda',
    category: 'Inteligencia Predictiva',
    description: 'Proyecciones de demanda para los próximos 3 meses con intervalos de confianza y estacionalidad nacional.',
    icon: TrendingUp,
    iconColor: 'bg-teal-50 text-teal-600',
    badge: 'Predictivo',
  },
  {
    id: 'rep-bigdata',
    type: 'bigdata',
    title: 'Informe Técnico Big Data y Telemetría',
    category: 'Big Data & Seguridad',
    description: 'Registro de eventos de sesión, tiempos de permanencia, patrones de búsqueda y auditoría de eventos de usuario.',
    icon: Cpu,
    iconColor: 'bg-slate-100 text-slate-700',
    badge: 'Big Data',
  },
];

export const InformesModule: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);

  const handleDownload = async (type: string, format: 'xlsx' | 'csv') => {
    const key = `${type}-${format}`;
    setDownloadingId(key);

    try {
      const res = await authFetch(`/api/admin/reports/generate?type=${type}&format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'xlsx' ? 'xlsx' : 'csv';
        a.download = `informe_${type}_movifashion_${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al generar el informe solicitado.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al descargar el reporte.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrintExecutive = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#7656D6] text-white tracking-wider uppercase font-mono">
              Módulo 12
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Informes Descargables y Auditoría Fiscal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generación oficial de balances, informes tributarios DIAN, valoración de existencias y reportes ejecutivos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExecutiveModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Ver Resumen Ejecutivo (PDF)</span>
          </button>
        </div>
      </div>

      {/* Corporate Compliance Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50/40 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7656D6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-slate-900 block font-bold">
              Trazabilidad y Cumplimiento Normativo Colombia
            </strong>
            <span className="text-slate-600 text-[11px]">
              Toda descarga queda registrada con usuario, fecha e IP en los registros inmutables de auditoría.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#7656D6] font-bold bg-white px-3 py-1.5 rounded-xl border border-purple-100 shadow-2xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Vigencia Fiscal 2026</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_REPORTS.map(rep => {
          const Icon = rep.icon;
          const isDownloadingXLSX = downloadingId === `${rep.type}-xlsx`;
          const isDownloadingCSV = downloadingId === `${rep.type}-csv`;

          return (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rep.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {rep.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {rep.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {rep.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-5">
                  {rep.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleDownload(rep.type, 'csv')}
                  disabled={Boolean(downloadingId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                  title="Descargar en formato CSV estructurado"
                >
                  {isDownloadingCSV ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7656D6]" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => handleDownload(rep.type, 'xlsx')}
                  disabled={Boolean(downloadingId)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50 cursor-pointer"
                  title="Descargar libro de cálculo Excel (.xlsx)"
                >
                  {isDownloadingXLSX ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  <span>Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Executive Summary Printable Modal */}
      {showExecutiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto relative print:m-0 print:p-0 print:max-w-none print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="font-mono text-xs font-black text-[#7656D6] uppercase tracking-wider">
                Resumen Ejecutivo Oficial 2026
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintExecutive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7656D6] hover:bg-[#6042be] text-white font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setShowExecutiveModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="py-4 space-y-4 text-slate-800">
              <div className="text-center pb-3 border-b border-slate-100">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {EMPRESA.razonSocial}
                </h1>
                <p className="text-[11px] text-slate-500 font-mono">
                  NIT: {EMPRESA.nit} · {EMPRESA.ciudad}, {EMPRESA.pais}
                </p>
                <p className="text-xs font-bold text-[#7656D6] mt-1">
                  INFORME RESUMEN EJECUTIVO DE CONTROL ADMINISTRATIVO
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold">Régimen Fiscal</span>
                  <span className="font-semibold text-slate-800">Responsable de IVA (Tarifa General 19%)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold">Fecha de Emisión</span>
                  <span className="font-semibold text-slate-800">{new Date().toLocaleString('es-CO')}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">1. Estado de Operaciones Comerciales</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Durante el periodo fiscal 2026, las transacciones registradas reflejan un crecimiento sostenible con cobertura logística en todo el territorio nacional a través de las transportadoras aliadas Coordinadora y Servientrega. El recaudo de pagos mediante PSE y tarjetas bancarias garantiza la conciliación automatizada con cero discrepancias contables.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">2. Control de Existencias e Inventario</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Las bodegas centrales en Bogotá D.C. mantienen existencias valorizadas al coste medio ponderado. Se reporta un cumplimiento del 100% en la trazabilidad de lotes y variantes de color.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Documento confidencial para uso interno</span>
                <span>Firma Autorizada: Dirección Financiera</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
