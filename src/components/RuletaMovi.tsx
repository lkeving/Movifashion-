/**
 * RuletaMovi.tsx — Activación de marca BTL "Gira y Estrena" para MoviFashion.
 *
 * Componente autocontenido (React + TypeScript). No necesita librerías extra ni
 * clases de Tailwind: trae sus propios estilos con el prefijo "mvr-".
 *
 * Qué hace:
 *  1. Muestra un botón flotante "Gira y gana" (abajo a la izquierda) y se abre sola
 *     una vez por sesión. También se abre con /ruleta o ?ruleta=1 (ideal para un QR
 *     en punto de venta, feria o empaque).
 *  2. El cliente deja nombre y correo y autoriza el tratamiento de datos (Ley 1581 de 2012).
 *  3. Gira la ruleta y gana un cupón o un regalo de la marca.
 *  4. El cupón se guarda en el navegador y se usa en el campo "Cupón" del checkout.
 *
 * Seguridad: el premio lo decide el SERVIDOR en POST /api/ruleta/girar.
 * Si ese endpoint todavía no existe, usa un sorteo local de respaldo para que
 * la activación nunca se quede sin funcionar.
 *
 * Uso (en App.tsx, junto al botón flotante de WhatsApp):
 *    import RuletaMovi from './components/RuletaMovi';
 *    ...
 *    <RuletaMovi onNavigate={(ruta) => navigate(ruta)} />
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Configuración de la activación (editable)                           */
/* ------------------------------------------------------------------ */

export type TipoPremio = 'porcentaje' | 'envio' | 'regalo' | 'reintento';

export interface Premio {
  id: string;
  linea1: string; // texto grande del segmento
  linea2: string; // texto pequeño del segmento
  titulo: string; // título al ganar
  descripcion: string;
  codigo: string | null; // cupón que se usa en el checkout
  tipo: TipoPremio;
  valor: number; // % de descuento (si aplica)
  peso: number; // probabilidad relativa (la suma es 100)
  fondo: string;
  texto: string;
}

/** Los 8 segmentos, en el orden en que aparecen en la ruleta (sentido horario). */
export const PREMIOS: Premio[] = [
  { id: 'dcto10', linea1: '10%', linea2: 'DCTO', titulo: '¡Ganaste 10% de descuento!', descripcion: 'Aplica sobre toda tu compra, en cualquier categoría.', codigo: 'MOVI10', tipo: 'porcentaje', valor: 10, peso: 22, fondo: '#7656D6', texto: '#FFFFFF' },
  { id: 'envio', linea1: 'ENVÍO', linea2: 'GRATIS', titulo: '¡Ganaste envío gratis!', descripcion: 'Te llevamos tu pedido a cualquier ciudad de Colombia sin costo, sin monto mínimo.', codigo: 'ENVIOMOVI', tipo: 'envio', valor: 0, peso: 18, fondo: '#E9E2FA', texto: '#30234F' },
  { id: 'dcto5', linea1: '5%', linea2: 'DCTO', titulo: '¡Ganaste 5% de descuento!', descripcion: 'Un empujón extra para estrenar. Aplica sobre toda tu compra.', codigo: 'RULETA5', tipo: 'porcentaje', valor: 5, peso: 28, fondo: '#30234F', texto: '#FFFFFF' },
  { id: 'regalo', linea1: 'REGALO', linea2: 'SORPRESA', titulo: '¡Ganaste un regalo sorpresa!', descripcion: 'Incluimos un obsequio de la marca en tu próximo pedido.', codigo: 'REGALOMOVI', tipo: 'regalo', valor: 0, peso: 9, fondo: '#FFFFFF', texto: '#30234F' },
  { id: 'dcto15', linea1: '15%', linea2: 'DCTO', titulo: '¡Ganaste 15% de descuento!', descripcion: 'Aplica sobre toda tu compra, en cualquier categoría.', codigo: 'RULETA15', tipo: 'porcentaje', valor: 15, peso: 10, fondo: '#7656D6', texto: '#FFFFFF' },
  { id: 'otra', linea1: 'GIRA', linea2: 'OTRA VEZ', titulo: '¡Casi! Tienes otro giro', descripcion: 'La ruleta te regala una segunda oportunidad.', codigo: null, tipo: 'reintento', valor: 0, peso: 8, fondo: '#E9E2FA', texto: '#30234F' },
  { id: 'dcto20', linea1: '20%', linea2: 'DCTO', titulo: '¡Ganaste 20% de descuento!', descripcion: 'Aplica sobre toda tu compra, en cualquier categoría.', codigo: 'RULETA20', tipo: 'porcentaje', valor: 20, peso: 4, fondo: '#30234F', texto: '#FFFFFF' },
  { id: 'dcto30', linea1: '30%', linea2: 'PREMIO MAYOR', titulo: '¡Premio mayor: 30% de descuento!', descripcion: 'El premio más grande de la ruleta. Aplica sobre toda tu compra.', codigo: 'MOVIVIP30', tipo: 'porcentaje', valor: 30, peso: 1, fondo: '#F5B841', texto: '#30234F' },
];

