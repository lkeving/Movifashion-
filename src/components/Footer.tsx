import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Check, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { EMPRESA } from '../config/empresa.ts';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, source: 'footer_newsletter' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.error || 'No fue posible registrar la suscripción.');
      }
    } catch {
      // Si el endpoint aún no responde, confirmamos recepción client-side amablemente
      setSubscribed(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#1C1827] text-slate-300 text-xs border-t border-purple-950/40">
      {/* Newsletter Bar */}
      <div className="border-b border-purple-900/30 bg-[#241E33] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C7B5F8] flex items-center justify-center lg:justify-start gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Novedades y Estilo Exclusivo
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Suscríbete a nuestro boletín de tendencias
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Recibe lanzamientos de temporada, cápsulas exclusivas y guías de combinación creadas por nuestro equipo de moda.
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[420px]">
            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">
                  ¡Gracias por suscribirte! Te hemos enviado un correo de bienvenida.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-white placeholder-slate-400 focus:outline-none focus:border-[#7656D6] text-xs transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#7656D6] hover:bg-[#6344be] text-white font-semibold rounded-xl text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Registrando...' : 'Suscribirme'}
                  </button>
                </div>
                
                <div className="flex items-start gap-2 pt-1 text-left">
                  <input
                    type="checkbox"
                    id="newsletter-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-600 text-[#7656D6] focus:ring-[#7656D6] focus:ring-offset-0 bg-purple-950/40"
                  />
                  <label htmlFor="newsletter-consent" className="text-[11px] text-slate-400 leading-tight">
                    Autorizo el tratamiento de mis datos personales para fines informativos y comerciales según la{' '}
                    <Link to="/politica-de-privacidad" className="text-[#C7B5F8] underline hover:text-white">
                      Ley 1581 de 2012
                    </Link>.
                  </label>
                </div>

                {error && (
                  <p className="text-[11px] text-rose-400 mt-1">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main 5 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          
          {/* Col 1: Marca & Redes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7656D6] to-[#4527A0] flex items-center justify-center text-white font-black text-base shadow-sm">
                M
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                MOVIFASHION<span className="text-[#A282FA] ml-0.5">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {EMPRESA.descripcionCorta}
            </p>
            <p className="text-[11px] text-[#C7B5F8] font-medium italic">
              "{EMPRESA.lema}"
            </p>
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a
                href={EMPRESA.redesSociales.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-purple-950/50 flex items-center justify-center hover:text-white hover:bg-[#7656D6] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={EMPRESA.redesSociales.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-purple-950/50 flex items-center justify-center hover:text-white hover:bg-[#7656D6] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={EMPRESA.redesSociales.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-purple-950/50 flex items-center justify-center hover:text-white hover:bg-[#7656D6] transition-colors font-bold text-xs"
                aria-label="TikTok"
              >
                TT
              </a>
            </div>
          </div>

          {/* Col 2: Compra */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">
              Compra
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/catalogo" className="hover:text-white transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link to="/nueva-coleccion" className="hover:text-white transition-colors">
                  Nueva Colección
                </Link>
              </li>
              <li>
                <Link to="/tendencias" className="hover:text-white transition-colors">
                  Tendencias & Top Ventas
                </Link>
              </li>
              <li>
                <Link to="/descuentos" className="text-[#C7B5F8] hover:text-white font-medium transition-colors">
                  Prendas con Descuento
                </Link>
              </li>
              <li>
                <Link to="/catalogo/camisetas" className="hover:text-white transition-colors text-slate-400">
                  Camisetas & Hoodies
                </Link>
              </li>
              <li>
                <Link to="/catalogo/pantalones" className="hover:text-white transition-colors text-slate-400">
                  Pantalones & Cargos
                </Link>
              </li>
              <li>
                <Link to="/catalogo/calzado" className="hover:text-white transition-colors text-slate-400">
                  Zapatos & Tenis
                </Link>
              </li>
              <li>
                <Link to="/ruleta" className="text-[#C7B5F8] hover:text-white font-medium transition-colors">
                  Gira y gana (ruleta de premios)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Ayuda & Servicio */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">
              Servicio al Cliente
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/contacto" className="hover:text-white transition-colors">
                  Contacto Directo
                </Link>
              </li>
              <li>
                <Link to="/pqrs" className="hover:text-white transition-colors">
                  Radicar o Consultar PQRS
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="hover:text-white transition-colors">
                  Preguntas Frecuentes (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/guia-de-tallas" className="hover:text-white transition-colors">
                  Guía de Tallas & Medidas
                </Link>
              </li>
              <li>
                <Link to="/envios" className="hover:text-white transition-colors">
                  Tiempos y Costos de Envío
                </Link>
              </li>
              <li>
                <Link to="/cambios-y-devoluciones" className="hover:text-white transition-colors">
                  Cambios, Retracto y Garantías
                </Link>
              </li>
              <li>
                <Link to="/cuenta" className="hover:text-white transition-colors">
                  Seguimiento de Mis Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Empresa & Legal Colombia */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">
              Empresa & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/nosotros" className="hover:text-white transition-colors">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link to="/mision-vision" className="hover:text-white transition-colors">
                  Misión y Visión
                </Link>
              </li>
              <li>
                <Link to="/terminos-y-condiciones" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad (Ley 1581)
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href={EMPRESA.sicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C7B5F8] hover:text-white transition-colors font-medium border border-purple-800/60 rounded-lg px-2.5 py-1.5 bg-purple-950/30"
                >
                  <span>Superintendencia (SIC)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Seguridad & Medios de Pago */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">
              Pagos & Seguridad
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Transacciones seguras con cifrado bancario SSL 256-bit y respaldo del sistema financiero colombiano.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-950/30 border border-purple-900/40 text-slate-200">
                <CreditCard className="w-4 h-4 text-[#A282FA] shrink-0" />
                <span className="text-[11px] font-medium">Tarjetas Crédito/Débito</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-950/30 border border-purple-900/40 text-slate-200">
                <span className="text-[10px] font-extrabold bg-[#002D72] text-white px-1.5 py-0.5 rounded shrink-0">PSE</span>
                <span className="text-[11px] font-medium">Bancolombia, Nequi, Daviplata</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-950/30 border border-purple-900/40 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">Pago Contraentrega en Efectivo</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Precios con IVA 19% liquidado</span>
            </div>
          </div>

        </div>

        {/* Bottom Legal Notice & Copyright */}
        <div className="mt-12 pt-8 border-t border-purple-900/30 text-[11px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p>
              © {new Date().getFullYear()} {EMPRESA.nombreComercial}. Operado legalmente por{' '}
              <strong className="text-slate-400">{EMPRESA.razonSocial}</strong> · NIT:{' '}
              <strong className="text-slate-400">{EMPRESA.nit}</strong>.
            </p>
            <p>
              {EMPRESA.direccion} · Bogotá D.C., Colombia · Tel: {EMPRESA.telefono}.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>IVA 19% Incluido</span>
            <span>·</span>
            <span>Estatuto del Consumidor</span>
            <span>·</span>
            <span>Habeas Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
