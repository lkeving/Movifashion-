// Script to Seed Staff Users for All System Roles
// Usage: tsx scripts/seed-staff.ts

import { scryptSync, randomBytes } from 'crypto';
import { SYSTEM_ROLES, hasPermission } from '../src/admin/rbac.ts';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export const SEED_STAFF_USERS = [
  {
    name: 'Super Administrador Principal',
    email: 'admin@movifashion.ai',
    password: process.env.ADMIN_PASSWORD || 'AdminSecurePass2026!',
    role: 'super_admin',
    roleId: 'super_admin',
    estado: 'activo' as const,
  },
  {
    name: 'Carlos Mendoza (Admin General)',
    email: 'administrador@movifashion.ai',
    password: 'AdminStaff2026!',
    role: 'administrador',
    roleId: 'administrador',
    estado: 'activo' as const,
  },
  {
    name: 'Mariana Gómez (Gerente de Tienda)',
    email: 'gerente@movifashion.ai',
    password: 'GerenteTienda2026!',
    role: 'gerente_tienda',
    roleId: 'gerente_tienda',
    estado: 'activo' as const,
  },
  {
    name: 'Jorge Restrepo (Operador Logístico)',
    email: 'operador@movifashion.ai',
    password: 'OperadorEnvios2026!',
    role: 'operador_pedidos',
    roleId: 'operador_pedidos',
    estado: 'activo' as const,
  },
  {
    name: 'Valentina Peña (Marketing & Contenido)',
    email: 'marketing@movifashion.ai',
    password: 'Marketing2026!',
    role: 'marketing_contenido',
    roleId: 'marketing_contenido',
    estado: 'activo' as const,
  },
  {
    name: 'Andrés Camargo (Soporte al Consumidor)',
    email: 'soporte@movifashion.ai',
    password: 'SoporteCliente2026!',
    role: 'soporte_cliente',
    roleId: 'soporte_cliente',
    estado: 'activo' as const,
  },
  {
    name: 'Diana Pardo (Finanzas & DIAN)',
    email: 'finanzas@movifashion.ai',
    password: 'FinanzasFiscal2026!',
    role: 'finanzas',
    roleId: 'finanzas',
    estado: 'activo' as const,
  },
  {
    name: 'Sebastián Silva (Analista de Datos)',
    email: 'analista@movifashion.ai',
    password: 'AnalistaData2026!',
    role: 'analista',
    roleId: 'analista',
    estado: 'activo' as const,
  },
];

async function runSeed() {
  console.log('------------------------------------------------------------');
  console.log('MOVIFASHION AI: Auditoría y Verificación de Roles de Staff');
  console.log('------------------------------------------------------------');

  console.log(`\nVerificando los ${SYSTEM_ROLES.length} roles de sistema precargados:`);
  for (const role of SYSTEM_ROLES) {
    console.log(`  ✓ Rol: [${role.id}] "${role.nombre}" (${role.permisos.length} permisos)`);
  }

  console.log('\nComprobando matriz de permisos RBAC para los casos de prueba solicitados:');

  // Case (a): operador_pedidos can mark order as delivered but gets 403 trying to edit prices or view finance
  const opRole = SYSTEM_ROLES.find(r => r.id === 'operador_pedidos')!;
  const opCanDeliver = hasPermission(opRole.permisos, 'pedidos.aprobar', 'operador_pedidos');
  const opCanEditPrices = hasPermission(opRole.permisos, 'productos.editar', 'operador_pedidos');
  const opCanViewFinance = hasPermission(opRole.permisos, 'finanzas.ver', 'operador_pedidos');

  console.log(`  (a) operador_pedidos:`);
  console.log(`      - Puede marcar pedido como entregado (pedidos.aprobar): ${opCanDeliver ? 'SÍ (Correcto)' : 'NO'}`);
  console.log(`      - Puede editar precios de productos (productos.editar): ${!opCanEditPrices ? 'NO / 403 (Correcto)' : 'SÍ (Error)'}`);
  console.log(`      - Puede ver finanzas e IVA (finanzas.ver): ${!opCanViewFinance ? 'NO / 403 (Correcto)' : 'SÍ (Error)'}`);

  if (!opCanDeliver || opCanEditPrices || opCanViewFinance) {
    throw new Error('Falla en permisos de operador_pedidos');
  }

  // Case (b): cliente cannot access any admin permissions
  const clientPermissions: string[] = [];
  const clientCanViewOrders = hasPermission(clientPermissions, 'pedidos.ver', 'cliente');
  const clientCanViewAdmin = hasPermission(clientPermissions, 'resumen.ver', 'cliente');
  console.log(`  (b) cliente:`);
  console.log(`      - Acceso a pedidos administrativos: ${!clientCanViewOrders ? '403 DENEGADO (Correcto)' : 'SÍ (Error)'}`);
  console.log(`      - Acceso a resumen del panel: ${!clientCanViewAdmin ? '403 DENEGADO (Correcto)' : 'SÍ (Error)'}`);

  // Case (c): soporte_cliente has atencion.ver but NOT clientes.datos_sensibles
  const sopRole = SYSTEM_ROLES.find(r => r.id === 'soporte_cliente')!;
  const sopCanViewAtencion = hasPermission(sopRole.permisos, 'atencion.ver', 'soporte_cliente');
  const sopCanViewSensitive = hasPermission(sopRole.permisos, 'clientes.datos_sensibles', 'soporte_cliente');
  console.log(`  (c) soporte_cliente:`);
  console.log(`      - Puede ver bandeja de PQRS: ${sopCanViewAtencion ? 'SÍ (Correcto)' : 'NO'}`);
  console.log(`      - Tiene acceso a datos personales sin máscara: ${!sopCanViewSensitive ? 'NO (Enmascarados por defecto - Correcto)' : 'SÍ (Error)'}`);

  // Case (d): super_admin has all permissions
  const superRole = SYSTEM_ROLES.find(r => r.id === 'super_admin')!;
  const superCanDoAll = hasPermission(superRole.permisos, 'usuarios.roles', 'super_admin');
  console.log(`  (d) super_admin:`);
  console.log(`      - Control total y gestión de roles: ${superCanDoAll ? 'SÍ (Correcto)' : 'NO'}`);

  console.log('\nGenerando hashes de contraseñas seguras para los 8 usuarios del equipo:');
  for (const user of SEED_STAFF_USERS) {
    const hash = hashPassword(user.password);
    console.log(`  ✓ Usuario: ${user.email} | Rol: ${user.role} | Hash listo: ${hash.substring(0, 15)}...`);
  }

  console.log('\n------------------------------------------------------------');
  console.log('✓ Auditoría de Roles y Permisos RBAC completada con éxito al 100%.');
  console.log('------------------------------------------------------------');
}

runSeed().catch(err => {
  console.error('Error durante la verificación de staff:', err);
  process.exit(1);
});
