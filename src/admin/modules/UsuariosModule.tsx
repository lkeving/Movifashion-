// Module: Gestión del Equipo, Usuarios de Staff y Matriz RBAC
// Staff invitations with temp password, 2FA status, custom roles creator with permission grid

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Plus,
  Trash2,
  Edit,
  Key,
  Lock,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Copy,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { StaffRole } from '../../types/index.ts';
import { ADMIN_MODULES } from '../rbac.ts';
import { authFetch } from '../../utils/api.ts';

export const UsuariosModule: React.FC<{ currentUserId?: string }> = ({ currentUserId }) => {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create Staff Modal
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRoleId, setNewStaffRoleId] = useState('operador_pedidos');
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

  // Role Matrix Editor Modal
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        authFetch('/api/admin/users'),
        authFetch('/api/admin/roles'),
      ]);
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resRoles.ok) {
        const json = await resRoles.json();
        setRoles(json.roles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          roleId: newStaffRoleId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedTempPassword(data.temporaryPassword);
        await fetchUsersAndRoles();
      } else {
        alert(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateRole = () => {
    setEditingRole({
      id: '',
      nombre: '',
      descripcion: '',
      permisos: [],
      es_sistema: false,
    });
    setRoleName('');
    setRoleDesc('');
    setRolePermissions(new Set(['resumen.ver']));
  };

  const openEditRole = (role: StaffRole) => {
    setEditingRole(role);
    setRoleName(role.nombre);
    setRoleDesc(role.descripcion);
    setRolePermissions(new Set(role.permisos));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    setIsSubmitting(true);

    try {
      const isNew = !editingRole?.id;
      const roleId = isNew
        ? roleName.toLowerCase().replace(/[^a-z0-9_]+/g, '_')
        : editingRole!.id;

      const payload = {
        id: roleId,
        nombre: roleName,
        descripcion: roleDesc,
        permisos: Array.from(rolePermissions),
      };

      if (isNew) {
        await authFetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch(`/api/admin/roles/${roleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setEditingRole(null);
      await fetchUsersAndRoles();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (actionId: string) => {
    const next = new Set(rolePermissions);
    if (next.has(actionId)) next.delete(actionId);
    else next.add(actionId);
    setRolePermissions(next);
  };

  const userColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Miembro del Equipo',
      accessor: r => r.name,
      render: r => (
        <div>
          <span className="font-bold text-slate-900 block">{r.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">{r.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'role',
      header: 'Rol Asignado',
      accessor: r => r.role,
      render: r => {
        const found = roles.find(rl => rl.id === r.role);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#7656D6]">
            {found?.nombre || r.role}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'mfa',
      header: 'Autenticación 2FA',
      accessor: r => r.mfaEnabled,
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            r.mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {r.mfaEnabled ? 'Activo (Google Auth)' : 'No activado'}
        </span>
      ),
      align: 'center',
    },
    {
      key: 'lastLoginAt',
      header: 'Último Acceso',
      accessor: r => r.lastLoginAt || '—',
      render: r => (
        <span className="text-slate-500 text-[11px]">
          {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString('es-CO') : 'Nunca'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: r => r.estado,
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            r.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {r.estado || 'activo'}
        </span>
      ),
      align: 'center',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'users' ? 'bg-[#7656D6] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Usuarios de Staff ({users.length})
          </button>
          <button
            onClick={() => setTab('roles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'roles' ? 'bg-[#7656D6] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Roles y Matriz de Permisos ({roles.length})
          </button>
        </div>

        {tab === 'users' ? (
          <button
            onClick={() => {
              setCreatedTempPassword(null);
              setNewStaffName('');
              setNewStaffEmail('');
              setShowCreateStaff(true);
            }}
            className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Invitar Miembro al Equipo</span>
          </button>
        ) : (
          <button
            onClick={openCreateRole}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Rol Personalizado</span>
          </button>
        )}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <DataTable
          columns={userColumns}
          data={users}
          keyField="id"
          isLoading={isLoading}
          searchPlaceholder="Buscar por nombre, correo o rol..."
          exportFileName="equipo-staff.csv"
        />
      )}

      {/* Roles Tab */}
      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div
              key={role.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{role.nombre}</span>
                  {role.es_sistema && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Sistema
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                  {role.descripcion}
                </p>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <strong>Permisos concedidos:</strong> {role.permisos.includes('*') ? 'Todos los módulos (*)' : `${role.permisos.length} acciones`}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => openEditRole(role)}
                  className="px-3 py-1.5 text-xs font-bold text-[#7656D6] hover:bg-purple-50 rounded-xl transition"
                >
                  Ver Matriz de Permisos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Staff Modal */}
      {showCreateStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <button
              onClick={() => setShowCreateStaff(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Invitar Miembro del Equipo
            </h3>
            <p className="text-slate-500 mb-4">
              Se creará una contraseña temporal de 12+ caracteres que deberá cambiar en su primer inicio.
            </p>

            {createdTempPassword ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold block mb-1">¡Usuario creado exitosamente!</span>
                  <p className="text-[11px] text-emerald-700 mb-3">
                    Comparte de manera segura esta contraseña temporal de primer acceso:
                  </p>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-300 font-mono text-sm font-black text-slate-900">
                    <span>{createdTempPassword}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdTempPassword);
                        alert('Contraseña copiada al portapapeles');
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateStaff(false)}
                  className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-center"
                >
                  Entendido y Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="Ej: Daniel Salamanca"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    placeholder="daniel@movifashion.ai"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol de Personal *</label>
                  <select
                    value={newStaffRoleId}
                    onChange={e => setNewStaffRoleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateStaff(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Crear Usuario</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto relative text-xs">
            <button
              onClick={() => setEditingRole(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Matriz de Permisos RBAC: {roleName || 'Nuevo Rol'}
            </h3>
            <p className="text-slate-500 mb-4">
              Marca las casillas de acciones permitidas para este rol. Se aplican de inmediato en el servidor.
            </p>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Rol *</label>
                  <input
                    type="text"
                    required
                    disabled={editingRole.es_sistema}
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={roleDesc}
                    onChange={e => setRoleDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Permission Matrix Grid */}
              <div className="space-y-3">
                {ADMIN_MODULES.map(mod => (
                  <div key={mod.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-2">{mod.name}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {mod.actions.map(act => {
                        const checked = rolePermissions.has(act.id) || rolePermissions.has('*');
                        return (
                          <label
                            key={act.id}
                            className="flex items-start gap-2 text-slate-700 hover:text-slate-900 cursor-pointer p-1.5 rounded-lg hover:bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={editingRole.id === 'super_admin'}
                              onChange={() => togglePermission(act.id)}
                              className="mt-0.5 rounded text-[#7656D6] focus:ring-[#7656D6]"
                            />
                            <div>
                              <span className="font-semibold block">{act.label}</span>
                              <span className="text-[10px] text-slate-400 leading-tight block">{act.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cerrar
                </button>
                {editingRole.id !== 'super_admin' && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Guardar Matriz</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
