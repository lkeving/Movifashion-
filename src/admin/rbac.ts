// Granular Role-Based Access Control (RBAC) System
// MoviFashion Back-Office - Colombia S.A.S.

import { StaffRole } from '../types/index.ts';

export interface RBACModuleAction {
  id: string; // e.g. 'pedidos.ver'
  module: string; // e.g. 'pedidos'
  action: string; // e.g. 'ver'
  label: string;
  description: string;
}

export const ADMIN_MODULES = [
  {
    id: 'resumen',
    name: 'Resumen General',
    actions: [
      { id: 'resumen.ver', label: 'Ver Resumen', description: 'Visualizar KPIs y métricas generales' },
    ],
  },
  {
    id: 'ventas',
    name: 'Registro de Ventas',
    actions: [
      { id: 'ventas.ver', label: 'Ver Registro de Ventas', description: 'Detalle cronológico auditable con desglose de coste y margen' },
      { id: 'ventas.exportar', label: 'Exportar Ventas a Excel', description: 'Descargar reporte completo en formato .xlsx' },
    ],
  },
  {
    id: 'pedidos',
    name: 'Pedidos',
    actions: [
      { id: 'pedidos.ver', label: 'Ver Pedidos', description: 'Listar y consultar detalle de órdenes' },
      { id: 'pedidos.editar', label: 'Editar Estados y Guías', description: 'Modificar estados y códigos de rastreo' },
      { id: 'pedidos.aprobar', label: 'Marcar Entregado / Cancelar', description: 'Cambiar a entregado o cancelar orden' },
      { id: 'pedidos.exportar', label: 'Exportar Pedidos', description: 'Descargar reportes CSV de pedidos' },
    ],
  },
  {
    id: 'imagenes',
    name: 'Auditoría de Imágenes',
    actions: [
      { id: 'imagenes.ver', label: 'Ver Auditoría de Imágenes', description: 'Analizar pesos, dimensiones y accesibilidad de fotos' },
      { id: 'imagenes.editar', label: 'Reemplazar Imágenes', description: 'Actualizar o regenerar fotos del catálogo' },
    ],
  },
  {
    id: 'informes',
    name: 'Informes Descargables',
    actions: [
      { id: 'informes.ver', label: 'Ver Informes Descargables', description: 'Centro de generación y descarga de informes' },
      { id: 'informes.descargar', label: 'Descargar Reportes Excel/CSV', description: 'Generación de balances fiscales y operativos' },
    ],
  },
  {
    id: 'bigdata',
    name: 'Inteligencia de Mercado y Big Data',
    actions: [
      { id: 'bigdata.ver', label: 'Ver Inteligencia de Mercado', description: 'Analítica de comportamiento, tendencias y big data' },
      { id: 'bigdata.exportar', label: 'Exportar Datos Big Data', description: 'Descargar datasets de eventos y tráfico' },
    ],
  },
  {
    id: 'devoluciones',
    name: 'Devoluciones y Retractos',
    actions: [
      { id: 'devoluciones.ver', label: 'Ver Solicitudes', description: 'Ver solicitudes de retracto y garantía' },
      { id: 'devoluciones.editar', label: 'Gestionar Estado', description: 'Aprobar, rechazar o responder solicitudes' },
      { id: 'devoluciones.aprobar', label: 'Aprobar Reembolso', description: 'Liquidar reembolso simulado y devolver stock' },
    ],
  },
  {
    id: 'productos',
    name: 'Catálogo de Productos',
    actions: [
      { id: 'productos.ver', label: 'Ver Productos', description: 'Listar catálogo y variantes' },
      { id: 'productos.crear', label: 'Crear Producto', description: 'Crear nuevas prendas en catálogo' },
      { id: 'productos.editar', label: 'Editar Producto', description: 'Actualizar precios, fotos y descripciones' },
      { id: 'productos.eliminar', label: 'Papelera (Lógica)', description: 'Enviar a papelera temporal' },
      { id: 'productos.exportar', label: 'Importar / Exportar', description: 'Exportar o importar catálogo en CSV' },
      { id: 'productos.eliminar_definitivo', label: 'Eliminar Definitivo', description: 'Borrado permanente de base de datos' },
    ],
  },
  {
    id: 'inventario',
    name: 'Inventario y Kardex',
    actions: [
      { id: 'inventario.ver', label: 'Ver Inventario', description: 'Consultar existencias y movimientos' },
      { id: 'inventario.editar', label: 'Ajustar Existencias', description: 'Registrar entradas, salidas y conteos' },
      { id: 'inventario.exportar', label: 'Exportar Kardex', description: 'Descargar historial de movimientos' },
    ],
  },
  {
    id: 'categorias',
    name: 'Categorías',
    actions: [
      { id: 'categorias.ver', label: 'Ver Categorías', description: 'Ver lista de categorías' },
      { id: 'categorias.crear', label: 'Crear Categoría', description: 'Crear nueva categoría' },
      { id: 'categorias.editar', label: 'Editar y Ordenar', description: 'Modificar atributos y orden' },
      { id: 'categorias.eliminar', label: 'Eliminar Categoría', description: 'Desactivar o eliminar categoría' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing y Campañas',
    actions: [
      { id: 'marketing.ver', label: 'Ver Campañas', description: 'Consultar cupones y banners' },
      { id: 'marketing.crear', label: 'Crear Cupones/Campañas', description: 'Crear promociones y códigos' },
      { id: 'marketing.editar', label: 'Editar Promociones', description: 'Modificar vigencias y banners' },
      { id: 'marketing.eliminar', label: 'Desactivar / Borrar', description: 'Eliminar cupones o promociones' },
    ],
  },
  {
    id: 'clientes',
    name: 'Gestión de Clientes',
    actions: [
      { id: 'clientes.ver', label: 'Ver Clientes', description: 'Consultar lista y perfiles' },
      { id: 'clientes.editar', label: 'Editar Cliente', description: 'Suspender cuenta o editar notas' },
      { id: 'clientes.datos_sensibles', label: 'Datos Sensibles', description: 'Ver teléfono, cédula y dirección sin máscara' },
      { id: 'clientes.exportar', label: 'Exportar Clientes', description: 'Descargar base de clientes' },
      { id: 'clientes.eliminar', label: 'Habeas Data (Eliminar)', description: 'Eliminación legal de titular' },
    ],
  },
  {
    id: 'atencion',
    name: 'Atención al Cliente (PQRS)',
    actions: [
      { id: 'atencion.ver', label: 'Ver PQRS y Contacto', description: 'Ver bandeja de peticiones y mensajes' },
      { id: 'atencion.editar', label: 'Asignar / Cambiar Estado', description: 'Asignar miembro y prioridad' },
      { id: 'atencion.responder', label: 'Emitir Respuesta Legal', description: 'Responder formalmente al peticionario' },
    ],
  },
  {
    id: 'asistente',
    name: 'Asistente IA (Movi)',
    actions: [
      { id: 'asistente.ver', label: 'Ver Métricas IA', description: 'Ver feedback y consultas' },
      { id: 'asistente.editar', label: 'Editar Base Conocimiento', description: 'Modificar respuestas de tienda y tono' },
    ],
  },
  {
    id: 'contenido',
    name: 'Gestor de Contenido (CMS)',
    actions: [
      { id: 'contenido.ver', label: 'Ver Páginas', description: 'Listar páginas institucionales y FAQs' },
      { id: 'contenido.crear', label: 'Crear Contenido', description: 'Crear nuevas páginas o FAQs' },
      { id: 'contenido.editar', label: 'Editar y Restaurar', description: 'Editar texto y restaurar versiones' },
    ],
  },
  {
    id: 'analitica',
    name: 'Analítica y Big Data',
    actions: [
      { id: 'analitica.ver', label: 'Ver Métricas', description: 'Ver embudo, RFM y predicciones' },
      { id: 'analitica.exportar', label: 'Exportar Analítica', description: 'Descargar datos de comportamiento' },
    ],
  },
  {
    id: 'finanzas',
    name: 'Finanzas e Impuestos',
    actions: [
      { id: 'finanzas.ver', label: 'Ver Ventas e IVA 19%', description: 'Ver base gravable e impuestos' },
      { id: 'finanzas.exportar', label: 'Exportar Reporte Fiscal', description: 'Descargar informe contable DIAN' },
    ],
  },
  {
    id: 'envios',
    name: 'Configuración Envíos',
    actions: [
      { id: 'envios.ver', label: 'Ver Tarifas y Cobertura', description: 'Consultar fletes y transportadoras' },
      { id: 'envios.editar', label: 'Editar Tarifas Envíos', description: 'Actualizar costos y umbral gratis' },
    ],
  },
  {
    id: 'usuarios',
    name: 'Usuarios y Equipo',
    actions: [
      { id: 'usuarios.ver', label: 'Ver Personal', description: 'Listar equipo y estado de acceso' },
      { id: 'usuarios.crear', label: 'Invitar Miembro', description: 'Crear usuario de staff con contraseña temp' },
      { id: 'usuarios.editar', label: 'Editar / Suspender', description: 'Modificar estado, rol o sesiones' },
      { id: 'usuarios.eliminar', label: 'Eliminar Usuario', description: 'Eliminar miembro de staff' },
      { id: 'usuarios.roles', label: 'Administrar Roles', description: 'Crear roles y modificar matriz de permisos' },
    ],
  },
  {
    id: 'auditoria',
    name: 'Auditoría y Seguridad',
    actions: [
      { id: 'auditoria.ver', label: 'Ver Logs de Auditoría', description: 'Registro inmutable con diff antes/después' },
      { id: 'auditoria.exportar', label: 'Exportar Auditoría', description: 'Descargar bitácora de seguridad' },
    ],
  },
  {
    id: 'configuracion',
    name: 'Configuración Global',
    actions: [
      { id: 'configuracion.ver', label: 'Ver Configuración', description: 'Ver datos de empresa y parámetros' },
      { id: 'configuracion.editar', label: 'Modificar Configuración', description: 'Actualizar datos de empresa y operación' },
      { id: 'configuracion.datos_demo', label: 'Gestionar Datos Demo', description: 'Generar o limpiar registros de prueba' },
    ],
  },
];

export const ALL_ACTION_IDS: string[] = ADMIN_MODULES.flatMap(m => m.actions.map(a => a.id));

// System Preloaded Roles
export const SYSTEM_ROLES: StaffRole[] = [
  {
    id: 'super_admin',
    nombre: 'Super Administrador',
    descripcion: 'Control total de la plataforma, roles del equipo, configuración crítica y borrado definitivo.',
    permisos: ALL_ACTION_IDS,
    es_sistema: true,
  },
  {
    id: 'administrador',
    nombre: 'Administrador General',
    descripcion: 'Gestión completa de operaciones, ventas, catálogo y soporte, sin eliminar superadmins ni purgas críticas.',
    permisos: ALL_ACTION_IDS.filter(p => p !== 'configuracion.datos_demo' && p !== 'productos.eliminar_definitivo'),
    es_sistema: true,
  },
  {
    id: 'gerente_tienda',
    nombre: 'Gerente de Tienda',
    descripcion: 'Control de catálogo, inventario, pedidos, campañas, clientes, analítica y reportes fiscales.',
    permisos: [
      'resumen.ver',
      'ventas.ver', 'ventas.exportar',
      'productos.ver', 'productos.crear', 'productos.editar', 'productos.eliminar', 'productos.exportar',
      'inventario.ver', 'inventario.editar', 'inventario.exportar',
      'categorias.ver', 'categorias.crear', 'categorias.editar', 'categorias.eliminar',
      'pedidos.ver', 'pedidos.editar', 'pedidos.exportar', 'pedidos.aprobar',
      'devoluciones.ver', 'devoluciones.editar', 'devoluciones.aprobar',
      'marketing.ver', 'marketing.crear', 'marketing.editar', 'marketing.eliminar',
      'clientes.ver', 'clientes.editar', 'clientes.exportar',
      'analitica.ver', 'analitica.exportar',
      'bigdata.ver', 'bigdata.exportar',
      'finanzas.ver', 'finanzas.exportar',
      'imagenes.ver', 'imagenes.editar',
      'informes.ver', 'informes.descargar',
      'envios.ver',
    ],
    es_sistema: true,
  },
  {
    id: 'operador_pedidos',
    nombre: 'Operador de Pedidos y Envíos',
    descripcion: 'Gestión y despacho de órdenes, números de guía, inventario en solo lectura y devoluciones.',
    permisos: [
      'resumen.ver',
      'pedidos.ver', 'pedidos.editar', 'pedidos.aprobar', 'pedidos.exportar',
      'devoluciones.ver', 'devoluciones.editar',
      'inventario.ver',
      'envios.ver',
    ],
    es_sistema: true,
  },
  {
    id: 'marketing_contenido',
    nombre: 'Marketing y Contenidos',
    descripcion: 'Campañas, promociones, cupones, banners, blog, páginas corporativas y boletín.',
    permisos: [
      'resumen.ver',
      'marketing.ver', 'marketing.crear', 'marketing.editar', 'marketing.eliminar',
      'contenido.ver', 'contenido.crear', 'contenido.editar',
      'productos.ver', 'categorias.ver',
      'analitica.ver',
    ],
    es_sistema: true,
  },
  {
    id: 'soporte_cliente',
    nombre: 'Soporte y Atención al Cliente',
    descripcion: 'Atención de PQRS, formularios de contacto, consulta de pedidos y clientes con datos enmascarados.',
    permisos: [
      'resumen.ver',
      'atencion.ver', 'atencion.editar', 'atencion.responder',
      'pedidos.ver',
      'devoluciones.ver', 'devoluciones.editar',
      'clientes.ver',
      'asistente.ver', 'asistente.editar',
    ],
    es_sistema: true,
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas e Impuestos',
    descripcion: 'Reportes de ventas brutas/netas, IVA 19%, conciliaciones y exportaciones fiscales en solo lectura.',
    permisos: [
      'resumen.ver',
      'ventas.ver', 'ventas.exportar',
      'finanzas.ver', 'finanzas.exportar',
      'pedidos.ver', 'pedidos.exportar',
      'informes.ver', 'informes.descargar',
      'analitica.ver', 'analitica.exportar',
    ],
    es_sistema: true,
  },
  {
    id: 'analista',
    nombre: 'Analista de Negocio',
    descripcion: 'Acceso de solo lectura a analítica, tendencias, comportamiento de usuarios y reportes.',
    permisos: [
      'resumen.ver',
      'ventas.ver', 'ventas.exportar',
      'analitica.ver', 'analitica.exportar',
      'bigdata.ver', 'bigdata.exportar',
      'informes.ver', 'informes.descargar',
      'productos.ver',
      'pedidos.ver',
    ],
    es_sistema: true,
  },
];

/**
 * Checks whether user has permission. Super_admin or admin always has full privileges.
 */
export function hasPermission(userPermissions: string[] | undefined, required: string, userRole?: string): boolean {
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('*') || userPermissions.includes(required)) return true;
  const [module] = required.split('.');
  if (userPermissions.includes(`${module}.*`)) return true;
  return false;
}

export function hasModuleAccess(userPermissions: string[] | undefined, moduleName: string, userRole?: string): boolean {
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  if (!userPermissions) return false;
  return userPermissions.some(p => p.startsWith(`${moduleName}.`) || p === '*');
}

/**
 * Mask sensitive personal data according to Ley 1581 (Habeas Data)
 */
export function maskSensitiveText(
  value: string | undefined | null,
  type: 'email' | 'phone' | 'document' | 'address' = 'email'
): string {
  if (!value) return '—';
  const str = String(value).trim();
  if (!str) return '—';

  switch (type) {
    case 'email': {
      const parts = str.split('@');
      if (parts.length !== 2) return '***@***';
      const [local, domain] = parts;
      const visible = local.slice(0, 2);
      return `${visible}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
    }
    case 'phone': {
      if (str.length <= 4) return '****';
      return `${str.slice(0, 3)}****${str.slice(-2)}`;
    }
    case 'document': {
      if (str.length <= 4) return '****';
      return `${str.slice(0, 2)}****${str.slice(-2)}`;
    }
    case 'address': {
      const words = str.split(' ');
      if (words.length <= 2) return `${words[0] || 'Calle'} ***`;
      return `${words[0]} ${words[1]} *********`;
    }
    default:
      return '********';
  }
}
