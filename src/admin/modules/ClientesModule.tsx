// Module 5: Gestión de Clientes, Segmentación RFM y Cumplimiento Ley 1581 (Habeas Data)
// Profile inspection, sensitive data reveal, account suspension, export & deletion

import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Download,
  Trash2,
  Lock,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { authFetch } from '../../utils/api.ts';
import { SensitiveDataModal } from '../components/SensitiveDataModal.tsx';
import { ReauthModal } from '../components/ReauthModal.tsx';

export const ClientesModule: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [revealTarget, setRevealTarget] = useState<any | null>(null);
  const [reauthAction, setReauthAction] = useState<(() => void) | null>(null);
  const [segmentFilter, setSegmentFilter] = useState('todos');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/customers');
      if (res.ok) {
        const json = await res.json();
        setCustomers(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: any) => {
    const nextState = customer.estado === 'suspendido' ? 'activo' : 'suspendido';
    try {
      const res = await authFetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nextState }),
      });
      if (res.ok) {
        await fetchCustomers();
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer({ ...selectedCustomer, estado: nextState });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHabeasDataExport = (customer: any) => {
    setReauthAction(() => async () => {
      try {
        const res = await authFetch(`/api/admin/customers/${customer.id}/habeas-data-export`, {
          method: 'POST',
        });
        if (res.ok) {
          const blobData = await res.blob();
          const url = URL.createObjectURL(blobData);
          const link = document.createElement('a');
          link.href = url;
          link.download = `habeas-data-${customer.id}.json`;
          link.click();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setReauthAction(null);
      }
    });
  };

  const handleHabeasDataDelete = (customer: any) => {
    setReauthAction(() => async () => {
      try {
        const res = await authFetch(`/api/admin/customers/${customer.id}/habeas-data-delete`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSelectedCustomer(null);
          await fetchCustomers();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setReauthAction(null);
      }
    });
  };

  const filteredCustomers = segmentFilter === 'todos'
    ? customers
    : customers.filter(c => c.segment?.toLowerCase() === segmentFilter.toLowerCase());

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Cliente',
      accessor: r => r.name,
      render: r => (
        <div>
          <span className="font-bold text-slate-800 block">{r.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">{r.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'segment',
      header: 'Segmento RFM',
      accessor: r => r.segment || 'Nuevo',
      render: r => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.segment === 'VIP') badge = 'bg-purple-100 text-[#7656D6]';
        else if (r.segment === 'Recurrente') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.segment === 'Inactivo') badge = 'bg-rose-100 text-rose-800';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
            {r.segment || 'Nuevo'}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'ordersCount',
      header: 'Pedidos',
      accessor: r => r.ordersCount,
      render: r => <span className="font-bold text-slate-800">{r.ordersCount}</span>,
      align: 'center',
      sortable: true,
    },
    {
      key: 'totalSpent',
      header: 'Total Facturado',
      accessor: r => r.totalSpent,
      render: r => (
        <span className="font-mono font-bold text-slate-900">
          ${(r.totalSpent || 0).toLocaleString('es-CO')} COP
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: r => r.estado || 'activo',
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            r.estado === 'suspendido' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {r.estado || 'activo'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: r => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setRevealTarget(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#7656D6] hover:bg-purple-50 transition"
            title="Consultar datos personales (Ley 1581)"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
            title={r.estado === 'suspendido' ? 'Reactivar cuenta' : 'Suspender cuenta'}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Segment filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['todos', 'VIP', 'Recurrente', 'Nuevo', 'Inactivo'].map(seg => (
          <button
            key={seg}
            onClick={() => setSegmentFilter(seg)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              segmentFilter === seg
                ? 'bg-[#7656D6] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {seg === 'todos' ? 'Todos los clientes' : `Segmento ${seg}`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre, correo..."
        onRowClick={c => setSelectedCustomer(c)}
        exportFileName="clientes-movifashion.csv"
      />

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCustomer.name}</h3>
                <span className="text-xs text-slate-500 font-mono">{selectedCustomer.email}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Quick KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Gastado
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                    ${(selectedCustomer.totalSpent || 0).toLocaleString('es-CO')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pedidos Realizados
                  </span>
                  <span className="text-base font-extrabold text-[#7656D6] mt-0.5 block">
                    {selectedCustomer.ordersCount || 0} compras
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Estado de la cuenta:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedCustomer.estado === 'suspendido'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedCustomer.estado || 'activo'}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleToggleStatus(selectedCustomer)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition text-center"
                  >
                    {selectedCustomer.estado === 'suspendido' ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                  </button>
                  <button
                    onClick={() => setRevealTarget(selectedCustomer)}
                    className="px-3 py-2 bg-[#7656D6] text-white font-bold rounded-xl hover:bg-[#6042BE] transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Datos</span>
                  </button>
                </div>
              </div>

              {/* Habeas Data Legal Rights Section */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-2 text-[#7656D6]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs">Cumplimiento Habeas Data (Ley 1581)</span>
                </div>
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  El titular tiene derecho a solicitar la portabilidad o supresión definitiva de su información personal.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleHabeasDataExport(selectedCustomer)}
                    className="flex-1 px-3 py-2 bg-white text-[#7656D6] border border-purple-200 hover:bg-purple-100/50 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Datos</span>
                  </button>
                  <button
                    onClick={() => handleHabeasDataDelete(selectedCustomer)}
                    className="px-3 py-2 bg-rose-600 text-white hover:bg-rose-700 font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Titular</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensitive Data Modal */}
      {revealTarget && (
        <SensitiveDataModal
          isOpen={true}
          onClose={() => setRevealTarget(null)}
          customerId={revealTarget.id}
          customerName={revealTarget.name}
          onRevealed={data => {
            const updated = customers.map(c =>
              c.id === revealTarget.id ? { ...c, email: data.email } : c
            );
            setCustomers(updated);
            if (selectedCustomer?.id === revealTarget.id) {
              setSelectedCustomer({ ...selectedCustomer, email: data.email, addresses: data.addresses });
            }
          }}
        />
      )}

      {/* Reauth Modal for Habeas Data */}
      {reauthAction && (
        <ReauthModal
          isOpen={true}
          onClose={() => setReauthAction(null)}
          onConfirm={reauthAction}
          title="Autorización para Trámite de Habeas Data"
          description="Esta operación procesa o suprime datos amparados por la Ley 1581 de 2012. Se requiere tu contraseña para confirmar."
        />
      )}
    </div>
  );
};
