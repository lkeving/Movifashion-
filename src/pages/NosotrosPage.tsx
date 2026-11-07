import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { ShieldCheck, Sparkles, HeartHandshake, Scissors, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NosotrosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Quiénes Somos — Nuestra Historia y Propósito"
        description={`Conoce la historia y el propósito de ${EMPRESA.nombreComercial}. Moda contemporánea con confección de alta calidad y tecnología en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Nosotros', path: '/nosotros' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Nuestra Esencia
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Quiénes Somos
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto font-normal">
            En {EMPRESA.nombreComercial} fusionamos diseño textil vanguardista, materiales de alta durabilidad y tecnología inteligente para elevar la forma en que los colombianos experimentan su estilo cotidiano.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold text-[#30234F] mb-3">
              Nuestra Historia
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fundada en Colombia bajo la razón social <strong className="text-slate-800">{EMPRESA.razonSocial}</strong>, {EMPRESA.nombreComercial} nació con la convicción de que la moda contemporánea debe responder a las exigencias reales del ritmo de vida actual: prendas versátiles, resistentes, con caída impecable y producidas con responsabilidad social en talleres que dignifican el oficio de la confección nacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FBFBFE] border border-purple-50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#30234F]">Confección Ética</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada prenda es elaborada con manos expertas en Colombia, aplicando control minucioso de costuras, hilaturas reforzadas y terminados limpios.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FBFBFE] border border-purple-50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#30234F]">Asesoría Inteligente</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integramos inteligencia artificial orientada a facilitarte la búsqueda del calce ideal, combinaciones armónicas y recomendaciones precisas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FBFBFE] border border-purple-50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#30234F]">Transparencia Legal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operamos con estricto apego al Estatuto del Consumidor (Ley 1480 de 2011), precios finales con IVA liquidado y canales claros de atención.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span>Sede principal: </span>
              <strong className="text-slate-700">{EMPRESA.ciudad}, Colombia</strong> · NIT: <strong className="text-slate-700">{EMPRESA.nit}</strong>
            </div>

            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <span>Explorar el Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
