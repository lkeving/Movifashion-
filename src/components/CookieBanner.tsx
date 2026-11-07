import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [consentState, setConsentState] = useState<'pending' | 'accepted' | 'declined' | 'configured'>('accepted');
  const [showConfig, setShowConfig] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('movifashion_cookie_consent');
    if (!saved) {
      setConsentState('pending');
    } else {
      setConsentState(saved as any);
    }
  }, []);

  if (consentState !== 'pending') return null;

  const handleAcceptAll = () => {
    localStorage.setItem('movifashion_cookie_consent', 'accepted');
    localStorage.setItem('movifashion_cookie_analytics', 'true');
    setConsentState('accepted');
  };

  const handleDeclineOptional = () => {
    localStorage.setItem('movifashion_cookie_consent', 'declined');
    localStorage.setItem('movifashion_cookie_analytics', 'false');
    setConsentState('declined');
  };

  const handleSaveConfig = () => {
    localStorage.setItem('movifashion_cookie_consent', 'configured');
    localStorage.setItem('movifashion_cookie_analytics', analyticsAllowed ? 'true' : 'false');
    setConsentState('configured');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:max-w-xl z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-5 text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-slate-900 mb-1">
            Gestión de cookies y privacidad
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utilizamos cookies técnicas obligatorias para el funcionamiento de tu carrito y sesión, y cookies analíticas para mejorar tu experiencia. Conforme a la legislación colombiana (Ley 1581 de 2012), tú decides qué autorizar.{' '}
            <Link to="/politica-de-cookies" className="text-[#7656D6] hover:underline font-medium">
              Leer Política de Cookies
            </Link>.
          </p>

          {showConfig && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-800">Cookies Técnicas</span>
                  <p className="text-[11px] text-slate-500">Imprescindibles para navegación, carrito y seguridad.</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Siempre activas</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-800">Cookies de Personalización y Métricas</span>
                  <p className="text-[11px] text-slate-500">Ayudan a sugerir mejores prendas según tus gustos.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7656D6]"></div>
                </label>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!showConfig ? (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Aceptar todas
                </button>
                <button
                  onClick={handleDeclineOptional}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Solo necesarias
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto py-1"
                >
                  Configurar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Guardar preferencias
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Volver
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
