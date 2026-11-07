/**
 * UTILIDADES DE LIQUIDACIÓN TRIBUTARIA (COLOMBIA)
 * 
 * En Colombia, el Estatuto Tributario establece para prendas de vestir y calzado
 * una tarifa general de IVA del 19%.
 * 
 * En el comercio electrónico B2C al consumidor final en Colombia, los precios
 * exhibidos incluyen obligatoriamente el IVA (artículo 26 Ley 1480 de 2011).
 * 
 * Estas funciones calculan con exactitud la base gravable antes de impuesto y el IVA
 * para efectos de facturación electrónica, comprobantes y desglose contable.
 */

export const TARIFA_IVA = 0.19; // 19% tarifa general en Colombia
export const PORCENTAJE_IVA_LABEL = '19%';

export interface DesgloseTributario {
  /** Precio final con IVA incluido */
  totalConIva: number;
  /** Base gravable liquidada (redondeada al peso) */
  baseGravable: number;
  /** Valor del IVA liquidado (total - base) */
  iva: number;
  /** Tarifa porcentual aplicada (0.19) */
  tarifaIva: number;
}

/**
 * Calcula la base gravable a partir de un valor final que ya incluye IVA.
 * Base = Total / 1.19
 */
export function calcularBaseGravable(totalConIva: number): number {
  if (!totalConIva || totalConIva <= 0) return 0;
  return Math.round(totalConIva / (1 + TARIFA_IVA));
}

/**
 * Calcula el valor del IVA a partir de un valor final que ya incluye IVA.
 * IVA = Total - Base Gravable
 */
export function calcularIva(totalConIva: number): number {
  if (!totalConIva || totalConIva <= 0) return 0;
  const base = calcularBaseGravable(totalConIva);
  return totalConIva - base;
}

/**
 * Retorna el desglose completo (Base, IVA y Total)
 */
export function obtenerDesgloseTributario(totalConIva: number): DesgloseTributario {
  const baseGravable = calcularBaseGravable(totalConIva);
  const iva = totalConIva - baseGravable;
  return {
    totalConIva,
    baseGravable,
    iva,
    tarifaIva: TARIFA_IVA,
  };
}

/**
 * Formatea un valor en Pesos Colombianos (COP) estándar sin decimales.
 * Ejemplo: 189000 -> "$ 189.000 COP"
 */
export function formatCOP(valor: number, incluirSufijo: boolean = true): string {
  if (typeof valor !== 'number' || isNaN(valor)) valor = 0;
  const formateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);

  return incluirSufijo ? `${formateado} COP` : formateado;
}