const DIAS_VIGENCIA = 7; // días que dura el cupón
const CLAVE_LOCAL = 'movifashion_ruleta_v1'; // premio guardado en el navegador
const CLAVE_SESION = 'movifashion_ruleta_vista'; // para abrirla sola una vez por sesión
const SEGUNDOS_AUTOAPERTURA = 7;
const ENDPOINT_GIRO = '/api/ruleta/girar';
const ENDPOINT_BOLETIN = '/api/newsletter'; // ya existe en la tienda: registra el contacto

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

interface PremioGuardado {
  premioId: string;
  codigo: string | null;
  nombre: string;
  correo: string;
  fecha: string; // ISO
  expira: string; // ISO
}

const N = PREMIOS.length;
const GRADOS = 360 / N;

function aleatorio(): number {
  try {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] / 4294967296;
  } catch {
    return Math.random();
  }
}

/** Sorteo ponderado local (respaldo cuando el servidor no responde). */
function sortearLocal(excluirReintento: boolean): Premio {
  const lista = excluirReintento ? PREMIOS.filter((p) => p.tipo !== 'reintento') : PREMIOS;
  const total = lista.reduce((s, p) => s + p.peso, 0);
  let r = aleatorio() * total;
  for (const p of lista) {
    r -= p.peso;
    if (r < 0) return p;
  }
  return lista[0];
}

function leerGuardado(): PremioGuardado | null {
  try {
    const crudo = localStorage.getItem(CLAVE_LOCAL);
    if (!crudo) return null;
    const dato = JSON.parse(crudo) as PremioGuardado;
    if (!dato.expira || new Date(dato.expira).getTime() < Date.now()) {
      localStorage.removeItem(CLAVE_LOCAL);
      return null;
    }
    return dato;
  } catch {
    return null;
  }
}

