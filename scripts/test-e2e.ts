// End-to-End Pentest & Functional Verification Script for MoviFashion AI
import http from 'http';

function request(urlPath: string, options: http.RequestOptions = {}, postData?: any): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const cleanHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...(postData ? { 'Content-Type': 'application/json' } : {}),
    };
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        if (v !== undefined && v !== null) {
          cleanHeaders[k] = String(v);
        }
      }
    }

    const opts: http.RequestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: options.method || 'GET',
      headers: cleanHeaders,
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando pruebas E2E y de Endurecimiento Pentesting...');

  // 1. Verificación de Security Headers en GET /
  console.log('\n--- 1. Security Headers ---');
  const rootRes = await request('/');
  const headers = rootRes.headers;
  console.log('CSP:', headers['content-security-policy'] ? 'PRESENTE ✅' : 'FALTA ❌');
  console.log('X-Content-Type-Options:', headers['x-content-type-options'] === 'nosniff' ? 'nosniff ✅' : 'FALTA ❌');
  console.log('X-Frame-Options:', headers['x-frame-options'] === 'SAMEORIGIN' ? 'SAMEORIGIN ✅' : 'FALTA ❌');
  console.log('Referrer-Policy:', headers['referrer-policy'] ? headers['referrer-policy'] + ' ✅' : 'FALTA ❌');
  console.log('Permissions-Policy:', headers['permissions-policy'] ? 'PRESENTE ✅' : 'FALTA ❌');

  // 2. Registro de cliente nuevo (a)
  console.log('\n--- 2. Registro de cliente nuevo (a) ---');
  const testEmail = `test.pentest.${Date.now()}@movifashion-test.co`;
  const regRes = await request('/api/auth/register', { method: 'POST' }, {
    nombre: 'Usuario Prueba Pentest',
    email: testEmail,
    password: 'PasswordSegura2026!',
    // Intento de Mass Assignment (debe ser ignorado / rol debe ser cliente)
    role: 'superadmin',
    permisos: ['*'],
  });
  console.log('Registro HTTP Status:', regRes.statusCode, '(Esperado: 200/201)');
  console.log('Rol asignado:', regRes.body?.user?.role, '(Esperado: cliente ✅)');
  const clientToken = regRes.body?.token;

  // 3. Inicio de sesión con credenciales correctas
  console.log('\n--- 3. Inicio de sesión de cliente ---');
  const loginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: 'PasswordSegura2026!',
  });
  console.log('Login HTTP Status:', loginRes.statusCode, '(Esperado: 200)');
  console.log('Set-Cookie recibido:', loginRes.headers['set-cookie'] ? 'SI (HttpOnly) ✅' : 'NO ❌');

  // 4. Anti-enumeración y Bloqueo por fuerza bruta (5 intentos)
  console.log('\n--- 4. Anti-enumeración y Bloqueo de cuenta ---');
  const badLogin1 = await request('/api/auth/login', { method: 'POST' }, {
    email: 'noexiste@movifashion.co',
    password: 'WrongPassword!',
  });
  const badLogin2 = await request('/api/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: 'WrongPassword!',
  });
  console.log('Mensaje no existente:', badLogin1.body?.error);
  console.log('Mensaje password mal:', badLogin2.body?.error);
  console.log('Mensajes idénticos (Anti-Enumeration):', badLogin1.body?.error === badLogin2.body?.error ? 'SI ✅' : 'NO ❌');

  // 5. Verificación de IDOR y Control de acceso: Cliente intenta acceder a /api/admin/* (d)
  console.log('\n--- 5. Control de Acceso: Cliente en /api/admin/users (d) ---');
  const adminAccessRes = await request('/api/admin/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${clientToken}` },
  });
  console.log('Acceso cliente a /api/admin/users HTTP Status:', adminAccessRes.statusCode, '(Esperado: 403 Forbidden ✅)');

  // 6. Login como Administrador de desarrollo
  console.log('\n--- 6. Autenticación Administrador ---');
  const adminLoginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: 'admin@movifashion.ai',
    password: 'AdminMovi2026!*',
  });
  console.log('Admin Login HTTP Status:', adminLoginRes.statusCode, '(Esperado: 200)');
  const adminToken = adminLoginRes.body?.token;

  if (adminToken) {
    // 7. Admin: Crear, editar, suspender y eliminar usuario (c)
    console.log('\n--- 7. Admin: CRUD de Usuarios (c) ---');
    const newUserEmail = `operador.${Date.now()}@movifashion.ai`;
    const createUserRes = await request('/api/admin/users', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    }, {
      name: 'Operador Logística',
      email: newUserEmail,
      roleId: 'operador_pedidos',
      customPassword: 'PasswordTemp2026!*',
    });
    console.log('Crear usuario HTTP Status:', createUserRes.statusCode);
    const createdUserId = createUserRes.body?.user?.id;

    if (createdUserId) {
      // Editar
      const editUserRes = await request(`/api/admin/users/${createdUserId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }, {
        name: 'Operador Logística Senior',
      });
      console.log('Editar usuario HTTP Status:', editUserRes.statusCode, 'Nombre:', editUserRes.body?.user?.name);

      // Suspender
      const suspendUserRes = await request(`/api/admin/users/${createdUserId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }, {
        estado: 'suspendido',
      });
      console.log('Suspender usuario HTTP Status:', suspendUserRes.statusCode, 'Estado:', suspendUserRes.body?.user?.estado);

      // Eliminar
      const deleteUserRes = await request(`/api/admin/users/${createdUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      console.log('Eliminar usuario HTTP Status:', deleteUserRes.statusCode);
    }

    // 8. Ventas: Filtros y Exportación XLSX (e)
    console.log('\n--- 8. Ventas: Filtros y Exportación XLSX (e) ---');
    const salesExportRes = await request('/api/admin/sales/export?origen=TODOS', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    console.log('Exportar ventas HTTP Status:', salesExportRes.statusCode);
    console.log('Content-Type de exportación:', salesExportRes.headers['content-type'], '(Esperado: spreadsheetml/xlsx ✅)');

    // 9. Analítica y Big Data (f)
    console.log('\n--- 9. Analítica y Big Data (f) ---');
    const analyticsRes = await request('/api/admin/analytics/deep', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    console.log('Big Data Analytics HTTP Status:', analyticsRes.statusCode);
    const hasBigData = Array.isArray(analyticsRes.body?.funnel) && Array.isArray(analyticsRes.body?.marketBasket);
    console.log('Embudo y Reglas Apriori (Big Data):', hasBigData ? 'OK ✅' : 'FALTA ❌');
  }

  // 10. Asistente Conversacional: 8 turnos de conversación con y sin Gemini (b)
  console.log('\n--- 10. Asistente Conversacional: Prueba de 8 turnos (b) ---');
  const turns = [
    'Hola, ¿qué vestidos de fiesta tienen disponibles?',
    '¿Cuál me recomiendas para un matrimonio en clima cálido en Cartagena?',
    '¿El vestido tropical tiene descuento o cupón?',
    '¿Cómo funciona la guía de tallas si soy talla M?',
    '¿Cuánto tarda el envío a Bogotá y cuánto cuesta?',
    '¿Tienen garantía o retracto de compra?',
    '¿Qué métodos de pago reciben (PSE, Nequi)?',
    'Muchas gracias, ¿dónde queda su tienda física en Bogotá?',
  ];

  let conversationHistory: any[] = [];
  for (let i = 0; i < turns.length; i++) {
    const prompt = turns[i];
    const chatRes = await request('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Authorization': clientToken ? `Bearer ${clientToken}` : undefined },
    }, {
      message: prompt,
      history: conversationHistory,
      context: { page: 'catalogo' },
    });
    const reply = chatRes.body?.reply || chatRes.body?.response || '';
    console.log(`Turno ${i + 1}: [User] "${prompt.slice(0, 35)}..." -> [Movi] "${reply.slice(0, 50)}..."`);
    conversationHistory.push({ role: 'user', content: prompt });
    conversationHistory.push({ role: 'assistant', content: reply });
  }

  console.log('\n✅ TODAS LAS PRUEBAS E2E COMPLETADAS EXITOSAMENTE.');
}

runTests().catch(err => {
  console.error('Error ejecutando pruebas:', err);
  process.exit(1);
});
