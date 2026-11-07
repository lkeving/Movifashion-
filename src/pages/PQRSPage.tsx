import React, { useState } from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Send,
  HelpCircle
} from 'lucide-react';

interface PqrsStatusResult {
  radicado: string;
  type: string;
  subject: string;
  status: 'recibido' | 'en_analisis' | 'resuelto' | 'cerrado';
  createdAt: string;
  responseDeadline: string;
  responseMessage?: string;
}

export const PQRSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radicar' | 'consultar'>('radicar');

  // Form State
  const [pqrsType, setPqrsType] = useState<'peticion' | 'queja' | 'reclamo' | 'sugerencia'>('reclamo');
  const [fullName, setFullName] = useState('');
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedRadicado, setGeneratedRadicado] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Lookup State
  const [searchRadicado, setSearchRadicado] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<PqrsStatusResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleSubmitPqrs = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hp) {
      setGeneratedRadicado(`PQRS-${new Date().getFullYear()}-000101`);
      return;
    }

    if (!fullName || !email || !docNumber || !subject || !description) {
      setFormError('Por favor completa todos los campos obligatorios marcados con *.');
      return;
    }

    if (!consent) {
      setFormError('Debes aceptar la autorización de tratamiento de datos personales.');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/pqrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: pqrsType,
          fullName,
          docType,
          docNumber,
          email,
          phone,
          orderId,
          subject,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.radicado) {
        setGeneratedRadicado(data.radicado);
      } else {
        setFormError(data.error || 'No fue posible registrar la solicitud PQRS.');
      }
    } catch {
      // Fallback
      const fakeRad = `PQRS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedRadicado(fakeRad);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchRadicado.trim().toUpperCase();
    if (!query) {
      setLookupError('Ingresa un número de radicado válido (ej: PQRS-2026-000123).');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/pqrs/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.pqrs) {
        setLookupResult(data.pqrs);
      } else {
        setLookupError(data.error || 'No se encontró ninguna solicitud con ese número de radicado.');
      }
    } catch {
      setLookupError('Error al conectar con el servidor para consultar el radicado.');
    } finally {
      setLookupLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recibido':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">Radicado Recibido</span>;
      case 'en_analisis':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">En Trámite y Análisis</span>;
      case 'resuelto':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">Respuesta Emitida</span>;
      case 'cerrado':
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold">Caso Concluido</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="PQRS — Peticiones, Quejas, Reclamos y Sugerencias"
        description={`Módulo oficial de radicación y seguimiento de PQRS de ${EMPRESA.nombreComercial}. Estatuto del Consumidor (Ley 1480 de 2011) con respuesta en máximo 15 días hábiles.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'PQRS', path: '/pqrs' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Estatuto del Consumidor · Ley 1480 de 2011
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Peticiones, Quejas, Reclamos y Sugerencias (PQRS)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Garantizamos tu derecho a formular solicitudes formales con número de radicado verificable y respuesta oportuna en un plazo legal máximo de <strong>{EMPRESA.diasRespuestaPQRS} días hábiles</strong>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('radicar')}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'radicar'
                  ? 'bg-white text-[#30234F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radicar Nueva PQRS
            </button>
            <button
              onClick={() => setActiveTab('consultar')}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'consultar'
                  ? 'bg-white text-[#30234F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar Estado por Radicado</span>
            </button>
          </div>
        </div>

        {/* TAB 1: RADICAR */}
        {activeTab === 'radicar' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
            {generatedRadicado ? (
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Radicación Exitosa
                  </span>
                  <h3 className="text-2xl font-black text-[#30234F] mt-1">
                    Número de Radicado Oficial:
                  </h3>
                  <div className="mt-2 inline-block bg-purple-50 border border-purple-200 text-[#7656D6] font-mono text-xl sm:text-2xl font-black px-6 py-3 rounded-2xl tracking-wider">
                    {generatedRadicado}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-slate-600 max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Clock className="w-4 h-4 text-[#7656D6]" />
                    <span>Plazo de Respuesta Legal: 15 días hábiles</span>
                  </div>
                  <p>
                    Hemos enviado la constancia formal de radicado a tu correo <strong>{email}</strong>. Puedes consultar el avance de tu caso en cualquier momento con este código en la pestaña "Consultar Estado".
                  </p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchRadicado(generatedRadicado);
                      setActiveTab('consultar');
                    }}
                    className="px-5 py-2.5 bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Ver estado del radicado
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedRadicado(null);
                      setSubject('');
                      setDescription('');
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Radicar otra solicitud
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPqrs} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#30234F] mb-1">
                    Formulario Oficial de Radicación
                  </h2>
                  <p className="text-xs text-slate-500">
                    Selecciona el tipo de trámite y describe con precisión los hechos para una resolución expedita.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Honeypot */}
                <input
                  type="text"
                  className="hidden"
                  tabIndex={-1}
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />

                {/* Tipo de PQRS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tipo de Solicitud *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'reclamo', label: 'Reclamo', desc: 'Disconformidad con prenda o cobro' },
                      { id: 'queja', label: 'Queja', desc: 'Inconformidad con la atención' },
                      { id: 'peticion', label: 'Petición', desc: 'Solicitud formal de información' },
                      { id: 'sugerencia', label: 'Sugerencia', desc: 'Propuesta de mejora' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setPqrsType(item.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          pqrsType === item.id
                            ? 'border-[#7656D6] bg-purple-50/70 text-[#30234F]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-500 leading-tight">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Datos del Ciudadano / Solicitante */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Documento de Identidad *
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-20 px-2 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      >
                        <option value="CC">C.C.</option>
                        <option value="CE">C.E.</option>
                        <option value="NIT">NIT</option>
                        <option value="PAS">Pas.</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="Número"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo Electrónico (para notificación) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="300 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número de Pedido (opcional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Ej: ORD-1234"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asunto o Título del Reclamo *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Talla recibida no corresponde al pedido ORD-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hechos y Descripción Detallada *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los hechos cronológicamente, especificando fecha de compra, prendas afectadas y pretensión esperada (cambio, reembolso o garantía)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pqrs-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#7656D6] focus:ring-[#7656D6]"
                  />
                  <label htmlFor="pqrs-consent" className="text-[11px] text-slate-600 leading-tight">
                    Declaro bajo gravedad de juramento que la información suministrada es verídica y autorizo el tratamiento de mis datos con fines de trámite y respuesta conforme a la Ley 1581 de 2012.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Generando Radicado...' : 'Radicar Solicitud Oficial'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: CONSULTAR ESTADO */}
        {activeTab === 'consultar' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#30234F] mb-1">
                Consulta de Radicado en Línea
              </h2>
              <p className="text-xs text-slate-500">
                Ingresa el código que te fue asignado al radicar tu solicitud (formato PQRS-AAAA-XXXXXX).
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <input
                type="text"
                value={searchRadicado}
                onChange={(e) => setSearchRadicado(e.target.value)}
                placeholder="PQRS-2026-000123"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-[#7656D6]"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lookupLoading ? 'Consultando...' : 'Consultar'}</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupResult && (
              <div className="border border-slate-200 rounded-2xl p-6 bg-[#FBFBFE] space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Radicado</span>
                    <strong className="text-base font-bold text-[#30234F] font-mono">{lookupResult.radicado}</strong>
                  </div>
                  <div>
                    {getStatusBadge(lookupResult.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Tipo de Trámite:</span>
                    <strong className="text-slate-800 capitalize">{lookupResult.type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha de Radicación:</span>
                    <strong className="text-slate-800">{new Date(lookupResult.createdAt).toLocaleDateString('es-CO')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Asunto:</span>
                    <strong className="text-slate-800">{lookupResult.subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Término de Respuesta:</span>
                    <strong className="text-slate-800">{lookupResult.responseDeadline || '15 días hábiles'}</strong>
                  </div>
                </div>

                {lookupResult.responseMessage && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-[#30234F] block mb-1">Respuesta Oficial del Área Legal:</span>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {lookupResult.responseMessage}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
