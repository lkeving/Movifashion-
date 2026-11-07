import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';
import { Truck, MapPin, PackageCheck, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EnviosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Tiempos y Costos de Envío en Colombia"
        description={`Conoce las tarifas y tiempos de entrega de ${EMPRESA.nombreComercial}. Envíos gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)} a toda Colombia con transportadoras certificadas.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Envíos', path: '/envios' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Logística Nacional Segura
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Envíos y Despachos en Colombia
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Llegamos a cualquier rincón de Colombia con aliados logísticos de primera línea. Embalaje protegido y número de guía con rastreo en vivo.
          </p>
        </div>

        {/* Free Shipping Banner */}
        <div className="bg-gradient-to-r from-[#30234F] to-[#7656D6] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C7B5F8]">
              Beneficio Exclusivo
            </span>
            <h2 className="text-2xl font-black">
              Envío 100% GRATIS a partir de {formatCOP(EMPRESA.umbralEnvioGratis)}
            </h2>
            <p className="text-xs text-purple-100/90">
              Aplica automáticamente al carrito en cualquier destino nacional sin código promocional.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="px-5 py-3 rounded-xl bg-white text-[#30234F] hover:bg-purple-50 font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            Ir a la Tienda
          </Link>
        </div>

        {/* Breakdown of times and rates */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
          
          <div>
            <h2 className="text-lg font-bold text-[#30234F] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7656D6]" />
              Tiempos Estimados de Entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 text-sm block">Ciudades Principales</strong>
                <p className="text-[#7656D6] font-bold text-base">2 a 3 días hábiles</p>
                <p className="text-slate-600">Bogotá D.C., Medellín, Cali, Barranquilla, Bucaramanga, Pereira, Manizales, Cartagena.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 text-sm block">Ciudades Intermedias</strong>
                <p className="text-[#7656D6] font-bold text-base">3 a 5 días hábiles</p>
                <p className="text-slate-600">Municipios con cobertura directa de Coordinadora y Servientrega.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 text-sm block">Trayectos Especiales</strong>
                <p className="text-[#7656D6] font-bold text-base">5 a 8 días hábiles</p>
                <p className="text-slate-600">San Andrés, Leticia y zonas de reexpedición fluvial o aérea.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#7656D6]" />
              Tarifas de Envío
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              - Compras iguales o superiores a <strong>{formatCOP(EMPRESA.umbralEnvioGratis)}</strong>: <strong className="text-emerald-700">¡GRATIS!</strong><br />
              - Compras inferiores a {formatCOP(EMPRESA.umbralEnvioGratis)}: Tarifa estándar fija de <strong>{formatCOP(EMPRESA.costoEnvioNacional)}</strong> a cualquier municipio de Colombia.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#7656D6]" />
              Seguimiento y Transportadoras Aliadas
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trabajamos con las principales empresas de mensajería y paquetería de Colombia: <strong>Coordinadora Mercantil, Servientrega, TCC y Envía</strong>. En el momento en que tu paquete sea recogido en nuestro centro de distribución, recibirás un correo y una notificación con el número de guía para seguir el estado en tiempo real.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
