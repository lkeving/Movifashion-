// Module: Asistente IA (Movi) & Base de Conocimiento Administrable
// AI satisfaction feedback, unanswered customer queries, knowledge entries CRUD

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ThumbsUp,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  MessageCircle,
  Send,
  RotateCcw,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { KnowledgeEntry, Product } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';
import { SafeProductImage } from '../../components/SafeProductImage.tsx';

interface AdminChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
  suggestions?: string[];
}

const INITIAL_ASSISTANT_MESSAGE: AdminChatMessage = {
  role: 'assistant',
  content:
    '¡Hola! Soy **Movi IA** conectada en vivo con Gemini y el catálogo real de MoviFashion. Puedes probar consultas de clientes sobre prendas, tallas, envíos o medios de pago.',
  suggestions: [
    '¿Qué chaquetas recomiendas para clima frío?',
    '¿Cuáles son los medios de pago?',
    'Tiempos de envío a Medellín',
  ],
};

function renderSafeChatSegment(text: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)]*\))/g;
  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          className="inline-flex items-center gap-0.5 font-bold text-[#7656D6] underline hover:text-[#5b3ec0]"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderSafeChatText(content: string): React.ReactNode {
  return content.split('\n').map((line, idx) => (
    <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
      {renderSafeChatSegment(line)}
    </p>
  ));
}

export const AsistenteModule: React.FC<{ origin?: 'all' | 'real' | 'simulado' }> = ({
  origin = 'all',
}) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // Form State
  const [categoryInput, setCategoryInput] = useState('Envíos y Cobertura');
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Gemini Chat State
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const fetchAssistantData = async () => {
    setIsLoading(true);
    try {
      const [resMet, resKb] = await Promise.all([
        authFetch(`/api/admin/assistant/metrics?origin=${origin}`),
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
  }, [origin]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const sendChatMessage = async (textOverride?: string) => {
    const text = (textOverride ?? chatInput).trim();
    if (!text || isChatLoading) return;

    setChatError('');
    if (!textOverride) setChatInput('');

    const userMsg: AdminChatMessage = { role: 'user', content: text };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setIsChatLoading(true);

    try {
      const historyPayload = nextMessages
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await authFetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChatError(data.error || 'No fue posible obtener respuesta del asistente.');
        return;
      }

      const assistantMsg: AdminChatMessage = {
        role: 'assistant',
        content: data.reply || 'No se recibió contenido de respuesta.',
        recommendedProducts: Array.isArray(data.recommendedProducts) ? data.recommendedProducts : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setChatError('Error de conexión con el servicio de Movi IA.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetChat = () => {
    setChatMessages([INITIAL_ASSISTANT_MESSAGE]);
    setChatError('');
    setChatInput('');
  };

  const openCreateModal = (prefillTitle = '') => {
    setActionError('');
    setEditingEntry(null);
    setCategoryInput('Envíos y Cobertura');
    setTitleInput(prefillTitle);
    setContentInput('');
    setShowModal(true);
  };

  const openEditModal = (entry: KnowledgeEntry) => {
    setActionError('');
    setEditingEntry(entry);
    setCategoryInput(entry.categoria);
    setTitleInput(entry.titulo);
    setContentInput(entry.contenido);
    setShowModal(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim()) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      const res = editingEntry
        ? await authFetch(`/api/admin/assistant/knowledge/${editingEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              categoria: categoryInput,
              titulo: titleInput.trim(),
              contenido: contentInput.trim(),
            }),
          })
        : await authFetch('/api/admin/assistant/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              categoria: categoryInput,
              titulo: titleInput.trim(),
              contenido: contentInput.trim(),
            }),
          });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo guardar la entrada.');
        return;
      }
      setShowModal(false);
      await fetchAssistantData();
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al guardar la entrada.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setActionError('');
    try {
      const res = await authFetch(`/api/admin/assistant/knowledge/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo eliminar la entrada.');
        return;
      }
      setConfirmDeleteId(null);
      await fetchAssistantData();
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al eliminar la entrada.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {actionError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-bold">Cerrar</button>
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rendimiento del Asistente Virtual
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                metrics.dataSource === 'REAL'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              Origen: {metrics.dataSource || 'SIMULADO'}
            </span>
          </div>

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
                {metrics.thumbsUpCount} resueltas vs {metrics.thumbsDownCount} sin resolver
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
              <p className="text-[11px] text-slate-400 mt-1">En tiempo real vía RAG, Gemini y catálogo</p>
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
        </div>
      )}

      {/* Live Conversational Gemini Chat Panel */}
      <div className="p-5 bg-white rounded-2xl border border-purple-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7656D6] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Chat en Vivo con Movi IA (Gemini)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                  CONECTADO
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Prueba respuestas conversacionales reales con contexto de catálogo, base de conocimiento y políticas de la tienda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChat}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva conversación</span>
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-400 font-semibold">Pruebas rápidas:</span>
          {[
            '¿Qué chaquetas recomiendas para clima frío?',
            '¿Cuáles son los medios de pago?',
            'Tiempos de envío a Medellín',
          ].map(promptText => (
            <button
              key={promptText}
              type="button"
              disabled={isChatLoading}
              onClick={() => sendChatMessage(promptText)}
              className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7656D6] font-semibold transition disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat conversation thread */}
        <div
          ref={chatScrollRef}
          className="h-80 overflow-y-auto bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs"
        >
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-[#7656D6] text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  renderSafeChatText(msg.content)
                )}
              </div>

              {msg.role === 'assistant' && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-[90%]">
                  {msg.recommendedProducts.slice(0, 3).map(prod => (
                    <div
                      key={prod.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <SafeProductImage
                        src={prod.images?.[0] || ''}
                        alt={prod.name}
                        productName={prod.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate text-[11px]">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{prod.category}</span>
                        <span className="text-[11px] font-mono font-bold text-[#7656D6]">
                          ${(prod.discountPrice || prod.price).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && idx === chatMessages.length - 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => sendChatMessage(sug)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 text-[11px] font-semibold text-[#7656D6] hover:bg-purple-50 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs px-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7656D6]" />
              <span>Movi IA está redactando una respuesta...</span>
            </div>
          )}
        </div>

        {chatError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {chatError}
          </div>
        )}

        <form
          onSubmit={e => {
            e.preventDefault();
            sendChatMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Escribe una pregunta como cliente para probar Movi IA..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            {isChatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Enviar</span>
          </button>
        </form>
      </div>

      {/* Frequent Topics & Unanswered Queries */}
      {metrics && (metrics.frequentTopics?.length > 0 || metrics.unansweredQueries?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7656D6]" />
              Temas Más Consultados
            </h4>
            <div className="divide-y divide-slate-100">
              {(metrics.frequentTopics || []).map((t: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-slate-700 capitalize">{t.topic}</span>
                  <span className="font-mono font-bold text-[#7656D6]">{t.count} consultas</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">
              Oportunidades para Base de Conocimiento
            </h4>
            {(!metrics.unansweredQueries || metrics.unansweredQueries.length === 0) ? (
              <p className="text-slate-400 py-4">No hay consultas pendientes sin respuesta en este origen.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.unansweredQueries.map((u: any, idx: number) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium">{u.query}</span>
                    <button
                      type="button"
                      onClick={() => openCreateModal(u.query)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] shrink-0 transition"
                    >
                      + Entrenar
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            onClick={() => openCreateModal()}
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
                {confirmDeleteId === entry.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
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
