import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { RefreshCw, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DevolucionesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Cambios, Retracto y Garantías (Ley 1480 de 2011)"
        description={`Políticas de cambios de prenda, derecho de retracto y garantía legal de ${EMPRESA.nombreComercial} conforme a la legislación de protección al consumidor en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Cambios y Devoluciones', path: '/cambios-y-devoluciones' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Garantía y Satisfacción Total
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Cambios, Retracto y Garantías
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Comprar en MoviFashion es 100% seguro. Te respaldamos si la talla no te queda perfecta o si requieres hacer uso de tus derechos de consumidor.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30234F]">Cambio de Talla o Prenda</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispones de hasta <strong>{EMPRESA.diasCambioComercial} días calendario</strong> a partir de la entrega para solicitar cambio de talla o color por insatisfacción estética.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30234F]">Derecho de Retracto Legal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conforme al art. 47 Ley 1480 de 2011, tienes <strong>{EMPRESA.diasRetractoLegal} días hábiles</strong> tras recibir el producto para solicitar la reversión y devolución del dinero.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7656D6] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30234F]">Garantía por Defectos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cubrimiento de <strong>{EMPRESA.diasGarantiaLegal} días calendario</strong> por defectos de confección, costuras defectuosas o cierres de fábrica.
            </p>
          </div>
        </div>

        {/* Requirements and step-by-step */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <h2 className="text-lg font-bold text-[#30234F]">
            Requisitos para Aceptación de Cambios y Retracto
          </h2>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>La prenda debe encontrarse en su estado original: limpia, sin usar, sin lavar, sin olores y sin manchas de perfume o desodorante.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Debe conservar todas sus etiquetas originales intactas y adheridas a la prenda.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>En calzado, la suela debe estar completamente libre de pisadas o suciedad y devolverse en su caja protectora.</span>
            </li>
          </ul>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-[#30234F] mb-3">
              ¿Cómo iniciar tu solicitud?
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>Escribe a nuestra línea de WhatsApp <strong className="text-slate-800">{EMPRESA.whatsapp}</strong> o al correo <strong className="text-slate-800">{EMPRESA.correoContacto}</strong> con el asunto: "Solicitud de Cambio - Pedido [Tu número de orden]".</li>
              <li>Indica la prenda que deseas devolver, la talla que requieres y adjunta 2 fotografías nítidas donde se observe la prenda con sus etiquetas.</li>
              <li>Nuestro equipo te generará una guía de logística inversa para depositar la prenda en la oficina de transportadora más cercana.</li>
              <li>Una vez inspeccionada en bodega, se despacha la nueva talla o se procesa el reembolso bancario según aplique.</li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              ¿Deseas radicar un requerimiento formal?
            </span>
            <Link
              to="/pqrs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#7656D6] hover:bg-purple-100 text-xs font-semibold transition-colors"
            >
              <span>Ir al módulo de PQRS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
