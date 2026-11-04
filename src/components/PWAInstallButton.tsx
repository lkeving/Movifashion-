import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-full font-medium transition-colors ${
          compact
            ? 'p-2 text-xs text-[#7656D6] hover:bg-[#E9E2FA]'
            : 'bg-[#7656D6] hover:bg-[#30234F] text-white px-3 py-1.5 text-xs shadow-sm'
        }`}
        title="Instalar MOVIFASHION AI en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-[#E9E2FA] px-2.5 py-1 text-xs font-medium text-[#7656D6] hover:bg-[#E9E2FA]/50 transition-colors"
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">App iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E9E2FA]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-[#30234F]">Instalar en iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-gray-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9E2FA] text-[11px] font-bold text-[#7656D6]">1</span>
                  <p>Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9E2FA] text-[11px] font-bold text-[#7656D6]">2</span>
                  <p>Desplázate hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9E2FA] text-[11px] font-bold text-[#7656D6]">3</span>
                  <p>Confirma tocando <strong>Agregar</strong> en la esquina superior derecha.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#7656D6] py-2 text-xs font-semibold text-white hover:bg-[#30234F] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
