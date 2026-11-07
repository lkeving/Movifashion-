import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';

export interface ArticuloConocimiento {
  id: string;
  categoria: 'envios' | 'pagos' | 'cambios' | 'garantias' | 'tallas' | 'empresa' | 'contacto';
  titulo: string;
  preguntaFrecuente?: string;
  resumen: string;
  contenido: string;
  palabrasClave: string[];
}

export const BASE_CONOCIMIENTO: ArticuloConocimiento[] = [
  {
    id: 'envios-tiempos-costos',
    categoria: 'envios',
    titulo: 'Tiempos de entrega y costos de envío en Colombia',
    preguntaFrecuente: '¿Cuánto tiempo tarda en llegar mi pedido y cuánto cuesta el envío?',
    resumen: `Envíos a toda Colombia: gratis a partir de ${formatCOP(EMPRESA.umbralEnvioGratis)}. Ciudades principales de 2 a 3 días hábiles. Tarifa fija de ${formatCOP(EMPRESA.costoEnvioNacional)} para órdenes inferiores.`,
    contenido: `Realizamos despachos a todos los municipios y ciudades de Colombia con empresas transportadoras certificadas (Servientrega, Coordinadora, TCC y Envía).
- Ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Pereira, Manizales, Cartagena): 2 a 3 días hábiles.
- Ciudades intermedias y municipios: 3 a 5 días hábiles.
- Trayectos especiales o zonas de difícil acceso: 5 a 8 días hábiles.
- Costo de envío estándar: ${formatCOP(EMPRESA.costoEnvioNacional)}.
- Envío GRATIS: en todas las compras a partir de ${formatCOP(EMPRESA.umbralEnvioGratis)}.
Una vez despachado el paquete, recibirás por correo y en tu cuenta el número de guía para rastrear el recorrido en tiempo real.`,
    palabrasClave: ['envio', 'envíos', 'despacho', 'cuanto tarda', 'demora', 'costo envio', 'envio gratis', 'flete', 'transportadora', 'coordinadora', 'servientrega'],
  },
  {
    id: 'medios-pago',
    categoria: 'pagos',
    titulo: 'Medios de pago disponibles y seguridad',
    preguntaFrecuente: '¿Qué medios de pago aceptan?',
    resumen: 'Aceptamos Tarjetas de Crédito/Débito (Visa, Mastercard, Amex), PSE con todos los bancos colombianos y Pago Contraentrega en efectivo al recibir.',
    contenido: `En MoviFashion ofrecemos tres medios de pago seguros y directos:
1. Tarjeta de crédito o débito: Visa, Mastercard, American Express y Diners Club con validación en línea y cifrado SSL.
2. PSE (Pagos Seguros en Línea): débito seguro desde tu cuenta corriente o de ahorros de cualquier banco colombiano (Bancolombia, Davivienda, Nequi, Daviplata, BBVA, etc.).
3. Pago Contraentrega: paga en efectivo al mensajero en el momento exacto en que recibes tu paquete en la puerta de tu domicilio en las principales ciudades de Colombia.
Todos los precios publicados en el catálogo incluyen el 19% de IVA según la legislación tributaria colombiana.`,
    palabrasClave: ['pago', 'pagos', 'pse', 'tarjeta', 'contraentrega', 'efectivo', 'nequi', 'daviplata', 'bancolombia', 'seguridad', 'iva'],
  },
  {
    id: 'politica-cambios',
    categoria: 'cambios',
    titulo: 'Política de cambios y devoluciones de prendas',
    preguntaFrecuente: '¿Cómo puedo cambiar una prenda o solicitar una devolución?',
    resumen: `Tienes ${EMPRESA.diasCambioComercial} días calendario para cambios comerciales de talla o color, y ${EMPRESA.diasRetractoLegal} días hábiles para derecho de retracto conforme a la Ley 1480 de 2011.`,
    contenido: `Para solicitar un cambio de talla, modelo o color:
- Plazo comercial: dispones de hasta ${EMPRESA.diasCambioComercial} días calendario desde la fecha de entrega del producto.
- Condiciones: la prenda debe estar en perfecto estado, limpia, sin usar, sin lavar, con sus etiquetas originales intactas y en su empaque original.
- Derecho de Retracto (Estatuto del Consumidor, Ley 1480 de 2011 art. 47): dispones de ${EMPRESA.diasRetractoLegal} días hábiles siguientes a la entrega para solicitar la devolución total del dinero.
- Para iniciar el proceso, comunícate a nuestra línea de WhatsApp ${EMPRESA.whatsapp} o al correo ${EMPRESA.correoContacto} indicando tu número de pedido.`,
    palabrasClave: ['cambio', 'cambios', 'devolucion', 'devolver', 'talla incorrecta', 'retracto', 'devolución dinero', 'reembolso'],
  },
  {
    id: 'garantia-legal',
    categoria: 'garantias',
    titulo: 'Garantía legal por defectos de fabricación',
    preguntaFrecuente: '¿Qué garantía tienen los productos?',
    resumen: `Nuestras prendas cuentan con una garantía legal de ${EMPRESA.diasGarantiaLegal} días calendario por defectos de confección, costuras o materiales.`,
    contenido: `De conformidad con el Estatuto del Consumidor (Ley 1480 de 2011):
- Tiempo de cobertura: ${EMPRESA.diasGarantiaLegal} días calendario contados a partir de la fecha de recepción.
- Cubrimiento: defectos de costura, cierres defectuosos de fábrica, broches, deshilachado prematuro o fallas en el tejido textil bajo instrucciones normales de lavado.
- Exclusiones: desgaste natural por uso, manchas químicas, rasgaduras accidentales o incumplimiento de las instrucciones de lavado presentes en la etiqueta.
- Respuesta técnica: máximo 15 días hábiles a partir de la recepción de la prenda en nuestro centro de inspección.`,
    palabrasClave: ['garantia', 'garantía', 'defecto', 'roto', 'costura', 'calidad', 'reclamo', 'ley 1480', 'sic'],
  },
  {
    id: 'guia-tallas-medicion',
    categoria: 'tallas',
    titulo: 'Guía de tallas y recomendaciones de calce',
    preguntaFrecuente: '¿Cómo sé cuál es mi talla correcta?',
    resumen: 'Ofrecemos guía de medidas corporales (pecho, cintura, cadera) en centímetros para siluetas Oversize, Regular Fit y Slim Fit, además de equivalencias de calzado.',
    contenido: `Para elegir tu talla ideal en MoviFashion:
- Camisetas y Hoodies:
  * Talla S: Pecho 90-96 cm
  * Talla M: Pecho 97-103 cm
  * Talla L: Pecho 104-110 cm
  * Talla XL: Pecho 111-118 cm
  Nuestras siluetas 'Modular Oversize' tienen una caída amplia y relajada. Si prefieres un ajuste al cuerpo, te recomendamos pedir una talla menos.
- Pantalones y Cargos:
  * Talla 28-30 (S): Cintura 76-81 cm
  * Talla 32 (M): Cintura 82-86 cm
  * Talla 34 (L): Cintura 87-92 cm
  * Talla 36 (XL): Cintura 93-98 cm
- Calzado: Tallas colombianas estándar (38 a 43). En cada ficha de producto puedes verificar la guía interactiva.`,
    palabrasClave: ['talla', 'tallas', 'medidas', 'centimetros', 'guia de tallas', 'que talla soy', 'ajuste', 'oversize', 'calzado'],
  },
  {
    id: 'pqrs-procedimiento',
    categoria: 'empresa',
    titulo: 'Radicación de PQRS y tiempos de respuesta legal',
    preguntaFrecuente: '¿Cómo radicar una petición, queja, reclamo o sugerencia (PQRS)?',
    resumen: `Puedes radicar tu solicitud en la sección /pqrs de nuestra web o al correo ${EMPRESA.correoPQRS}. Recibirás un radicado oficial con respuesta en máximo ${EMPRESA.diasRespuestaPQRS} días hábiles.`,
    contenido: `En MoviFashion cumplimos a cabalidad las directrices de la Superintendencia de Industria y Comercio (SIC) y el Estatuto del Consumidor:
- Toda solicitud genera automáticamente un número de radicado con formato PQRS-AAAA-XXXXXX.
- Término legal de respuesta: máximo ${EMPRESA.diasRespuestaPQRS} días hábiles contados a partir del día hábil siguiente a la radicación.
- Consulta en línea: puedes consultar en todo momento el estado de tu PQRS en la ruta /pqrs ingresando tu número de radicado.
- Canales autorizados: formulario web (/pqrs), correo electrónico ${EMPRESA.correoPQRS} o en nuestra línea de atención telefónica.`,
    palabrasClave: ['pqrs', 'queja', 'reclamo', 'peticion', 'sugerencia', 'radicado', 'sic', 'superintendencia', 'denuncia'],
  },
  {
    id: 'quienes-somos-empresa',
    categoria: 'empresa',
    titulo: 'Quiénes somos — Filosofía MoviFashion',
    preguntaFrecuente: '¿Qué es MoviFashion y dónde están ubicados?',
    resumen: `MoviFashion es una marca colombiana de moda contemporánea con diseño urbano y tecnología inteligente, operada legalmente en ${EMPRESA.ciudad}, Colombia.`,
    contenido: `MoviFashion nació con el propósito de conectar la moda de alta durabilidad con el dinamismo urbano contemporáneo. Creemos en prendas funcionales, materiales premium con tacto superior y una experiencia de compra asistida por inteligencia artificial que comprende tus preferencias reales.
- Razón Social: ${EMPRESA.razonSocial}
- NIT: ${EMPRESA.nit}
- Sede: ${EMPRESA.ciudad}, Colombia.
- Lema: ${EMPRESA.lema}`,
    palabrasClave: ['quienes somos', 'historia', 'empresa', 'donde estan', 'marca', 'colombia', 'bogota', 'medellin', 'mision'],
  },
];

/**
 * Búsqueda RAG simple sobre la base de conocimiento por similitud de palabras clave y texto
 */
export function buscarEnBaseConocimiento(consulta: string, limite: number = 3): ArticuloConocimiento[] {
  const palabras = consulta.toLowerCase().split(/\s+/).filter(p => p.length > 2);
  if (palabras.length === 0) return BASE_CONOCIMIENTO.slice(0, limite);

  const conPuntaje = BASE_CONOCIMIENTO.map(articulo => {
    let puntos = 0;
    const textoCompleto = `${articulo.titulo} ${articulo.resumen} ${articulo.contenido} ${articulo.palabrasClave.join(' ')}`.toLowerCase();

    for (const palabra of palabras) {
      if (articulo.palabrasClave.some(pc => pc.includes(palabra))) puntos += 4;
      if (articulo.titulo.toLowerCase().includes(palabra)) puntos += 3;
      if (textoCompleto.includes(palabra)) puntos += 1;
    }

    return { articulo, puntos };
  });

  conPuntaje.sort((a, b) => b.puntos - a.puntos);
  return conPuntaje
    .filter(item => item.puntos > 0)
    .slice(0, limite)
    .map(item => item.articulo);
}
