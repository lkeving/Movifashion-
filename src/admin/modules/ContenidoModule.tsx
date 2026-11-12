// Module: Gestor de Contenido (CMS) & Versiones
// Content pages editor, version rollback, FAQ, size guides, newsletter subscribers export

import React, { useState, useEffect } from 'react';
import {
  FileText,
  History,
  RotateCcw,
  Check,
  Edit3,
  Download,
  Users,
  Loader2,
  X,
} from 'lucide-react';
import { ContentPage } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const ContenidoModule: React.FC = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageMeta, setPageMeta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/cms/pages');
      if (res.ok) {
        setPages(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openPageEditor = async (slug: string) => {
    setIsLoading(true);
    setConfirmRestoreVersion(null);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/cms/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPage(data);
        setPageTitle(data.page.titulo);
        setPageContent(data.page.contenido);
        setPageMeta(data.page.metaDescripcion || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/cms/pages/${selectedPage.page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pageTitle,
          contenido: pageContent,
          metaDescripcion: pageMeta,
        }),
      });
      if (res.ok) {
        await fetchPages();
        await openPageEditor(selectedPage.page.slug);
        setStatusMsg({ type: 'success', text: 'Nueva versión guardada correctamente.' });
      } else {
        setStatusMsg({ type: 'error', text: 'No se pudo guardar la página.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Error de conexión al guardar la página.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    if (!selectedPage) return;
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/cms/pages/${selectedPage.page.slug}/restore/${version}`, {
        method: 'POST',
      });
      if (!res.ok) {
        setStatusMsg({ type: 'error', text: 'No se pudo restaurar la versión.' });
        return;
      }
      setConfirmRestoreVersion(null);
      await fetchPages();
      await openPageEditor(selectedPage.page.slug);
      setStatusMsg({ type: 'success', text: `Versión v${version} restaurada.` });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Error de conexión al restaurar la versión.' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#7656D6]" />
            Páginas Institucionales y Legales
          </h3>
          <p className="text-xs text-slate-500">
            Control de versiones y editor de textos legales y corporativos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Pages List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Páginas del Sitio ({pages.length})
          </span>
          <div className="space-y-1">
            {pages.map(p => (
              <button
                key={p.slug}
                onClick={() => openPageEditor(p.slug)}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  selectedPage?.page.slug === p.slug
                    ? 'bg-purple-50 text-[#7656D6] border border-purple-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{p.titulo}</span>
                <span className="text-[10px] text-slate-400 font-mono">v{p.versionActual}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Editor & Version Rollback */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          {selectedPage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-mono">
                    /{selectedPage.page.slug}
                  </h4>
                  <span className="text-slate-400 text-[11px]">
                    Versión actual: v{selectedPage.page.versionActual} · Editada por {selectedPage.page.updatedBy || 'Administrador'}
                  </span>
                </div>

                <button
                  onClick={handleSavePage}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Nueva Versión</span>
                </button>
              </div>

              {statusMsg && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la Página</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={e => setPageTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción SEO (Meta)</label>
                <input
                  type="text"
                  value={pageMeta}
                  onChange={e => setPageMeta(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contenido de la Página</label>
                <textarea
                  rows={8}
                  value={pageContent}
                  onChange={e => setPageContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-sans text-xs leading-relaxed"
                />
              </div>

              {/* Version History Drawer */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Historial de Versiones Anteriores ({selectedPage.versions?.length || 0})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedPage.versions?.map((ver: any) => (
                    <div
                      key={ver.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">Versión v{ver.version}</span>
                        <span className="text-slate-400 text-[10px] ml-2">
                          {new Date(ver.createdAt).toLocaleString('es-CO')} por {ver.createdBy}
                        </span>
                      </div>
                      {confirmRestoreVersion === ver.version ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRestoreVersion(ver.version)}
                            className="px-2 py-1 text-[11px] font-bold bg-[#7656D6] text-white rounded-lg"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmRestoreVersion(null)}
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-200 text-slate-700 rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRestoreVersion(ver.version)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#7656D6] hover:bg-purple-100/50 rounded-lg transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restaurar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Selecciona una página de la lista para editar su contenido y consultar versiones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
