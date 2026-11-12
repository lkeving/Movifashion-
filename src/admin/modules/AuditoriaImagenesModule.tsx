// Módulo 11: Auditoría de Imágenes del Catálogo y Storage
// Análisis de pesos, dimensiones, accesibilidad y reemplazo asistido

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Search,
  ExternalLink,
  Edit,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';
import { SafeProductImage } from '../../components/SafeProductImage.tsx';

interface ImageAuditItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  colorName: string;
  url: string;
  pesoKB: number;
  dimensiones: string;
  hasAlt: boolean;
  status: 'OK' | 'falta' | 'muy_pesada' | 'sin_alt';
}

interface AuditSummary {
  total: number;
  ok: number;
  pesadas: number;
  faltantes: number;
  sinAlt: number;
}

export const AuditoriaImagenesModule: React.FC = () => {
  const [images, setImages] = useState<ImageAuditItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({
    total: 0,
    ok: 0,
    pesadas: 0,
    faltantes: 0,
    sinAlt: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'OK' | 'muy_pesada' | 'falta' | 'sin_alt'>('all');
  const [search, setSearch] = useState('');

  // Replace modal
  const [selectedImage, setSelectedImage] = useState<ImageAuditItem | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/images/audit');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
        setSummary(data.summary || { total: 0, ok: 0, pesadas: 0, faltantes: 0, sinAlt: 0 });
      }
    } catch (err) {
      console.error('Error fetching image audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !newImageUrl.trim()) return;

    setIsReplacing(true);
    setStatusBanner(null);
    try {
      const res = await authFetch('/api/admin/images/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedImage.productId,
          oldUrl: selectedImage.url,
          newUrl: newImageUrl.trim(),
          colorName: selectedImage.colorName === 'Principal' ? undefined : selectedImage.colorName,
        }),
      });

      if (res.ok) {
        setStatusBanner({ type: 'success', text: 'Imagen actualizada y sincronizada en el catálogo.' });
        setTimeout(() => setStatusBanner(null), 4000);
        setSelectedImage(null);
        setNewImageUrl('');
        await fetchAudit();
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusBanner({ type: 'error', text: err.error || 'Error al actualizar imagen.' });
      }
    } catch (err) {
      console.error(err);
      setStatusBanner({ type: 'error', text: 'Error de conexión al reemplazar imagen.' });
    } finally {
      setIsReplacing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Producto', 'Categoría', 'Color', 'URL', 'Peso_KB', 'Dimensiones', 'Alt_Presente', 'Estado'];
    const rows = images.map(img => [
      `"${img.id}"`,
      `"${img.productName.replace(/"/g, '""')}"`,
      `"${img.category}"`,
      `"${img.colorName}"`,
      `"${img.url}"`,
      img.pesoKB,
      `"${img.dimensiones}"`,
      img.hasAlt ? 'SI' : 'NO',
      img.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_imagenes_movifashion_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered dataset
  const filtered = images.filter(img => {
    const matchStatus = statusFilter === 'all' || img.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      img.productName.toLowerCase().includes(q) ||
      img.category.toLowerCase().includes(q) ||
      img.colorName.toLowerCase().includes(q) ||
      img.url.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#7656D6] text-white tracking-wider uppercase font-mono">
              Módulo 11
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Auditoría de Imágenes ({summary.total} recursos)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspección de pesos, resoluciones y atributos de accesibilidad para optimizar el rendimiento y SEO.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAudit}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer"
            title="Reanalizar recursos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#7656D6]' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Diagnóstico (CSV)</span>
          </button>
        </div>
      </div>

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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition ${
            statusFilter === 'all' ? 'border-[#7656D6] ring-2 ring-purple-100 shadow-sm' : 'border-slate-200/90'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Analizadas
          </span>
          <span className="text-2xl font-black text-slate-900">{summary.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter('OK')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition ${
            statusFilter === 'OK' ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-sm' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Óptimas (OK)</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{summary.ok}</span>
        </div>

        <div
          onClick={() => setStatusFilter('muy_pesada')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition ${
            statusFilter === 'muy_pesada' ? 'border-amber-500 ring-2 ring-amber-100 shadow-sm' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pesadas (&gt;200 KB)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{summary.pesadas}</span>
        </div>

        <div
          onClick={() => setStatusFilter('falta')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition ${
            statusFilter === 'falta' ? 'border-rose-500 ring-2 ring-rose-100 shadow-sm' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Faltantes</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600">{summary.faltantes}</span>
        </div>

        <div
          onClick={() => setStatusFilter('sin_alt')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition ${
            statusFilter === 'sin_alt' ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Sin Texto Alt</span>
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-blue-600">{summary.sinAlt}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por prenda, categoría o URL..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#7656D6] transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Mostrando <strong>{filtered.length}</strong> de {images.length} imágenes
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-20 text-center">Vista</th>
                <th className="py-3 px-4">Prenda / Modelo</th>
                <th className="py-3 px-4">Variante</th>
                <th className="py-3 px-4">Dimensiones</th>
                <th className="py-3 px-4 text-right">Peso (KB)</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#7656D6] mb-2" />
                    Analizando recursos multimedia en Storage...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron imágenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map(img => (
                  <tr key={img.id} className="hover:bg-slate-50/70 transition">
                    {/* Thumbnail */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden mx-auto border border-slate-200 shrink-0">
                        <SafeProductImage
                          src={img.url}
                          alt={img.productName}
                          fallbackSrc="/images/hero_fashion_editorial.jpg"
                          productName={img.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Prenda */}
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                        {img.productName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {img.category} · {img.productId}
                      </span>
                    </td>

                    {/* Variante */}
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {img.colorName}
                      </span>
                    </td>

                    {/* Dimensiones */}
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                      {img.dimensiones}
                    </td>

                    {/* Peso */}
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      <span className={img.pesoKB > 200 ? 'text-amber-600' : 'text-slate-800'}>
                        {img.pesoKB} KB
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-2.5 px-4 text-center">
                      {img.status === 'OK' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          OK
                        </span>
                      )}
                      {img.status === 'muy_pesada' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          &gt; 200 KB
                        </span>
                      )}
                      {img.status === 'falta' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          FALTA
                        </span>
                      )}
                      {img.status === 'sin_alt' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                          <ImageIcon className="w-3 h-3" />
                          SIN ALT
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedImage(img);
                          setNewImageUrl(img.url);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7656D6] hover:bg-[#6042be] text-white font-bold text-[11px] transition cursor-pointer"
                        title="Reemplazar o regenerar imagen"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Reemplazar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replace Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Reemplazar Recurso de Imagen
            </h3>
            <p className="text-slate-500 mb-4">
              Prenda: <strong className="text-slate-800">{selectedImage.productName}</strong> (Variante: {selectedImage.colorName})
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Actual:
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedImage.url}
                  className="w-full px-3 py-2 bg-slate-100 text-slate-500 font-mono text-[11px] rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nueva URL o Ruta Relativa (/images/...):
                </label>
                <input
                  type="text"
                  required
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="/images/nueva_foto.jpg o https://..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#7656D6] transition"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Se actualizará automáticamente en el catálogo y en la base de datos Supabase.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReplacing || !newImageUrl.trim() || newImageUrl === selectedImage.url}
                  className="px-5 py-2 bg-[#7656D6] hover:bg-[#6344be] text-white font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {isReplacing ? 'Actualizando...' : 'Guardar y Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