function fechaLarga(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function puntoEnCirculo(cx: number, cy: number, r: number, grados: number): [number, number] {
  const rad = ((grados - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

type Paso = 'registro' | 'lista' | 'girando' | 'premio';

export interface RuletaMoviProps {
  /** Navegación de la SPA (por ejemplo, navigate de react-router). */
  onNavigate?: (ruta: string) => void;
  /** Se llama cuando el cliente gana (útil para analítica o para precargar el cupón). */
  onPremio?: (premio: Premio, datos: { nombre: string; correo: string }) => void;
  /** Ruta a la que lleva el botón "Usar mi cupón". */
  rutaCompra?: string;
}

export default function RuletaMovi({ onNavigate, onPremio, rutaCompra = '/catalogo' }: RuletaMoviProps) {
  const [abierta, setAbierta] = useState(false);
  const [paso, setPaso] = useState<Paso>('registro');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotacion, setRotacion] = useState(0);
  const [ganado, setGanado] = useState<Premio | null>(null);
  const [guardado, setGuardado] = useState<PremioGuardado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [verTerminos, setVerTerminos] = useState(false);
  const yaReintento = useRef(false);
  const temporizador = useRef<number | null>(null);
  const botonCerrar = useRef<HTMLButtonElement | null>(null);

  const movimientoReducido = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const duracion = movimientoReducido ? 1200 : 5400;

  const abrir = useCallback(() => {
    const previo = leerGuardado();
    setGuardado(previo);
    if (previo) {
      setGanado(PREMIOS.find((p) => p.id === previo.premioId) || null);
      setPaso('premio');
    } else {
      setPaso('registro');
    }
    setError(null);
    setAbierta(true);
    try {
      sessionStorage.setItem(CLAVE_SESION, '1');
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const cerrar = useCallback(() => {
    if (paso === 'girando') return; // no se cierra en pleno giro
    setAbierta(false);
  }, [paso]);

  // Apertura por URL (/ruleta o ?ruleta=1) y autoapertura una vez por sesión
  useEffect(() => {
    setGuardado(leerGuardado());
    const url = new URL(window.location.href);
    const porUrl = url.pathname.replace(/\/+$/, '') === '/ruleta' || url.searchParams.get('ruleta') === '1';
    if (porUrl) {
      abrir();
      return;
    }
    let vista = false;
    try {
      vista = sessionStorage.getItem(CLAVE_SESION) === '1';
    } catch {
      /* sin almacenamiento */
    }
    if (vista || leerGuardado()) return;
    const t = window.setTimeout(abrir, SEGUNDOS_AUTOAPERTURA * 1000);
    return () => window.clearTimeout(t);
  }, [abrir]);

  // Tecla Escape, foco y bloqueo del scroll del fondo
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    botonCerrar.current?.focus();
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [abierta, cerrar]);

  useEffect(
    () => () => {
      if (temporizador.current) window.clearTimeout(temporizador.current);
    },
    []
  );

  const validarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    const n = nombre.trim();
    const c = correo.trim().toLowerCase();
    if (n.length < 2 || n.length > 60) return setError('Escribe tu nombre para personalizar tu premio.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) || c.length > 120) return setError('Escribe un correo electrónico válido.');
    if (!acepta) return setError('Debes autorizar el tratamiento de datos (Ley 1581 de 2012) para participar.');
    setError(null);
    setNombre(n);
    setCorreo(c);
    setPaso('lista');
  };

  /** Pide el premio al servidor; si no hay endpoint, sortea localmente. */
  const obtenerPremio = async (): Promise<{ premio: Premio; expira: string }> => {
    const expiraLocal = new Date(Date.now() + DIAS_VIGENCIA * 86400000).toISOString();
    try {
      const r = await fetch(ENDPOINT_GIRO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, correo, consentimiento: true, reintento: yaReintento.current }),
      });
      const texto = await r.text();
      const dato = JSON.parse(texto);
      const premio = PREMIOS.find((p) => p.id === dato.premioId);
      if ((r.ok || r.status === 409) && premio) return { premio, expira: dato.expira || expiraLocal };
      if (r.status === 429) throw new Error('LIMITE');
      throw new Error('SIN_ENDPOINT');
    } catch (err) {
      if (err instanceof Error && err.message === 'LIMITE') throw err;
      // Respaldo: sorteo local + registro del contacto en el boletín que ya existe
      fetch(ENDPOINT_BOLETIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, consent: true, source: 'ruleta_btl' }),
      }).catch(() => undefined);
      return { premio: sortearLocal(yaReintento.current), expira: expiraLocal };
    }
  };

  const girar = async () => {
    if (paso !== 'lista') return;
    setPaso('girando');
    setError(null);
    let resultado: { premio: Premio; expira: string };
    try {
      resultado = await obtenerPremio();
    } catch {
      setPaso('lista');
      setError('Hiciste muchos intentos seguidos. Espera un momento y vuelve a girar.');
      return;
    }
    const { premio, expira } = resultado;
    const indice = PREMIOS.findIndex((p) => p.id === premio.id);
    // El puntero está arriba: se lleva el centro del segmento ganador a 0°, con un pequeño desvío para que se vea natural
    const desvio = (aleatorio() - 0.5) * (GRADOS - 12);
    const destino = 360 - (indice * GRADOS + GRADOS / 2) + desvio;
    setRotacion((actual) => Math.ceil(actual / 360) * 360 + 360 * (movimientoReducido ? 1 : 6) + destino);

    temporizador.current = window.setTimeout(() => {
      setGanado(premio);
      if (premio.tipo === 'reintento') {
        yaReintento.current = true;
      } else {
        const registro: PremioGuardado = { premioId: premio.id, codigo: premio.codigo, nombre, correo, fecha: new Date().toISOString(), expira };
        try {
          localStorage.setItem(CLAVE_LOCAL, JSON.stringify(registro));
        } catch {
          /* sin almacenamiento */
        }
        setGuardado(registro);
        onPremio?.(premio, { nombre, correo });
        try {
          window.dispatchEvent(new CustomEvent('movifashion:ruleta', { detail: { premioId: premio.id, codigo: premio.codigo } }));
        } catch {
          /* navegadores antiguos */
        }
      }
      setPaso('premio');
    }, duracion + 350);
  };

  const copiar = async () => {
    const codigo = ganado?.codigo;
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      const t = document.createElement('textarea');
      t.value = codigo;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2200);
  };

  const irAComprar = () => {
    setAbierta(false);
    if (onNavigate) onNavigate(rutaCompra);
    else window.location.assign(rutaCompra);
  };

  const primerNombre = (guardado?.nombre || nombre).split(' ')[0];
  const esReintento = ganado?.tipo === 'reintento';

  /* ---------------------------- Dibujo de la ruleta ---------------------------- */
  const ruleta = (
    <div className="mvr-ruleta-caja" aria-hidden="true">
      <div className={`mvr-puntero ${paso === 'girando' ? 'mvr-puntero-activo' : ''}`}>
        <svg viewBox="0 0 40 46" width="40" height="46">
          <path d="M20 44 L5 14 A16 16 0 1 1 35 14 Z" fill="#F5B841" stroke="#30234F" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="20" cy="14" r="5" fill="#30234F" />
        </svg>
      </div>
      <svg
        className="mvr-ruleta"
        viewBox="0 0 320 320"
        style={{ transform: `rotate(${rotacion}deg)`, transitionDuration: `${duracion}ms` }}
      >
        <circle cx="160" cy="160" r="158" fill="#30234F" />
        {PREMIOS.map((p, i) => {
          const [x0, y0] = puntoEnCirculo(160, 160, 146, i * GRADOS);
          const [x1, y1] = puntoEnCirculo(160, 160, 146, (i + 1) * GRADOS);
          return (
            <g key={p.id}>
              <path d={`M160 160 L${x0} ${y0} A146 146 0 0 1 ${x1} ${y1} Z`} fill={p.fondo} stroke="#30234F" strokeWidth="1.5" />
              <g transform={`rotate(${i * GRADOS + GRADOS / 2} 160 160)`}>
                <text x="160" y="56" textAnchor="middle" fill={p.texto} fontSize={p.linea1.length > 4 ? 15 : 24} fontWeight="800" letterSpacing="-0.5">
                  {p.linea1}
                </text>
                <text x="160" y="72" textAnchor="middle" fill={p.texto} fontSize={p.linea2.length > 8 ? 7.5 : 10} fontWeight="700" letterSpacing="0.8" opacity="0.92">
                  {p.linea2}
                </text>
              </g>
            </g>
          );
        })}
        {Array.from({ length: N * 2 }).map((_, i) => {
          const [x, y] = puntoEnCirculo(160, 160, 152, i * (GRADOS / 2));
          return <circle key={i} cx={x} cy={y} r="3" fill={i % 2 ? '#F5B841' : '#FFFFFF'} />;
        })}
        <circle cx="160" cy="160" r="34" fill="#FFFFFF" stroke="#30234F" strokeWidth="5" />
        <circle cx="160" cy="160" r="24" fill="#7656D6" />
        <text x="160" y="169" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="800">
          M
        </text>
      </svg>
    </div>
  );

  return (
    <>
      <style>{ESTILOS}</style>

      {!abierta && (
        <button type="button" className="mvr-lanzador" onClick={abrir} aria-label="Abrir la ruleta de premios MoviFashion">
          <span className="mvr-lanzador-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
            </svg>
          </span>
          <span className="mvr-lanzador-texto">{guardado?.codigo ? `Tu cupón: ${guardado.codigo}` : 'Gira y gana'}</span>
        </button>
      )}

      {abierta && (
        <div className="mvr-fondo" onMouseDown={(e) => e.target === e.currentTarget && cerrar()}>
          <div className="mvr-modal" role="dialog" aria-modal="true" aria-labelledby="mvr-titulo">
            <button ref={botonCerrar} type="button" className="mvr-cerrar" onClick={cerrar} aria-label="Cerrar la ruleta" disabled={paso === 'girando'}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="mvr-lado-ruleta">
              <span className="mvr-etiqueta">Activación MoviFashion · Colección 2026</span>
              {ruleta}
              <p className="mvr-nota-ruleta">Todos los giros tienen premio · Un giro por persona</p>
            </div>

            <div className="mvr-lado-contenido">
              {paso === 'registro' && (
                <form onSubmit={validarRegistro} noValidate>
                  <h2 id="mvr-titulo" className="mvr-titulo">
                    Gira y <em>estrena</em>
                  </h2>
                  <p className="mvr-texto">Déjanos tus datos, gira la ruleta y llévate un cupón o un regalo de MoviFashion para tu próxima compra.</p>
                  <label className="mvr-campo">
                    <span>Nombre</span>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" maxLength={60} autoComplete="given-name" />
                  </label>
                  <label className="mvr-campo">
                    <span>Correo electrónico</span>
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" maxLength={120} autoComplete="email" />
                  </label>
                  <label className="mvr-check">
                    <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
                    <span>
                      Autorizo el tratamiento de mis datos personales para recibir mi premio e información comercial, según la{' '}
                      <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">
                        Política de Privacidad
                      </a>{' '}
                      (Ley 1581 de 2012).
                    </span>
                  </label>
                  {error && (
                    <p className="mvr-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" className="mvr-boton">
                    Quiero girar
                  </button>
                </form>
              )}

              {(paso === 'lista' || paso === 'girando') && (
                <div>
                  <h2 id="mvr-titulo" className="mvr-titulo">
                    {paso === 'girando' ? '¡Girando…!' : <>¡Todo listo, {primerNombre}!</>}
                  </h2>
                  <p className="mvr-texto">
                    {paso === 'girando' ? 'Cruza los dedos: la ruleta está decidiendo tu premio.' : 'Tienes un giro. Presiona el botón y descubre qué te llevas hoy.'}
                  </p>
                  {error && (
                    <p className="mvr-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="button" className="mvr-boton mvr-boton-girar" onClick={girar} disabled={paso === 'girando'}>
                    {paso === 'girando' ? 'Girando…' : '¡Girar la ruleta!'}
                  </button>
                  <ul className="mvr-lista-premios">
                    <li>Hasta 30% de descuento</li>
                    <li>Envío gratis nacional</li>
                    <li>Regalos de la marca</li>
                  </ul>
                </div>
              )}

              {paso === 'premio' && ganado && (
                <div aria-live="polite">
                  {!esReintento && <Confeti />}
                  <span className="mvr-insignia">{esReintento ? 'Segunda oportunidad' : `¡Felicitaciones${primerNombre ? `, ${primerNombre}` : ''}!`}</span>
                  <h2 id="mvr-titulo" className="mvr-titulo mvr-titulo-premio">
                    {ganado.titulo}
                  </h2>
                  <p className="mvr-texto">{ganado.descripcion}</p>

                  {esReintento ? (
                    <button type="button" className="mvr-boton mvr-boton-girar" onClick={() => setPaso('lista')}>
                      Girar otra vez
                    </button>
                  ) : (
                    <>
                      <div className="mvr-cupon">
                        <div>
                          <small>Tu código</small>
                          <strong>{ganado.codigo}</strong>
                        </div>
                        <button type="button" onClick={copiar} className="mvr-copiar">
                          {copiado ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="mvr-vigencia">
                        Escríbelo en el campo «Cupón» al pagar.
                        {guardado?.expira ? ` Válido hasta el ${fechaLarga(guardado.expira)}.` : ''}
                      </p>
                      <button type="button" className="mvr-boton" onClick={irAComprar}>
                        Usar mi cupón ahora
                      </button>
                      <button type="button" className="mvr-enlace" onClick={cerrar}>
                        Seguir mirando la tienda
                      </button>
                    </>
                  )}
                </div>
              )}

              <button type="button" className="mvr-terminos-boton" onClick={() => setVerTerminos((v) => !v)} aria-expanded={verTerminos}>
                {verTerminos ? 'Ocultar condiciones' : 'Condiciones de la actividad'}
              </button>
              {verTerminos && (
                <p className="mvr-terminos">
                  Actividad promocional de MoviFashion. Un giro por persona y por correo electrónico. Cupón válido por {DIAS_VIGENCIA} días calendario, de un solo uso, no acumulable con otros
                  cupones ni canjeable por dinero. El envío gratis aplica a destinos nacionales. El regalo sorpresa se entrega con el siguiente pedido y está sujeto a disponibilidad. Los descuentos se
                  calculan sobre precios con IVA incluido.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Confeti (solo CSS, sin librerías)                                   */
/* ------------------------------------------------------------------ */
function Confeti() {
  const piezas = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        izquierda: Math.round(aleatorio() * 100),
        retraso: Math.round(aleatorio() * 600),
        duracion: 1800 + Math.round(aleatorio() * 1400),
        color: ['#7656D6', '#F5B841', '#E9E2FA', '#30234F', '#22C55E'][i % 5],
        giro: Math.round(aleatorio() * 360),
      })),
    []
  );
  return (
    <div className="mvr-confeti" aria-hidden="true">
      {piezas.map((p, i) => (
        <i key={i} style={{ left: `${p.izquierda}%`, background: p.color, animationDelay: `${p.retraso}ms`, animationDuration: `${p.duracion}ms`, transform: `rotate(${p.giro}deg)` }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos (paleta MoviFashion: #7656D6 · #30234F · #E9E2FA · #F5F5F8) */
/* ------------------------------------------------------------------ */
const ESTILOS = `
.mvr-lanzador{position:fixed;left:20px;bottom:24px;z-index:60;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border:0;border-radius:999px;background:linear-gradient(135deg,#7656D6,#30234F);color:#fff;font:inherit;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 10px 28px rgba(48,35,79,.38);animation:mvr-latido 2.6s ease-in-out infinite}
.mvr-lanzador:hover{filter:brightness(1.08)}
.mvr-lanzador-icono{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#F5B841;color:#30234F}
@media (max-width:767px){.mvr-lanzador{left:12px;bottom:84px;padding:8px 14px 8px 8px;font-size:13px}}
@keyframes mvr-latido{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.mvr-fondo{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;z-index:100;display:flex;padding:16px;box-sizing:border-box;background:rgba(24,17,43,.72);backdrop-filter:blur(6px);animation:mvr-aparecer .25s ease-out;overflow-y:auto}
.mvr-modal{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);width:min(880px,100%);margin:auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45);animation:mvr-subir .35s cubic-bezier(.2,.9,.3,1.2);color:#25232B;text-align:left}
@media (max-width:767px){.mvr-modal{grid-template-columns:minmax(0,1fr);border-radius:22px}}
@keyframes mvr-aparecer{from{opacity:0}to{opacity:1}}
@keyframes mvr-subir{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.mvr-cerrar{position:absolute;top:14px;right:14px;z-index:3;display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:#F5F5F8;color:#30234F;cursor:pointer}
.mvr-cerrar:hover{background:#E9E2FA}
.mvr-cerrar:disabled{opacity:.4;cursor:not-allowed}
.mvr-lado-ruleta{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:30px 24px;background:radial-gradient(circle at 50% 35%,#4A3590 0%,#30234F 62%,#221838 100%)}
@media (max-width:767px){.mvr-lado-ruleta{padding:18px 14px 14px;gap:10px}.mvr-ruleta-caja{width:min(250px,62vw)!important}.mvr-nota-ruleta{display:none}.mvr-etiqueta{font-size:10px;align-self:flex-start;max-width:calc(100% - 48px);text-align:left}}
.mvr-etiqueta{padding:5px 12px;border-radius:999px;background:rgba(233,226,250,.14);border:1px solid rgba(233,226,250,.28);color:#E9E2FA;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;text-align:center}
.mvr-nota-ruleta{margin:0;color:#C7B5F8;font-size:12px;text-align:center}
.mvr-ruleta-caja{position:relative;width:min(340px,74vw);aspect-ratio:1/1}
.mvr-ruleta{width:100%;height:100%;display:block;border-radius:50%;filter:drop-shadow(0 14px 26px rgba(0,0,0,.45));transition-property:transform;transition-timing-function:cubic-bezier(.12,.72,.08,1);font-family:inherit}
.mvr-puntero{position:absolute;top:-16px;left:50%;z-index:2;margin-left:-20px;transform-origin:50% 20%;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}
.mvr-puntero svg{display:block}
.mvr-puntero-activo{animation:mvr-tic .16s linear infinite}
@keyframes mvr-tic{0%,100%{transform:rotate(0)}50%{transform:rotate(-13deg)}}
.mvr-lado-contenido{position:relative;display:flex;flex-direction:column;justify-content:center;padding:44px 34px 26px;overflow:hidden}
@media (max-width:767px){.mvr-lado-contenido{padding:22px 20px 18px}}
.mvr-titulo{margin:0 0 8px;font-size:34px;line-height:1.08;font-weight:800;letter-spacing:-.03em;color:#30234F}
.mvr-titulo em{font-style:normal;color:#7656D6}
.mvr-titulo-premio{font-size:27px}
@media (max-width:767px){.mvr-titulo{font-size:26px}.mvr-titulo-premio{font-size:22px}}
.mvr-texto{margin:0 0 18px;font-size:14.5px;line-height:1.55;color:#5B5870}
.mvr-campo{display:block;margin-bottom:12px}
.mvr-campo span{display:block;margin-bottom:5px;font-size:12.5px;font-weight:700;color:#30234F}
.mvr-campo input{width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #DDD8EC;border-radius:12px;background:#fff;font:inherit;font-size:14.5px;color:#25232B;outline:none}
.mvr-campo input:focus{border-color:#7656D6;box-shadow:0 0 0 3px rgba(118,86,214,.18)}
.mvr-check{display:flex;gap:9px;align-items:flex-start;margin:4px 0 14px;font-size:11.5px;line-height:1.45;color:#5B5870;cursor:pointer}
.mvr-check input{margin-top:2px;width:16px;height:16px;accent-color:#7656D6;flex:none}
.mvr-check a{color:#7656D6;font-weight:700;text-decoration:underline}
.mvr-error{margin:0 0 12px;padding:9px 12px;border-radius:10px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:12.5px}
.mvr-boton{display:block;width:100%;padding:14px 18px;border:0;border-radius:14px;background:#7656D6;color:#fff;font:inherit;font-size:15.5px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(118,86,214,.35);transition:transform .15s,filter .15s}
.mvr-boton:hover{filter:brightness(1.07);transform:translateY(-1px)}
.mvr-boton:disabled{opacity:.6;cursor:wait;transform:none}
.mvr-boton-girar{background:linear-gradient(135deg,#F5B841,#F59E0B);color:#30234F;box-shadow:0 8px 20px rgba(245,184,65,.42)}
.mvr-lista-premios{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0;padding:0;list-style:none}
.mvr-lista-premios li{padding:6px 11px;border-radius:999px;background:#F5F5F8;color:#30234F;font-size:12px;font-weight:600}
.mvr-insignia{display:inline-block;margin-bottom:10px;padding:5px 12px;border-radius:999px;background:#E9E2FA;color:#30234F;font-size:12px;font-weight:800}
.mvr-cupon{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;padding:14px 16px;border:2px dashed #7656D6;border-radius:16px;background:#F7F4FE}
.mvr-cupon small{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7A7691}
.mvr-cupon strong{font-family:'JetBrains Mono',ui-monospace,Consolas,monospace;font-size:25px;letter-spacing:.06em;color:#30234F}
.mvr-copiar{flex:none;padding:9px 14px;border:0;border-radius:10px;background:#30234F;color:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.mvr-vigencia{margin:0 0 14px;font-size:12.5px;color:#5B5870}
.mvr-enlace{display:block;width:100%;margin-top:8px;padding:8px;border:0;background:none;color:#7656D6;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}
.mvr-terminos-boton{align-self:flex-start;margin-top:18px;padding:0;border:0;background:none;color:#8B87A0;font:inherit;font-size:11.5px;text-decoration:underline;cursor:pointer}
.mvr-terminos{margin:8px 0 0;font-size:11px;line-height:1.5;color:#8B87A0}
.mvr-confeti{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.mvr-confeti i{position:absolute;top:-14px;width:8px;height:14px;border-radius:2px;opacity:.95;animation-name:mvr-caer;animation-timing-function:cubic-bezier(.3,.6,.5,1);animation-fill-mode:forwards}
@keyframes mvr-caer{to{top:108%;opacity:0;transform:rotate(540deg) translateX(30px)}}
@media (prefers-reduced-motion:reduce){.mvr-lanzador,.mvr-puntero-activo{animation:none}.mvr-confeti{display:none}}
`;
