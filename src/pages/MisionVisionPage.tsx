import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Compass, Eye, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MisionVisionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Misión y Visión — Pilares Corporativos"
        description={`Conoce los pilares estratégicos, la misión y la visión corporativa de ${EMPRESA.nombreComercial} en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Misión y Visión', path: '/mision-vision' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Direccionamiento Estratégico
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Misión, Visión y Valores
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            El compromiso de {EMPRESA.razonSocial} con la industria de la moda, la innovación tecnológica y el servicio honesto en Colombia.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Misión */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9E2FA] text-[#7656D6] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#30234F]">Nuestra Misión</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Diseñar, producir y comercializar prendas contemporáneas y calzado que conjuguen confort, longevidad y vanguardia estética, brindando a cada cliente en Colombia una experiencia de compra asistida, transparente y segura, sustentada en el talento manufacturero local y la tecnología inteligente.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#30234F]">Nuestra Visión</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Para el año 2030, ser el referente colombiano de moda urbana y smart shopping en Latinoamérica, reconocidos por la excelencia de nuestros textiles, la eficiencia logística de entregas a nivel nacional y la aplicación ética de herramientas de inteligencia artificial centradas en la satisfacción del consumidor.
            </p>
          </div>

        </div>

        {/* Strategic Pillars */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <h2 className="text-xl font-bold text-[#30234F] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#7656D6]" />
            Nuestros Pilares Fundamentales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-sm">Respeto al Consumidor</strong>
                <span>Claridad absoluta en precios con IVA incluido, políticas de cambio sin rodeos y atención cordial.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-sm">Manufactura Consciente</strong>
                <span>Procesos de corte y confección que minimizan el desperdicio textil y valoran el trabajo de operarios locales.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-sm">Innovación Práctica</strong>
                <span>Herramientas digitales diseñadas para resolver dudas reales: cómo luce el producto, cómo combina y qué talla calza mejor.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-sm">Compromiso Legal</strong>
                <span>Cumplimiento riguroso de normativas tributarias DIAN, protección al consumidor SIC y protección de datos Ley 1581.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
