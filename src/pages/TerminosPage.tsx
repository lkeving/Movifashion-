import React from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Shield, FileCheck, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TerminosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Términos y Condiciones de Compra"
        description={`Términos y condiciones legales de contratación electrónica de ${EMPRESA.nombreComercial}. Cumplimiento Ley 1480 de 2011 en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Términos y Condiciones', path: '/terminos-y-condiciones' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Marco Jurídico de Comercio Electrónico
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Términos y Condiciones Generales
          </h1>
          <p className="text-xs text-slate-500">
            Última actualización: Enero de 2026 · Conforme a las leyes de la República de Colombia
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#7656D6]" />
              1. Identificación del Operador Comercial
            </h2>
            <p>
              El presente sitio web es operado y administrado comercialmente por <strong className="text-slate-800">{EMPRESA.razonSocial}</strong>, identificada con el NIT <strong className="text-slate-800">{EMPRESA.nit}</strong>, con domicilio legal en {EMPRESA.direccion}, ciudad de {EMPRESA.ciudad}, República de Colombia, teléfono de atención {EMPRESA.telefono} y correo de contacto {EMPRESA.correoContacto}.
            </p>
            <p>
              La adquisición de prendas de vestir, accesorios o calzado en esta plataforma supone la aceptación plena y sin reservas de los presentes Términos y Condiciones.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              2. Capacidad Legal para Contratar
            </h2>
            <p>
              Los servicios y productos ofrecidos en MoviFashion están dirigidos a personas naturales que cuenten con plena capacidad legal para obligarse conforme a la legislación civil y mercantil colombiana. Los menores de edad deberán contar con la debida representación o autorización de sus padres o tutores legales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              3. Precios, Liquidación de Impuestos y Facturación
            </h2>
            <p>
              De conformidad con el artículo 26 de la Ley 1480 de 2011 (Estatuto del Consumidor), todos los precios expuestos en el catálogo están denominados en Pesos Colombianos (COP) y corresponden al precio total para el consumidor, <strong>incluyendo de manera expresa la tarifa general del Impuesto sobre las Ventas (IVA) del 19%</strong>.
            </p>
            <p>
              En el desglose del carrito, pantalla de pago y comprobante de compra emitido, se discriminará con total transparencia la Base Gravable liquidada, el valor del IVA del 19% y el costo de transporte/envío si fuere aplicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              4. Derecho de Retracto (Artículo 47 Ley 1480 de 2011)
            </h2>
            <p>
              El consumidor podrá ejercer su derecho de retracto dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de entrega del producto.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs space-y-2 text-purple-950">
              <p className="font-semibold">Condiciones para ejercer el retracto:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>La prenda no debe haber sido usada, lavada ni alterada.</li>
                <li>Debe conservar intactas todas las etiquetas originales y su embalaje de fábrica.</li>
                <li>Los costos de transporte correspondientes a la devolución por retracto serán asumidos por el consumidor, conforme a la ley.</li>
                <li>{EMPRESA.razonSocial} devolverá la totalidad del dinero pagado en un plazo no mayor a treinta (30) días calendario tras la recepción del producto en bodega.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              5. Reversión del Pago (Artículo 51 Ley 1480 de 2011)
            </h2>
            <p>
              En ventas mediante comercio electrónico en las que se hayan utilizado medios de pago electrónico (tarjeta de crédito, débito o transferencia bancaria), el consumidor podrá solicitar la reversión del pago cuando haya sido objeto de fraude, la transacción corresponda a una operación no solicitada, el producto adquirido no sea recibido dentro del plazo convenido o el bien entregado sea defectuoso o no corresponda a lo solicitado.
            </p>
            <p>
              Dicha solicitud deberá presentarse dentro de los cinco (5) días hábiles siguientes a la fecha en que tuvo conocimiento de la operación fraudulenta o debió recibir el producto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              6. Garantía Legal de Calidad e Idoneidad
            </h2>
            <p>
              Todas las prendas y calzado comercializados cuentan con una garantía legal de <strong>noventa (90) días calendario</strong> contados a partir de su entrega efectiva, por defectos atribuibles a confección, materiales o fallas de fábrica. Se excluyen desgastes naturales y deterioros por uso indebido o lavado contrario a la etiqueta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#30234F]">
              7. Autoridad de Vigilancia y Control
            </h2>
            <p>
              En caso de requerir orientación sobre sus derechos como consumidor en Colombia, puede acudir a la Superintendencia de Industria y Comercio (SIC):
            </p>
            <a
              href={EMPRESA.sicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#7656D6] hover:underline font-semibold"
            >
              <span>Portal de la Superintendencia de Industria y Comercio (www.sic.gov.co)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>

        </div>

      </div>
    </div>
  );
};
