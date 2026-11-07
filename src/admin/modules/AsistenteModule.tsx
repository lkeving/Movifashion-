// Module: Asistente IA (Movi) & Base de Conocimiento Administrable
// AI satisfaction feedback, unanswered customer queries, knowledge entries CRUD

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  MessageCircle,
} from 'lucide-react';
import { KnowledgeEntry } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const AsistenteModule: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);

  // Form State
  const [categoryInput, setCategoryInput] = useState('Envíos y Cobertura');
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssistantData = async () => {
    setIsLoading(true);
    try {
      const [resMet, resKb] = await Promise.all([
        authFetch('/api/admin/assistant/metrics'),
        authFetch('/api/admin/assistant/knowledge'),
      ]);
      if (resMet.ok) setMetrics(await resMet.json());
      if (resKb.ok) setKnowledge(await resKb.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistantData();
  }, []);

  const openCreateModal = () => {
    setEditingEntry(null);
    setCategoryInput('Envíos y Cobertura');
    setTitleInput('');
    setContentInput('');
    setShowModal(true);
  };

  const openEditModal = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setCategoryInput(entry.categoria);
    setTitleInput(entry.titulo);
    setContentInput(entry.contenido);
    setShowModal(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !contentInput) return;
    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await authFetch(`/api/admin/assistant/knowledge/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoria: categoryInput,
            titulo: titleInput,
            contenido: contentInput,
          }),
        });
      } else {
        await authFetch('/api/admin/assistant/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoria: categoryInput,
            titulo: titleInput,
            contenido: contentInput,
          }),
        });
      }
      setShowModal(false);
      await fetchAssistantData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('¿Eliminar esta entrada de la base de conocimiento?')) return;
    try {
      await authFetch(`/api/admin/assistant/knowledge/${id}`, { method: 'DELETE' });
      await fetchAssistantData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Satisfacción del Asistente
            </span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <span>{metrics.satisfactionRate}%</span>
              <ThumbsUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {metrics.thumbsUpCount} opiniones positivas vs {metrics.thumbsDownCount} negativas
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Consultas Atendidas
            </span>
            <div className="text-2xl font-black text-[#7656D6] flex items-center gap-2">
              <span>{metrics.totalQueriesAnswered}</span>
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">En tiempo real vía RAG y catálogo</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Preguntas sin Respuesta
            </span>
            <div className="text-2xl font-black text-amber-600">
              {metrics.unansweredQueries?.length || 0} temas
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Oportunidades de entrenar la base</p>
          </div>
        </div>
      )}

      {/* Knowledge Base Manager */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7656D6]" />
              Base de Conocimiento de la Tienda ({knowledge.length} entradas)
            </h3>
            <p className="text-xs text-slate-500">
              Estas entradas alimentan las respuestas automáticas de &quot;Movi&quot; sobre envíos, pagos y políticas.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Entrada</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {knowledge.map(entry => (
            <div key={entry.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                    {entry.categoria}
                  </span>
                  <span className="font-bold text-slate-900">{entry.titulo}</span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{entry.contenido}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(entry)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear / Editar Entrada */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative text-xs">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {editingEntry ? 'Editar Entrada de Conocimiento' : 'Nueva Entrada de Conocimiento'}
            </h3>
            <p className="text-slate-500 mb-4">
              El chatbot usará esta información como contexto prioritario ante preguntas de clientes.
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="Envíos y Cobertura">Envíos y Cobertura</option>
                  <option value="Medios de Pago">Medios de Pago</option>
                  <option value="Cambios y Garantías">Cambios y Garantías</option>
                  <option value="Guía de Tallas">Guía de Tallas</option>
                  <option value="Empresa y Legal">Empresa y Legal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la Entrada *</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las tarifas y tiempos de envío a Medellín?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contenido de la Respuesta *</label>
                <textarea
                  rows={4}
                  required
                  value={contentInput}
                  onChange={e => setContentInput(e.target.value)}
                  placeholder="Explicación detallada y precisa..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Entrada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
