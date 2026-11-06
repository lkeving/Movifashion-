/**
 * Script to seed ~300 simulated orders across the last 90 days and ~3,000 behavior events
 * with realistic seasonality (quincena spikes on 15th/30th and weekend sales increases).
 * Can be run via: tsx scripts/seed-analytics.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts.ts';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function seedAnalyticsData() {
  console.log('[SEED ANALYTICS] Iniciando generación de datos de analítica Big Data...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[SEED ANALYTICS] Variables de Supabase no configuradas en entorno local.');
    console.log('[SEED ANALYTICS] Los datos simulados se generarán en la memoria del servidor a través de POST /api/admin/seed-demo-data.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const sampleNames = [
    'Valentina Restrepo', 'Santiago Gómez', 'Camila Osorio', 'Andrés Felipe Mejía',
    'Isabella Morales', 'Mateo Ramírez', 'Mariana Duque', 'Sebastián Jaramillo',
    'Laura Sofía Castro', 'Daniel Echeverri', 'Alejandra Cardona', 'Juan Pablo Arango'
  ];

  const cities = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira'];
  const paymentMethods = ['credit_card', 'pse', 'cash_on_delivery'];

  const ordersToInsert: any[] = [];
  const eventsToInsert: any[] = [];

  for (let i = 0; i < 300; i++) {
    const randomOffset = Math.random() * ninetyDaysMs;
    const orderDate = new Date(now - randomOffset);
    const dayOfMonth = orderDate.getDate();
    const dayOfWeek = orderDate.getDay();

    const isSeasonPeak = (dayOfMonth >= 14 && dayOfMonth <= 17) || (dayOfMonth >= 29 || dayOfMonth <= 2) || (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);
    const itemCount = isSeasonPeak ? (Math.random() > 0.5 ? 2 : 3) : 1;

    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
      const price = prod.discountPrice || prod.price;
      const qty = Math.random() > 0.8 ? 2 : 1;
      subtotal += price * qty;
      items.push({
        id: `item-seed-${i}-${j}`,
        product: prod,
        selectedSize: prod.sizes[0] || 'M',
        selectedColor: prod.colors[0] || { name: 'Estándar', hex: '#25232B' },
        quantity: qty,
      });
    }

    const shipping = subtotal >= 200000 ? 0 : 15000;
    const total = subtotal + shipping;
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const orderRecord = {
      id: `DEMO-ORD-${2000 + i}`,
      user_name: randomName,
      user_email: `${randomName.toLowerCase().replace(/[^a-z]+/g, '')}@ejemplo.co`,
      items,
      subtotal,
      shipping,
      discount: 0,
      total,
      status: i % 10 === 0 ? 'Entregado' : i % 5 === 0 ? 'Enviado' : 'Confirmado',
      shipping_address: {
        id: `addr-seed-${i}`,
        recipientName: randomName,
        street: `Calle ${15 + (i % 70)} # ${20 + (i % 50)} - ${10 + (i % 30)}`,
        city: randomCity,
        department: randomCity === 'Medellín' ? 'Antioquia' : randomCity === 'Bogotá' ? 'Cundinamarca' : 'Valle',
        phone: `+57 31${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
      payment_method: payMethod,
      payment_status: payMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      tracking_number: `MOV-COL-${Math.floor(100000 + Math.random() * 900000)}`,
      simulated: true,
      created_at: orderDate.toISOString(),
    };

    ordersToInsert.push(orderRecord);

    eventsToInsert.push({
      session_id: `seed_sess_${i}`,
      event_type: 'compra',
      metadata: { orderId: orderRecord.id, total: orderRecord.total },
      simulated: true,
      created_at: orderDate.toISOString(),
    });
  }

  // 2,700 behavioral events
  for (let k = 0; k < 2700; k++) {
    const randomDate = new Date(now - Math.random() * ninetyDaysMs).toISOString();
    const randProd = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
    const types = ['view_product', 'view_product', 'page_view', 'add_to_cart', 'search', 'consulta_asistente'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    eventsToInsert.push({
      session_id: `seed_sess_${k % 400}`,
      event_type: chosenType,
      product_id: randProd.id,
      category: randProd.category,
      simulated: true,
      created_at: randomDate,
    });
  }

  console.log(`[SEED ANALYTICS] Subiendo ${ordersToInsert.length} pedidos a Supabase...`);
  const chunkSize = 100;
  for (let c = 0; c < ordersToInsert.length; c += chunkSize) {
    const chunk = ordersToInsert.slice(c, c + chunkSize);
    await supabase.from('app_orders').upsert(chunk, { onConflict: 'id' });
  }

  console.log(`[SEED ANALYTICS] Subiendo ${eventsToInsert.length} eventos a Supabase...`);
  for (let c = 0; c < eventsToInsert.length; c += chunkSize) {
    const chunk = eventsToInsert.slice(c, c + chunkSize);
    await supabase.from('app_events').insert(chunk);
  }

  console.log('✅ [SEED ANALYTICS] Datos de analítica Big Data generados e insertados con éxito.');
}

seedAnalyticsData().catch(console.error);
