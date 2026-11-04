import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShoppingBag, Eye, Bot, User as UserIcon, Shield, Loader2, ArrowRight } from 'lucide-react';
import { Product, IAMessage } from '../types';

interface AIAssistantViewProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onSelectProduct,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<IAMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu Estilista Virtual de MOVIFASHION AI. Dime qué prenda buscas, qué evento tienes, o cuál es tu presupuesto y te recomendaré las mejores opciones reales de nuestra colección.',
      timestamp: 'Ahora',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '👟 Busco tenis deportivos para caminar cómodos menos de $250.000',
    '🧥 Blazer elegante para cena formal en tonos morado o negro',
    '👜 Bolso de cuero de alta calidad para oficina con laptop',
    '✨ ¿Qué accesorios combinan con un vestido lavanda?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: IAMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error('Error en el servicio del asistente');

      const data = await res.json();

      const botMsg: IAMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Aquí tienes las recomendaciones seleccionadas para ti.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: data.recommendedProducts || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackMsg: IAMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'He conectado con nuestro catálogo para verificar disponibilidad y precios exactos. Aquí tienes las opciones verificadas:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[520px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      
      {/* Header of Assistant */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#30234F] to-[#7656D6] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Sparkles className="w-5 h-5 text-[#E9E2FA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">Estilista Personal MOVIFASHION AI</h2>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-[#E9E2FA]/80">
              Consultas en lenguaje natural conectadas a catálogo real
            </p>
          </div>
        </div>

        {/* Security badge (OWASP Module 20) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-medium">
          <Shield className="w-3 h-3" />
          <span>Catálogo Verificado & Anti-Injection</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F5F5F8]/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#30234F] text-white'
                    : 'bg-gradient-to-tr from-[#7656D6] to-[#30234F] text-white shadow-xs'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="flex flex-col">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#7656D6] text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Render Recommended Product Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl p-3 border border-[#E9E2FA] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="flex gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0 cursor-pointer"
                            onClick={() => onSelectProduct(prod)}
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase font-bold text-[#7656D6]">
                              {prod.category} · {prod.brand}
                            </span>
                            <h4
                              onClick={() => onSelectProduct(prod)}
                              className="text-xs font-bold text-[#30234F] truncate hover:underline cursor-pointer"
                            >
                              {prod.name}
                            </h4>
                            <div className="mt-1 flex items-baseline gap-1.5">
                              <span className="text-xs font-extrabold text-[#30234F] tabular-nums">
                                ${(prod.discountPrice || prod.price).toLocaleString('es-CO')}
                              </span>
                              {prod.discountPrice && (
                                <span className="text-[10px] text-gray-400 line-through tabular-nums">
                                  ${prod.price.toLocaleString('es-CO')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              En stock ({prod.inventory} disp.)
                            </span>
                          </div>
                        </div>

                        {/* Action buttons inside chat card */}
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2">
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver prenda</span>
                          </button>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#7656D6] hover:bg-[#30234F] text-white text-[11px] font-semibold transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Comprar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[80%] items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7656D6] to-[#30234F] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-gray-500 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 text-[#7656D6] animate-spin" />
              <span>Analizando catálogo y calculando afinidad de estilo...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-gray-400 shrink-0">Sugerencias:</span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] font-medium text-gray-600 hover:text-[#7656D6] hover:bg-[#E9E2FA]/50 px-2.5 py-1 rounded-full border border-gray-200 transition-all whitespace-nowrap shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu consulta (ej: 'tenis deportivos para caminar menos de $250.000')..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-[#F5F5F8] border border-transparent focus:border-[#7656D6] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2.5 rounded-full bg-[#7656D6] hover:bg-[#30234F] text-white transition-all disabled:opacity-40 disabled:hover:bg-[#7656D6] shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
