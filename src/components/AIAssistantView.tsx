import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShoppingBag, Eye, Bot, User as UserIcon, Shield, Loader2, ArrowRight } from 'lucide-react';
import { Product, IAMessage } from '../types';
import { SafeProductImage } from './SafeProductImage';
import { authFetch } from '../utils/api';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';
import { Seo } from './Seo.tsx';

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
      text: `¡Hola! Bienvenido a ${EMPRESA.nombreComercial}. Soy Movi, tu asesor de moda y compras. ¿Buscas un look para una ocasión especial, quieres combinar una prenda, o tienes dudas sobre envíos, tallas y políticas? Con mucho gusto te ayudo.`,
      timestamp: 'Ahora',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '¿Cuánto tarda el envío?',
    '¿Cómo elijo mi talla?',
    '¿Cómo rastreo mi pedido?',
    '¿Tienen contraentrega?',
    '👟 Tenis para caminar menos de $250.000',
    '🧥 Blazer elegante en tonos oscuros',
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
      // Build conversation history (last 10 messages)
      const history = [...messages.slice(-9), userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await authFetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) throw new Error('Error en el servicio del asistente');

      const data = await res.json();

      const botMsg: IAMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Con gusto te asesoro. Aquí tienes las opciones verificadas para ti:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: data.recommendedProducts || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackMsg: IAMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `En ${EMPRESA.nombreComercial} te ofrecemos envíos a toda Colombia (gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)}), pago contraentrega, cambios durante ${EMPRESA.diasCambioComercial} días y garantía legal de ${EMPRESA.diasGarantiaLegal} días. Si deseas rastrear un pedido, facilítame tu número de orden (ej: ORD-1234).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[520px] bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden my-4 sm:my-8">
      <Seo
        title="Asistente Virtual Movi — Tu Asesor de Estilo"
        description={`Conversa con Movi, el asistente inteligente de ${EMPRESA.nombreComercial}. Recomendaciones de moda, verificación de tallas y seguimiento de pedidos en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Asistente Movi', path: '/asistente' },
        ]}
      />

      {/* Header of Assistant */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#30234F] to-[#7656D6] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Sparkles className="w-5 h-5 text-[#E9E2FA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">Movi — Asesor Inteligente</h2>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                En línea
              </span>
            </div>
            <p className="text-[11px] text-[#E9E2FA]/80">
              Moda contemporánea, tallas, envíos y compras asistidas en Colombia
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-medium">
          <Shield className="w-3 h-3" />
          <span>Base de Conocimiento Verificada</span>
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

              {/* Message Bubble */}
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#30234F] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Recommended Products Carousel/Grid inside Assistant response */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            <SafeProductImage
                              src={prod.images[0]}
                              fallbackSrc="/images/hero_fashion_editorial.jpg"
                              alt={prod.name}
                              productName={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-purple-700 font-bold uppercase block">{prod.category}</span>
                            <h4 className="text-xs font-bold text-[#30234F] truncate">{prod.name}</h4>
                            <span className="text-xs font-black text-[#7656D6] tabular-nums block mt-0.5">
                              {formatCOP(prod.discountPrice || prod.price)}
                            </span>
                            <span className="text-[9px] text-slate-400">IVA incluido</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver prenda</span>
                          </button>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#7656D6] hover:bg-[#30234F] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Comprar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">
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
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 text-[#7656D6] animate-spin" />
              <span>Movi está consultando el catálogo y la base de conocimiento...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Preguntas Rápidas:</span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] font-medium text-slate-600 hover:text-[#7656D6] hover:bg-purple-50 px-3 py-1 rounded-full border border-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer"
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
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu consulta (ej: '¿Tienen pago contraentrega en Bogotá?' o '¿Cómo rastreo mi pedido?')..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-[#F5F5F8] border border-transparent focus:border-[#7656D6] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
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
