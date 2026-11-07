import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Cookie, Settings, ShieldCheck } from 'lucide-react';

export const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Política de Cookies"
        description={`Conoce el uso de cookies técnicas y de preferencias en el sitio web de ${EMPRESA.nombreComercial}.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Política de Cookies', path: '/politica-de-cookies' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Navegación Transparente
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Política de Cookies
          </h1>
          <p className="text-xs text-slate-500">
            Transparencia sobre las tecnologías de almacenamiento local en tu navegador
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F] flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#7656D6]" />
              ¿Qué son las cookies?
            </h2>
            <p>
              Una cookie es un pequeño archivo de texto o identificador que se almacena en el navegador de tu dispositivo (computador, teléfono o tableta) al visitar un sitio web. Permite recordar información sobre tu visita, como tus artículos agregados al carrito, sesión activa o preferencias de idioma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              Cookies que utilizamos en MoviFashion
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <strong className="text-slate-800 text-sm block mb-1">1. Cookies Técnicas y Esenciales (Obligatorias)</strong>
                <p className="text-xs">
                  Son indispensables para que la tienda funcione correctamente. Permiten mantener tu carrito de compras activo entre páginas, autenticar tu inicio de sesión de forma segura (cookie HttpOnly), y garantizar la protección contra ataques de falsificación de peticiones. Estas cookies no pueden desactivarse.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <strong className="text-slate-800 text-sm block mb-1">2. Cookies de Preferencias y Personalización</strong>
                <p className="text-xs">
                  Guardan tus preferencias de visualización, tus prendas marcadas como favoritas y los filtros aplicados en el catálogo, facilitándote una navegación ágil y adaptada a tus gustos.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <strong className="text-slate-800 text-sm block mb-1">3. Métricas y Rendimiento</strong>
                <p className="text-xs">
                  Nos permiten conocer de forma anónima qué secciones son más visitadas y optimizar el rendimiento técnico de los servidores en Colombia. Solo se activan si otorgas tu consentimiento en el banner de cookies.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              ¿Cómo gestionar o revocar tus preferencias?
            </h2>
            <p>
              Puedes revocar o modificar en cualquier momento las cookies autorizadas haciendo clic en "Configurar" en nuestro banner de privacidad, o borrando los datos de navegación directamente desde las opciones de configuración de tu navegador (Chrome, Safari, Firefox o Edge).
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
