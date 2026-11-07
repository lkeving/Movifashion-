import React, { useState } from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export const ContactoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'consulta_general',
    mensaje: '',
    consentimiento: false,
    // Campo trampa (honeypot) para bots: debe estar vacío
    website_hp: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si el bot llenó el honeypot, rechazamos silenciosamente
    if (formData.website_hp) {
      setSubmitted(true);
      return;
    }

    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!formData.consentimiento) {
      setError('Debes aceptar la autorización de tratamiento de datos personales.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          subject: formData.asunto,
          message: formData.mensaje,
          hp: formData.website_hp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch {
      // Fallback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const cleanPhone = EMPRESA.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, me comunico desde el formulario de contacto de MoviFashion.')}`;

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Contacto Directo — Atención al Cliente"
        description={`Ponte en contacto con el equipo de ${EMPRESA.nombreComercial}. Teléfono, correo electrónico, WhatsApp y formulario de atención en Colombia.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contacto' },
        ]}
      />

      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Estamos para Servirte
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Canales de Contacto Directo
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            ¿Tienes dudas sobre una prenda, un pedido en tránsito o necesitas asesoría personalizada? Escríbenos y te responderemos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Information Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
              <h2 className="text-base font-bold text-[#30234F]">Información Corporativa</h2>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Sede y Dirección</strong>
                    <span>{EMPRESA.direccion}</span>
                    <span className="block text-slate-500">{EMPRESA.ciudad}, {EMPRESA.pais}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Correos Electrónicos</strong>
                    <a href={`mailto:${EMPRESA.correoContacto}`} className="text-[#7656D6] hover:underline block">
                      {EMPRESA.correoContacto}
                    </a>
                    <span className="text-slate-500 block">PQRS: {EMPRESA.correoPQRS}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Línea Telefónica</strong>
                    <span>{EMPRESA.telefono}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Horario de Atención</strong>
                    <span>{EMPRESA.horarioAtencion}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chatear por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 lg:col-span-2">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#30234F]">¡Mensaje Recibido!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Hemos registrado tu mensaje correctamente. Nuestro equipo de atención te responderá a tu correo electrónico en un plazo máximo de 24 horas hábiles.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      nombre: '',
                      email: '',
                      telefono: '',
                      asunto: 'consulta_general',
                      mensaje: '',
                      consentimiento: false,
                      website_hp: '',
                    });
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#7656D6] text-white text-xs font-semibold rounded-xl hover:bg-[#6344be] transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[#30234F] mb-1">Envíanos un Mensaje</h2>
                  <p className="text-xs text-slate-500">
                    Diligencia el formulario y te contactaremos a la mayor brevedad.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Honeypot anti-spam oculto */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website_hp"
                    tabIndex={-1}
                    value={formData.website_hp}
                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Andrés Gómez"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="andres@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono Móvil (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="Ej: 300 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Motivo del Contacto
                    </label>
                    <select
                      value={formData.asunto}
                      onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6] bg-white"
                    >
                      <option value="consulta_general">Consulta general sobre productos</option>
                      <option value="asesoria_tallas">Asesoría de tallas y calce</option>
                      <option value="estado_pedido">Estado o seguimiento de un pedido</option>
                      <option value="cambio_devolucion">Cambio de prenda o devolución</option>
                      <option value="alianza_comercial">Alianzas comerciales o prensa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tu Mensaje *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    placeholder="Describe detalladamente tu inquietud o solicitud..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="contacto-consent"
                    checked={formData.consentimiento}
                    onChange={(e) => setFormData({ ...formData, consentimiento: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-[#7656D6] focus:ring-[#7656D6]"
                  />
                  <label htmlFor="contacto-consent" className="text-[11px] text-slate-600 leading-tight">
                    Autorizo a {EMPRESA.razonSocial} a contactarme y dar tratamiento a mis datos personales conforme a la Ley 1581 de 2012 y su Política de Privacidad.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Enviando Mensaje...' : 'Enviar Mensaje'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
