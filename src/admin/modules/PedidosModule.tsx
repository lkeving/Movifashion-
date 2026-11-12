// Module 2: Gestión Integral de Pedidos (Orders Back-Office)
// Order lifecycle, status history timeline, courier & tracking, internal notes, receipt & packing slips printing

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  FileText,
  Printer,
  ChevronRight,
  Send,
  Loader2,
  AlertTriangle,
  X,
  Package,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { Order } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';
import { EMPRESA } from '../../config/empresa.ts';

interface PedidosModuleProps {
  orders?: Order[];
  origin?: 'all' | 'real' | 'simulado';
  onOrderUpdated?: () => void;
}

export const PedidosModule: React.FC<PedidosModuleProps> = ({ orders: initialOrders = [], origin = 'all', onOrderUpdated }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newTracking, setNewTracking] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [printMode, setPrintMode] = useState<'receipt' | 'label' | 'picking' | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const query = origin && origin !== 'all' ? `?origin=${origin}` : '';
      const res = await authFetch(`/api/admin/orders${query}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [origin]);

  const openOrderDetail = async (order: Order) => {
    setActionError('');
    setActionSuccess('');
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/admin/orders/${order.id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedOrder(json);
        setNewStatus(json.status);
        setNewTracking(json.trackingNumber || '');
      } else {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setNewTracking(order.trackingNumber || '');
      }
    } catch {
      setSelectedOrder(order);
      setNewStatus(order.status);
      setNewTracking(order.trackingNumber || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus?: string) => {
    if (!selectedOrder) return;
    const statusToApply = targetStatus || newStatus;
    setIsUpdating(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await authFetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToApply, nota: statusNote }),
      });
      if (res.ok) {
        setStatusNote('');
        setActionSuccess(`Estado actualizado a ${statusToApply}.`);
        await fetchOrders();
        await openOrderDetail(selectedOrder);
        onOrderUpdated?.();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo actualizar el estado del pedido.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al actualizar el pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedOrder || !newTracking) return;
    setIsUpdating(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await authFetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: newTracking }),
      });
      if (res.ok) {
        setActionSuccess('Guía de transporte asignada.');
        await fetchOrders();
        await openOrderDetail(selectedOrder);
        onOrderUpdated?.();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo asignar la guía de envío.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al asignar la guía.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !internalNote.trim()) return;
    setIsUpdating(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await authFetch(`/api/admin/orders/${selectedOrder.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: internalNote }),
      });
      if (res.ok) {
        setInternalNote('');
        setActionSuccess('Nota interna guardada.');
        await openOrderDetail(selectedOrder);
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo guardar la nota interna.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al guardar la nota.');
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Pedido',
      accessor: r => r.id,
      render: r => (
        <span className="font-extrabold text-slate-900 font-mono text-xs">
          {r.id}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Cliente',
      accessor: r => r.userName,
      render: r => (
        <div>
          <div className="font-bold text-slate-800">{r.userName}</div>
          <div className="text-[11px] text-slate-400">{r.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      accessor: r => r.status,
      render: r => {
        let badgeColor = 'bg-slate-100 text-slate-700';
        if (r.status === 'Pendiente') badgeColor = 'bg-amber-100 text-amber-800';
        else if (r.status === 'Pagado') badgeColor = 'bg-cyan-100 text-cyan-800';
        else if (r.status === 'En preparación') badgeColor = 'bg-blue-100 text-blue-800';
        else if (r.status === 'Enviado') badgeColor = 'bg-purple-100 text-purple-800';
        else if (r.status === 'Entregado') badgeColor = 'bg-emerald-100 text-emerald-800';
        else if (r.status === 'Cancelado') badgeColor = 'bg-rose-100 text-rose-800';

        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {r.status}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'total',
      header: 'Total Facturado',
      accessor: r => r.total,
      render: r => (
        <span className="font-mono font-bold text-slate-900">
          ${r.total.toLocaleString('es-CO')} COP
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'paymentMethod',
      header: 'Método de Pago',
      accessor: r => r.paymentMethod,
      render: r => {
        const labels: Record<string, string> = {
          cash_on_delivery: 'Contraentrega',
          bank_transfer: 'Transferencia Bancaria (Simulada)',
          credit_card: 'Tarjeta Crédito',
          pse: 'PSE Colombia',
        };
        return <span className="text-slate-600">{labels[r.paymentMethod] || r.paymentMethod}</span>;
      },
    },
    {
      key: 'trackingNumber',
      header: 'Guía Transportadora',
      accessor: r => r.trackingNumber || '—',
      render: r => (
        <span className="font-mono text-xs text-slate-500">
          {r.trackingNumber || <span className="text-slate-300">Sin guía</span>}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      accessor: r => r.createdAt,
      render: r => (
        <span className="text-slate-500 text-[11px]">
          {new Date(r.createdAt).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
      sortable: true,
    },
  ];

  const [activeSubTab, setActiveSubTab] = useState<'pedidos' | 'retractos'>('pedidos');

  const filteredOrders = orders.filter(o => {
    if (activeSubTab === 'retractos') {
      return o.status === 'Cancelado' || (o as any).devolucion_solicitada;
    }

    if (statusFilter !== 'todos') {
      return o.status.toLowerCase() === statusFilter.toLowerCase();
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub tabs: Pedidos vs Devoluciones y Retractos */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('pedidos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'pedidos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Gestión de Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('retractos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'retractos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Devoluciones y Retractos (Art. 47) ({orders.filter(o => o.status === 'Cancelado' || (o as any).devolucion_solicitada).length})
          </button>
        </div>
      </div>

      {activeSubTab === 'retractos' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-amber-950 mb-0.5">Módulo de Retractos y Devoluciones — Ley 1480 de 2011 (Estatuto del Consumidor)</h4>
            <p className="text-[11px] leading-relaxed text-amber-800">
              En Colombia, los clientes cuentan con 5 días hábiles a partir de la entrega para ejercer su derecho de retracto en ventas online. MoviFashion garantiza la devolución del 100% del dinero dentro de los 30 días calendario siguientes a la solicitud.
            </p>
          </div>
        </div>
      )}

      {/* Status filter chips (only on pedidos subtab) */}
      {activeSubTab === 'pedidos' && (
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'Pendiente', 'Pagado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-[#7656D6] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'todos' ? 'Todos los estados' : st}
            </button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredOrders}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Buscar por ID (ORD-...), nombre o guía..."
        onRowClick={openOrderDetail}
        exportFileName="pedidos-movifashion.csv"
        bulkActions={[
          {
            label: 'Exportar Seleccionados',
            action: rows => {
              const headers = ['ID', 'Cliente', 'Correo', 'Estado', 'Total COP', 'Método Pago', 'Guía', 'Fecha'];
              const csvRows = rows.map(r => [
                `"${r.id}"`,
                `"${(r.userName || '').replace(/"/g, '""')}"`,
                `"${(r.userEmail || '').replace(/"/g, '""')}"`,
                `"${r.status}"`,
                String(r.total || 0),
                `"${r.paymentMethod}"`,
                `"${r.trackingNumber || ''}"`,
                `"${r.createdAt}"`,
              ].join(','));
              const csvContent = [headers.join(','), ...csvRows].join('\n');
              const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `pedidos-seleccionados-${new Date().toISOString().slice(0, 10)}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            },
          },
        ]}
      />

      {/* Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 font-mono">
                    {selectedOrder.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#7656D6]">
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realizado el {new Date(selectedOrder.createdAt).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintMode('receipt')}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition"
                  title="Imprimir Comprobante"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {actionSuccess}
                </div>
              )}

              {/* Quick Action: Mark as Delivered */}
              {selectedOrder.status === 'Enviado' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">¿El pedido ya fue entregado al cliente?</h4>
                    <p className="text-[11px] text-emerald-700">Actualiza el estado final y notifica al comprador.</p>
                  </div>
                  <button
                    onClick={() => handleStatusChange('Entregado')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                  >
                    Marcar como Entregado
                  </button>
                </div>
              )}

              {/* Status Update & Tracking */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Actualizar Estado y Logística
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cambiar Estado:</label>
                    <div className="flex gap-2">
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="En preparación">En preparación</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado (Reponer stock)</option>
                      </select>
                      <button
                        onClick={() => handleStatusChange()}
                        disabled={isUpdating}
                        className="px-3 py-2 bg-[#7656D6] text-white font-bold text-xs rounded-xl hover:bg-[#6042BE] transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Guía Coordinadora / Servientrega:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTracking}
                        onChange={e => setNewTracking(e.target.value)}
                        placeholder="Ej: GUIA-984210"
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-mono"
                      />
                      <button
                        onClick={handleTrackingUpdate}
                        disabled={isUpdating}
                        className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition"
                      >
                        Asignar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Prendas Solicitadas ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const price = item.product?.discountPrice || item.product?.price || 0;
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                            />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block">{item.product?.name || 'Prenda'}</span>
                            <span className="text-[11px] text-slate-400">
                              Talla: {item.selectedSize} · Color: {item.selectedColor?.name || item.selectedColor || 'Estándar'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">
                            ${(price * (item.quantity || 1)).toLocaleString('es-CO')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.quantity} x ${price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block mb-1">Destinatario</span>
                  <p className="text-slate-800 font-semibold">{selectedOrder.userName}</p>
                  <p className="text-slate-500">{selectedOrder.userEmail}</p>
                  <p className="text-slate-500">{selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block mb-1">Destino de Envío</span>
                  <p className="text-slate-700">
                    {selectedOrder.customer?.address || selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street}
                  </p>
                  <p className="text-slate-500">{selectedOrder.customer?.city || selectedOrder.shippingAddress?.city}, Colombia</p>
                </div>
              </div>

              {/* Status Timeline History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Línea de Tiempo del Pedido
                </h4>
                <div className="space-y-2 border-l-2 border-purple-200 pl-4 ml-2">
                  {selectedOrder.history && selectedOrder.history.length > 0 ? (
                    selectedOrder.history.map((h: any, idx: number) => (
                      <div key={idx} className="text-xs relative">
                        <div className="w-2 h-2 rounded-full bg-[#7656D6] absolute -left-[21px] top-1.5" />
                        <span className="font-bold text-slate-800">{h.estadoNuevo}</span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          por {h.usuarioNombre} · {new Date(h.createdAt).toLocaleString('es-CO')}
                        </span>
                        {h.nota && <p className="text-slate-600 text-[11px] mt-0.5">{h.nota}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Sin cambios de estado registrados.</p>
                  )}
                </div>
              </div>

              {/* Internal Staff Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Notas Internas del Equipo
                </h4>
                <div className="space-y-2 mb-3">
                  {selectedOrder.notes?.map((n: any, idx: number) => (
                    <div key={idx} className="p-3 bg-purple-50/50 rounded-xl text-xs border border-purple-100">
                      <p className="text-slate-800 font-medium">{n.nota}</p>
                      <span className="text-[10px] text-purple-700 font-bold mt-1 block">
                        {n.usuarioNombre} · {new Date(n.createdAt).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={internalNote}
                    onChange={e => setInternalNote(e.target.value)}
                    placeholder="Agregar nota interna para el equipo..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={isUpdating || !internalNote.trim()}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Print Modal Overlay */}
            {printMode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-xs">
                  <button
                    onClick={() => setPrintMode(null)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="border-b border-slate-200 pb-3 mb-4">
                    <span className="font-extrabold text-sm uppercase text-slate-900 block">
                      {EMPRESA.razonSocial} · NIT {EMPRESA.nit}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Comprobante de despacho oficial para pedido {selectedOrder.id}
                    </span>
                  </div>

                  <div className="space-y-2 py-2">
                    <p><strong>Destinatario:</strong> {selectedOrder.userName}</p>
                    <p><strong>Dirección:</strong> {selectedOrder.customer?.address || selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street}</p>
                    <p><strong>Ciudad / Depto:</strong> {selectedOrder.customer?.city || selectedOrder.shippingAddress?.city}, Colombia</p>
                    <p><strong>Guía:</strong> {selectedOrder.trackingNumber || 'Coordinadora / Servientrega'}</p>
                    <p><strong>Total Facturado:</strong> ${selectedOrder.total.toLocaleString('es-CO')} COP</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-[#7656D6] text-white rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
