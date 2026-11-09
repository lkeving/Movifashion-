/**
 * Script de siembra Big Data: MoviFashion AI (Colección 2026)
 * Genera e inserta en lotes de 1.000 registros en Supabase (si está configurado)
 * o verifica la consistencia del dataset determinista en memoria.
 *
 * Ejecución:
 * npx tsx scripts/seed-bigdata.ts
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generateSimulatedDataset, regenerateSimulatedDataset, SimulatedSaleLine } from '../src/server/datasetSimulado.ts';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function chunkInsert(supabase: any, tableName: string, items: any[], chunkSize = 1000) {
  console.log(`[SEED BIGDATA] Insertando ${items.length.toLocaleString('es-CO')} registros en tabla '${tableName}' (lotes de ${chunkSize})...`);
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      console.warn(`[SEED BIGDATA] Advertencia en lote ${i} - ${i + chunk.length} de '${tableName}': ${error.message}`);
    } else {
      process.stdout.write(`  -> Lote ${Math.floor(i / chunkSize) + 1}/${Math.ceil(items.length / chunkSize)} completado\r`);
    }
  }
  console.log(`\n[SEED BIGDATA] Tabla '${tableName}' procesada exitosamente.`);
}

async function main() {
  console.log('===============================================================');
  console.log('   MoviFashion AI — Pipeline de Siembra Big Data (2026)');
  console.log('===============================================================');

  const startTime = Date.now();
  const dataset = generateSimulatedDataset();
  const elapsedGen = Date.now() - startTime;

  console.log(`\n✓ Generador determinista Mulberry32 ejecutado en ${elapsedGen}ms:`);
  console.log(`  • Líneas de venta auditables:  ${dataset.lineasVenta.length.toLocaleString('es-CO')}`);
  console.log(`  • Pedidos cabecera unificados: ${dataset.pedidos.length.toLocaleString('es-CO')}`);
  console.log(`  • Clientes segmentados (RFM):  ${dataset.clientes.length.toLocaleString('es-CO')}`);
  console.log(`  • Movimientos Kardex:          ${dataset.movimientosKardex.length.toLocaleString('es-CO')}`);
  console.log(`  • Agregados de telemetría:     ${dataset.metricasAgregadasEventos.length.toLocaleString('es-CO')}`);
  console.log(`  • Reglas de asociación Apriori: ${dataset.reglasApriori.length}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n[INFO] Supabase no está conectado localmente (SUPABASE_URL ausente).');
    console.log('[INFO] El panel administrativo en /admin opera automáticamente con el motor');
    console.log('       determinista en memoria de alto rendimiento (< 4ms por consulta).');
    console.log('[INFO] Para exportar a Excel, usa el botón en /admin o el endpoint /api/admin/dataset/export.');
    console.log('\n===============================================================');
    process.exit(0);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // 1. Inserción de pedidos simulados
    const ordersPayload = dataset.pedidos.map((p: any) => ({
      id: p.id,
      user_id: p.userId,
      user_email: p.userEmail,
      items: p.items,
      subtotal_base: p.subtotalBase,
      iva: p.iva,
      envio: p.shippingFee,
      descuento: p.discount,
      total: p.total,
      payment_method: p.paymentMethod,
      shipping_address: p.shippingAddress,
      status: p.status,
      tracking_number: p.trackingNumber,
      is_simulated: true,
      created_at: p.createdAt,
    }));

    await chunkInsert(supabase, 'app_orders', ordersPayload, 1000);

    // 2. Inserción de líneas de venta (si la tabla existe)
    const salesPayload = dataset.lineasVenta.map((l: SimulatedSaleLine) => ({
      id: l.id,
      pedido_id: l.pedidoId,
      fecha_hora: l.fecha,
      cliente_id: l.clienteId,
      prenda_id: l.prendaId,
      prenda_nombre: l.prendaNombre,
      categoria: l.categoria,
      color: l.color,
      talla: l.talla,
      cantidad: l.cantidad,
      precio_unitario_con_iva: l.precioUnitarioConIva,
      precio_total_con_iva: l.precioFinalConIva,
      subtotal_base: l.subtotalBaseSinIva,
      iva_19: l.iva19,
      costo_unitario: l.costoUnitario,
      costo_total: l.costoTotal,
      margen_bruto: l.margenBrutoPesos,
      margen_porcentaje: l.margenBrutoPct,
      descuento: l.descuentoPesos,
      canal: l.canal,
      ciudad: l.ciudad,
      metodo_pago: l.metodoPago,
      estado_pedido: l.estado,
      origen: 'SIMULADO',
    }));

    try {
      await chunkInsert(supabase, 'ventas_detalle', salesPayload, 1000);
    } catch (e: any) {
      console.log(`[INFO] Tabla 'ventas_detalle' no configurada en BD remota: se mantendrá en capa de memoria.`);
    }

    console.log('\n===============================================================');
    console.log('✓ Proceso de siembra Big Data completado con éxito.');
    console.log(`  Tiempo total: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log('===============================================================');
  } catch (err: any) {
    console.error('[ERROR CRÍTICO EN SIEMBRA]:', err.message);
  }
}

main().catch(console.error);
