import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { ShieldCheck, Lock, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacidadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Política de Tratamiento de Datos Personales (Ley 1581 de 2012)"
        description={`Política de Privacidad y Tratamiento de Información Personal de ${EMPRESA.nombreComercial}. Habeas Data conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013 en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Política de Privacidad', path: '/politica-de-privacidad' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Habeas Data · República de Colombia
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="text-xs text-slate-500">
            En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#7656D6]" />
              1. Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recolectados a través de esta plataforma es <strong className="text-slate-800">{EMPRESA.razonSocial}</strong>, sociedad comercial constituida conforme a las leyes de Colombia, identificada con NIT <strong className="text-slate-800">{EMPRESA.nit}</strong>, con domicilio principal en {EMPRESA.direccion}, {EMPRESA.ciudad}, Colombia.
            </p>
            <p>
              Canal oficial para consultas de Habeas Data: <strong className="text-slate-800">{EMPRESA.correoPrivacidad}</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              2. Finalidades de la Recolección de Datos
            </h2>
            <p>
              Los datos personales suministrados por clientes y usuarios serán recolectados, almacenados y utilizados exclusivamente para las siguientes finalidades legítimas:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Gestionar el procesamiento, despacho, facturación electrónica y entrega física de pedidos a través de las empresas transportadoras autorizadas.</li>
              <li>Validar transacciones de pago electrónico y prevención de fraude financiero o suplantación de identidad.</li>
              <li>Tramitar oportunamente cambios de talla, garantías y derechos de retracto conforme a la Ley 1480 de 2011.</li>
              <li>Gestionar solicitudes formales de PQRS y comunicaciones requeridas por autoridades judiciales o tributarias (DIAN).</li>
              <li>Remitir información sobre promociones, novedades de catálogo y boletines comerciales, siempre que medie la autorización previa y expresa del titular.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              3. Derechos de los Titulares (Derechos ARCO)
            </h2>
            <p>
              De conformidad con el artículo 8 de la Ley 1581 de 2012, usted como titular de los datos personales tiene derecho a:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-800 block mb-1">Acceso y Conocimiento</strong>
                <span>Conocer, actualizar y rectificar sus datos personales frente al responsable en cualquier momento.</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-800 block mb-1">Prueba de Autorización</strong>
                <span>Solicitar prueba de la autorización otorgada para el tratamiento de su información.</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-800 block mb-1">Supresión de Datos</strong>
                <span>Solicitar la eliminación de sus datos cuando no medie un deber legal o contractual de permanencia (ej. registros tributarios contables).</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-800 block mb-1">Revocatoria de Consentimiento</strong>
                <span>Revocar la autorización concedida para comunicaciones promocionales sin afectar la vigencia de su cuenta.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              4. Procedimiento para el Ejercicio de sus Derechos
            </h2>
            <p>
              Para radicar una consulta o reclamo relativo a sus datos personales, puede enviar una comunicación a <strong className="text-slate-800">{EMPRESA.correoPrivacidad}</strong> con su nombre completo, número de cédula y descripción de su solicitud.
            </p>
            <p>
              El término máximo legal para atender las consultas es de diez (10) días hábiles, y para los reclamos de quince (15) días hábiles contados a partir del recibo de la comunicación completa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              5. Medidas de Seguridad de la Información
            </h2>
            <p>
              Implementamos protocolos de seguridad estándar de la industria, incluyendo cifrado HTTPS/TLS en tránsito, almacenamiento protegido de credenciales mediante algoritmos de hash criptográfico unidireccional (scrypt) y acceso restringido basado en roles (RBAC). No almacenamos números completos de tarjeta de crédito ni códigos CVV en nuestros servidores.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
