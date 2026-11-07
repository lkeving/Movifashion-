import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Link } from 'react-router-dom';
import { Home, Layers, Sparkles, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F5F8] px-4 py-16">
      <Seo
        title="Página no encontrada (404)"
        description={`La página que buscas no existe o ha sido movida. Explora el catálogo de ${EMPRESA.nombreComercial}.`}
      />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#7656D6] flex items-center justify-center mx-auto text-2xl font-black font-mono">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#30234F] tracking-tight">
            Página No Encontrada
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            La ruta a la que intentas acceder no existe, ha cambiado de enlace o la prenda ya no está disponible.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Volver a la Página Principal</span>
          </Link>

          <Link
            to="/catalogo"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Explorar el Catálogo</span>
          </Link>

          <Link
            to="/nueva-coleccion"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7656D6] text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ver Nueva Colección</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
