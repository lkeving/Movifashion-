import React, { useState } from 'react';
import { Truck, ShieldCheck, X } from 'lucide-react';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';

export const TopBanner: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('movifashion_top_banner_dismissed') !== 'true';
  });

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('movifashion_top_banner_dismissed', 'true');
  };

  return (
    <div className="bg-[#211832] text-white text-[12px] sm:text-[13px] py-1.5 px-3 border-b border-purple-950/40 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-6 font-medium text-center truncate">
          <span className="flex items-center gap-1.5 shrink-0 text-[#C7B5F8]">
            <Truck className="w-3.5 h-3.5" />
            <span>Envío gratis a toda Colombia desde {formatCOP(EMPRESA.umbralEnvioGratis)}</span>
          </span>
          <span className="hidden md:inline-block text-purple-300/40">·</span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-300 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Precios con IVA 19% incluido · Garantía directa de {EMPRESA.diasGarantiaLegal} días</span>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-purple-300/70 hover:text-white p-0.5 rounded transition-colors shrink-0"
          title="Ocultar anuncio"
          aria-label="Ocultar anuncio"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
