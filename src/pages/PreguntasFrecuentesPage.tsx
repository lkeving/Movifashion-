import React, { useState } from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { BASE_CONOCIMIENTO } from '../data/conocimiento.ts';
import { Search, ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PreguntasFrecuentesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'envios-tiempos-costos': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const articulosFiltrados = BASE_CONOCIMIENTO.filter(art => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      art.titulo.toLowerCase().includes(q) ||
      (art.preguntaFrecuente && art.preguntaFrecuente.toLowerCase().includes(q)) ||
      art.resumen.toLowerCase().includes(q) ||
      art.contenido.toLowerCase().includes(q) ||
      art.palabrasClave.some(p => p.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Preguntas Frecuentes (FAQ)"
        description={`Resuelve todas tus dudas sobre pagos, envíos a Colombia, cambios de prendas y seguridad en ${EMPRESA.nombreComercial}.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Preguntas Frecuentes', path: '/preguntas-frecuentes' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Centro de Ayuda y Soporte
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Preguntas Frecuentes
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Encuentra respuestas rápidas y claras a las consultas más habituales de nuestros clientes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tema (envíos, contraentrega, tallas, devoluciones)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#7656D6] shadow-xs"
          />
        </div>

        {/* Accordion List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-3">
          {articulosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm">No encontramos respuestas coincidentes con tu búsqueda.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-[#7656D6] underline"
              >
                Limpiar búsqueda y ver todas
              </button>
            </div>
          ) : (
            articulosFiltrados.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <div
                  key={item.id}
                  className="border border-slate-100 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-[#30234F]">
                      {item.preguntaFrecuente || item.titulo}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#7656D6]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-50 bg-[#FBFBFE] leading-relaxed whitespace-pre-wrap">
                      {item.contenido}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions banner */}
        <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-bold text-sm text-[#30234F]">¿Aún tienes dudas adicionales?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Nuestro Asistente Virtual Movi o nuestro equipo de soporte humano están listos para atenderte.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/asistente"
              className="px-4 py-2.5 bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Consultar a Movi
            </Link>
            <Link
              to="/contacto"
              className="px-4 py-2.5 bg-white text-slate-800 hover:bg-purple-100/60 text-xs font-semibold rounded-xl transition-colors border border-purple-200"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
