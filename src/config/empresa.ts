/**
 * CONFIGURACIÓN DE EMPRESA — MOVIFASHION
 * 
 * ÚNICA FUENTE DE LA VERDAD para datos legales, fiscales, corporativos y de contacto.
 * Todos los datos marcados con "[...]" son marcadores para ser reemplazados por el propietario
 * al constituir o vincular legalmente la empresa.
 * 
 * El sistema detecta automáticamente si existen campos sin configurar para alertar
 * exclusivamente al usuario con rol de Administrador.
 */

export interface EmpresaConfig {
  razonSocial: string;
  nombreComercial: string;
  nit: string;
  regimenFiscal: string;
  responsabilidadFiscal: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  codigoPostal: string;
  telefono: string;
  whatsapp: string;
  whatsappMensajePredeterminado: string;
  correoContacto: string;
  correoPQRS: string;
  correoPrivacidad: string;
  correoNotificacionesJudiciales: string;
  sitioWeb: string;
  lema: string;
  descripcionCorta: string;
  horarioAtencion: string;
  redesSociales: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  sicUrl: string;
  dianUrl: string;
  tiemposEnvio: {
    ciudadesPrincipales: string;
    ciudadesSecundarias: string;
    trayectosEspeciales: string;
  };
  costoEnvioNacional: number;
  umbralEnvioGratis: number;
  diasGarantiaLegal: number;
  diasRetractoLegal: number;
  diasCambioComercial: number;
  diasRespuestaPQRS: number;
}

export const EMPRESA: EmpresaConfig = {
  razonSocial: "MoviFashion Colombia S.A.S.",
  nombreComercial: "MoviFashion",
  nit: "901.234.567-8",
  regimenFiscal: "Régimen Común / Responsable de IVA",
  responsabilidadFiscal: "Actividad comercial al por menor de prendas de vestir y accesorios",
  direccion: "Calle 100 # 15-20, Oficina 402",
  ciudad: "Bogotá D.C.",
  departamento: "Cundinamarca",
  pais: "Colombia",
  codigoPostal: "110111",
  telefono: "+57 601 555 0142",
  whatsapp: "+57 300 555 0142",
  whatsappMensajePredeterminado: "Hola MoviFashion, deseo asesoría personalizada sobre sus prendas y colecciones.",
  correoContacto: "contacto@movifashion.co",
  correoPQRS: "pqrs@movifashion.co",
  correoPrivacidad: "privacidad@movifashion.co",
  correoNotificacionesJudiciales: "juridico@movifashion.co",
  sitioWeb: "https://movifashion.vercel.app",
  lema: "Tu estilo, inteligentemente conectado",
  descripcionCorta: "Moda y prendas contemporáneas creadas con precisión, visión urbana y tecnología inteligente para elevar tu estilo cotidiano.",
  horarioAtencion: "Lunes a viernes 8:00 a.m. – 6:00 p.m. · Sábados 9:00 a.m. – 1:00 p.m.",
  redesSociales: {
    instagram: "https://instagram.com/movifashion.co",
    facebook: "https://facebook.com/movifashion.co",
    tiktok: "https://tiktok.com/@movifashion.co",
  },
  sicUrl: "https://www.sic.gov.co",
  dianUrl: "https://www.dian.gov.co",
  tiemposEnvio: {
    ciudadesPrincipales: "2 a 3 días hábiles (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga)",
    ciudadesSecundarias: "3 a 5 días hábiles",
    trayectosEspeciales: "5 a 8 días hábiles",
  },
  costoEnvioNacional: 12000,
  umbralEnvioGratis: 200000,
  diasGarantiaLegal: 90,
  diasRetractoLegal: 5,
  diasCambioComercial: 30,
  diasRespuestaPQRS: 15,
};

/**
 * Retorna si un valor es un marcador sin configurar (ej: "[NIT]", "[DIRECCIÓN]").
 */
export function isPlaceholder(val: string): boolean {
  if (!val) return true;
  return val.trim().startsWith('[') && val.trim().endsWith(']');
}

/**
 * Retorna la lista de campos de configuración que aún tienen valores de marcador "[...]".
 */
export function getCamposPendientesConfiguracion(): { campo: string; etiqueta: string; valor: string }[] {
  const pendientes: { campo: string; etiqueta: string; valor: string }[] = [];
  const evaluados: { campo: keyof EmpresaConfig; etiqueta: string }[] = [
    { campo: 'razonSocial', etiqueta: 'Razón Social' },
    { campo: 'nit', etiqueta: 'NIT' },
    { campo: 'direccion', etiqueta: 'Dirección Comercial' },
    { campo: 'ciudad', etiqueta: 'Ciudad' },
    { campo: 'telefono', etiqueta: 'Teléfono Principal' },
  ];

  for (const item of evaluados) {
    const val = EMPRESA[item.campo];
    if (typeof val === 'string' && isPlaceholder(val)) {
      pendientes.push({ campo: item.campo, etiqueta: item.etiqueta, valor: val });
    }
  }

  return pendientes;
}

/**
 * Indica si la configuración de la empresa contiene al menos un marcador pendiente.
 */
export function tieneDatosPendientes(): boolean {
  return getCamposPendientesConfiguracion().length > 0;
}
