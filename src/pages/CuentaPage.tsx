import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, CartItem } from '../types';
import { Seo } from '../components/Seo.tsx';
import { OrderReceiptModal } from '../components/OrderReceiptModal.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';
import { authFetch } from '../utils/api.ts';
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  LogIn,
  RotateCcw,
  Truck,
  CreditCard,
  Building2,
  Calendar,
  X,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CuentaPageProps {
  user: User | null;
  orders?: Order[];
  loadingOrders?: boolean;
  onRefreshOrders?: () => Promise<void> | void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

// Stepper steps for Colombian e-commerce fulfillment
const ORDER_STEPS = [
  { key: 'pagado', label: 'Pagado' },
  { key: 'preparacion', label: 'En preparación' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
];

function getStepIndex(status: string): number {
  const norm = (status || '').toLowerCase().trim();
  if (norm.includes('entreg')) return 3;
  if (norm.includes('enviad') || norm.includes('camino') || norm.includes('despach')) return 2;
  if (norm.includes('prepar') || norm.includes('alist') || norm.includes('bodega')) return 1;
  if (norm.includes('paga') || norm.includes('confirm') || norm.includes('aprobad') || norm.includes('pend')) return 0;
  return 0;
}

// Helper to count business days (excluding Saturday and Sunday)
function getBusinessDaysDifference(startDate: Date, endDate: Date): number {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate < endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

function checkRetractEligibility(order: Order): {
  eligible: boolean;
  daysRemaining: number;
  message: string;
} {
  const isDelivered = (order.status || '').toLowerCase().includes('entreg');
  if (!isDelivered) {
    return {
      eligible: false,
      daysRemaining: 0,
      message: 'Disponible únicamente cuando el pedido haya sido entregado (Art. 47 Ley 1480 de 2011).',
    };
  }

  const deliveryDate = new Date(order.createdAt);
  const now = new Date();
  const businessDays = getBusinessDaysDifference(deliveryDate, now);
  const daysRemaining = Math.max(0, 5 - businessDays);

  if (businessDays > 5) {
    return {
      eligible: false,
      daysRemaining: 0,
      message: 'El plazo legal de 5 días hábiles posteriores a la entrega (Ley 1480 de 2011) ha vencido.',
    };
  }

  return {
    eligible: true,
    daysRemaining,
    message: `Tienes ${daysRemaining} día(s) hábil(es) para ejercer tu derecho legal de retracto o devolución.`,
  };
}

export const CuentaPage: React.FC<CuentaPageProps> = ({ 
  user, 
  orders: propOrders, 
  loadingOrders: propLoading,
  onRefreshOrders,
  onOpenAuth, 
  onLogout 
}) => {
  const [internalOrders, setInternalOrders] = useState<Order[]>(propOrders || []);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  
  // Return / Retracto Modal State
  const [returnOrderTarget, setReturnOrderTarget] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('retracto');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnBank, setReturnBank] = useState('');
  const [returnAccount, setReturnAccount] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);
  const [returnErrorMsg, setReturnErrorMsg] = useState<string | null>(null);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Habeas Data Request State
  const [habeasDataRequested, setHabeasDataRequested] = useState<'download' | 'delete' | null>(null);

  // Address State
  const [savedAddress, setSavedAddress] = useState(() => {
    return localStorage.getItem('movifashion_user_address') || 'Calle 100 # 15-20, Oficina 402, Bogotá D.C.';
  });
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(savedAddress);

  // Sync internal orders if parent prop changes
  useEffect(() => {
    if (propOrders) {
      setInternalOrders(propOrders);
    }
  }, [propOrders]);

  // Defensive direct fetch using authFetch (handles both { orders: [...] } and [...])
  useEffect(() => {
    if (user && (!propOrders || propOrders.length === 0)) {
      setInternalLoading(true);
      authFetch('/api/orders/mine')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.orders)) {
            setInternalOrders(data.orders);
          } else if (Array.isArray(data)) {
            setInternalOrders(data);
          }
        })
        .catch(err => {
          console.warn('Error fetching client orders:', err);
        })
        .finally(() => setInternalLoading(false));
    }
  }, [user, propOrders]);

  const orders = propOrders && propOrders.length > 0 ? propOrders : internalOrders;
  const isLoading = propLoading || internalLoading;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'todos') return orders;
    return orders.filter(ord => {
      const st = (ord.status || '').toLowerCase();
      if (statusFilter === 'pagado') return st.includes('paga') || st.includes('confirm') || st.includes('pend');
      if (statusFilter === 'preparacion') return st.includes('prepar') || st.includes('alist');
      if (statusFilter === 'enviado') return st.includes('enviad') || st.includes('camino');
      if (statusFilter === 'entregado') return st.includes('entreg');
      if (statusFilter === 'cancelado') return st.includes('cancel');
      return true;
    });
  }, [orders, statusFilter]);

  // Aggregate Metrics
  const totalOrdersCount = orders.length;
  const totalGarmentsCount = useMemo(() => {
    return orders.reduce((sum, ord) => {
      if (!Array.isArray(ord.items)) return sum;
      const countInOrder = ord.items.reduce((iSum: number, it: any) => iSum + (Number(it.quantity) || 1), 0);
      return sum + countInOrder;
    }, 0);
  }, [orders]);

  const totalSpentCOP = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
  }, [orders]);

  const handleSaveAddress = () => {
    setSavedAddress(addressInput);
    localStorage.setItem('movifashion_user_address', addressInput);
    setEditingAddress(false);
  };

  const handleHabeasDataAction = (type: 'download' | 'delete') => {
    setHabeasDataRequested(type);
    setTimeout(() => {
      if (type === 'download' && user) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
          usuario: user,
          pedidos: orders,
          politica_habeas_data: "Ley 1581 de 2012 - República de Colombia",
          fecha_descarga: new Date().toISOString(),
        }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mis_datos_movifashion_${user.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    }, 1200);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderTarget) return;

    setSubmittingReturn(true);
    setReturnErrorMsg(null);
    try {
      const res = await authFetch('/api/returns/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: returnOrderTarget.id,
          tipo: returnReason,
          motivo: `${returnReason === 'retracto' ? '[Derecho de Retracto Art. 47 Ley 1480]' : '[Devolución]'} ${returnDescription} - Datos de reembolso: Banco ${returnBank}, Cta ${returnAccount}`,
          items: returnOrderTarget.items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error radicando solicitud de retracto/devolución');
      }

      setReturnSuccessMsg(`Solicitud radicada con éxito. Radicado interno: ${data.returnRequest?.id || 'RET-' + returnOrderTarget.id}. Plazo de respuesta legal: 15 días hábiles.`);
      setTimeout(() => {
        setReturnOrderTarget(null);
        setReturnSuccessMsg(null);
        setReturnDescription('');
        setReturnBank('');
        setReturnAccount('');
        if (onRefreshOrders) onRefreshOrders();
      }, 3000);
    } catch (err: any) {
      setReturnErrorMsg(err.message || 'Error al radicar la solicitud.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F5F8] px-4 py-16">
        <Seo
          title="Mi Cuenta — Iniciar Sesión"
          description={`Accede a tu cuenta de ${EMPRESA.nombreComercial} para consultar tus pedidos y gestionar tus preferencias.`}
        />
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#7656D6] flex items-center justify-center mx-auto">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#30234F] mb-1">Tu Cuenta Personal</h1>
            <p className="text-xs text-slate-500">
              Inicia sesión para revisar el historial y estado de tus compras, descargar comprobantes fiscales y gestionar tus direcciones.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 px-6 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión o Registrarme</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Mis Pedidos y Envíos — MoviFashion Colombia"
        description={`Panel de cliente de ${EMPRESA.nombreComercial}. Consulta tus compras, estado en tiempo real, comprobantes fiscales con IVA 19% y derecho de retracto.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Mi Cuenta', path: '/cuenta' },
        ]}
      />

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* User Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#30234F] text-white flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#30234F]">{user.name}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-2.5 py-0.5 rounded-md">
                  Cliente Verificado MoviFashion
                </span>
                <span className="text-[10px] text-slate-400">· {EMPRESA.ciudad}, {EMPRESA.pais}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onRefreshOrders && (
              <button
                onClick={() => onRefreshOrders()}
                className="text-xs text-slate-600 hover:text-[#7656D6] font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Recargar pedidos desde el servidor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* 1. TOP SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7656D6] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Pedidos</span>
              <span className="text-2xl font-black text-[#30234F] tabular-nums">{totalOrdersCount}</span>
              <span className="text-[11px] text-slate-500 block">Órdenes registradas</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Prendas Compradas</span>
              <span className="text-2xl font-black text-[#30234F] tabular-nums">{totalGarmentsCount}</span>
              <span className="text-[11px] text-slate-500 block">Artículos de moda</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Invertido</span>
              <span className="text-xl font-black text-[#7656D6] tabular-nums">{formatCOP(totalSpentCOP)}</span>
              <span className="text-[11px] text-slate-500 block">IVA 19% incluido</span>
            </div>
          </div>
        </div>

        {/* 2. ORDERS SECTION WITH STATUS FILTER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#7656D6]" />
                Mis Pedidos y Envíos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rastreo paso a paso, fotos del color seleccionado, desglose de IVA 19% y comprobante oficial.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/70 text-xs font-semibold">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pagado', label: 'Pagado' },
                { id: 'preparacion', label: 'En preparación' },
                { id: 'enviado', label: 'Enviado' },
                { id: 'entregado', label: 'Entregado' },
                { id: 'cancelado', label: 'Cancelado' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setStatusFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[11px] font-bold ${
                    statusFilter === chip.id
                      ? 'bg-white text-[#7656D6] shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Cargando tus pedidos desde el servidor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {statusFilter === 'todos' ? 'Aún no tienes pedidos registrados' : `No hay pedidos con estado "${statusFilter}"`}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explora el catálogo de MoviFashion para descubrir prendas contemporáneas con envío gratis desde {formatCOP(EMPRESA.umbralEnvioGratis)}.
              </p>
              <Link
                to="/catalogo"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((ord) => {
                const stepIdx = getStepIndex(ord.status);
                const isCanceled = (ord.status || '').toLowerCase().includes('cancel');
                const retractInfo = checkRetractEligibility(ord);
                const orderDateStr = new Date(ord.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={ord.id}
                    className="rounded-3xl bg-[#FCFCFD] border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-purple-200"
                  >
                    {/* Order Top Bar */}
                    <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#30234F]">{ord.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {orderDateStr}
                          </span>
                        </div>

                        {ord.trackingNumber && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                            <Truck className="w-3 h-3 text-[#7656D6]" />
                            Guía: {ord.trackingNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isCanceled 
                            ? 'bg-rose-100 text-rose-800'
                            : (ord.status || '').toLowerCase().includes('entreg')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-[#7656D6]'
                        }`}>
                          {ord.status}
                        </span>

                        <span className="text-base font-black text-[#30234F] tabular-nums">
                          {formatCOP(ord.total)}
                        </span>
                      </div>
                    </div>

                    {/* FULFILLMENT PROGRESS STEPPER */}
                    {!isCanceled && (
                      <div className="px-6 py-5 bg-[#F9F9FC] border-b border-slate-100">
                        <div className="max-w-2xl mx-auto">
                          <div className="relative flex items-center justify-between">
                            {/* Connecting Progress Track */}
                            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
                            <div 
                              className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-[#7656D6] transition-all duration-500 -z-0"
                              style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
                            />

                            {ORDER_STEPS.map((step, idx) => {
                              const isCompleted = idx < stepIdx;
                              const isCurrent = idx === stepIdx;
                              return (
                                <div key={step.key} className="flex flex-col items-center relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                    isCompleted 
                                      ? 'bg-[#7656D6] text-white ring-4 ring-purple-100' 
                                      : isCurrent 
                                      ? 'bg-white border-2 border-[#7656D6] text-[#7656D6] ring-4 ring-purple-50' 
                                      : 'bg-white border-2 border-slate-200 text-slate-400'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 whitespace-nowrap ${
                                    isCurrent ? 'text-[#7656D6]' : isCompleted ? 'text-[#30234F]' : 'text-slate-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {isCanceled && (
                      <div className="p-4 bg-rose-50 border-b border-rose-100 text-xs text-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Este pedido fue cancelado. Comunícate con atención al cliente si tienes dudas sobre reembolsos.</span>
                      </div>
                    )}

                    {/* ITEMS LIST WITH SELECTED COLOR PHOTO */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="space-y-3">
                        {ord.items.map((item: any, itemIdx: number) => {
                          const prod = item.product || {};
                          const colorName = item.selectedColor?.name || item.color || 'Estándar';
                          const colorHex = item.selectedColor?.hex || '#30234F';
                          // Direct photo of selected color
                          const itemImg = item.product?.image || (prod.colorImages && prod.colorImages[colorName]) || (prod.images && prod.images[0]) || '';
                          const unitPrice = item.unitPrice || prod.discountPrice || prod.price || 0;
                          const qty = Number(item.quantity) || 1;

                          return (
                            <div
                              key={item.id || itemIdx}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200/70 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                                  {itemImg ? (
                                    <img
                                      src={itemImg}
                                      alt={`${prod.name} en color ${colorName}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-[#30234F] line-clamp-1">
                                    {prod.name || 'Prenda MoviFashion'}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                    {/* Color Swatch */}
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                        style={{ backgroundColor: colorHex }}
                                      />
                                      {colorName}
                                    </span>
                                    <span>·</span>
                                    <span className="font-semibold text-slate-700">Talla: {item.selectedSize || 'M'}</span>
                                    <span>·</span>
                                    <span>Cant: <strong className="text-slate-900">{qty}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs sm:text-sm font-black text-[#30234F] tabular-nums block">
                                  {formatCOP(unitPrice * qty)}
                                </span>
                                {qty > 1 && (
                                  <span className="text-[10px] text-slate-400 block tabular-nums">
                                    {formatCOP(unitPrice)} c/u
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* FINANCIAL BREAKDOWN & DELIVERY INFO */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                        
                        {/* Delivery & Payment details */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-2">
                          <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#7656D6]" />
                            Detalles de Despacho & Pago
                          </strong>
                          <div className="text-slate-600 space-y-1 text-[11px]">
                            <div>
                              <span className="text-slate-400">Destinatario: </span>
                              <span className="font-semibold">{ord.userName || ord.customer?.name}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Dirección: </span>
                              <span>{ord.shippingAddress?.street}, {ord.shippingAddress?.city} ({ord.shippingAddress?.department || 'Colombia'})</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Medio de Pago: </span>
                              <span className="font-semibold capitalize">
                                {ord.paymentMethod === 'pse' ? 'PSE (Transferencia en línea)' : ord.paymentMethod === 'cash_on_delivery' ? 'Contra Entrega' : 'Tarjeta de Crédito'}
                              </span>
                            </div>
                            {ord.trackingNumber && (
                              <div>
                                <span className="text-slate-400">Operador Logístico: </span>
                                <span className="font-mono font-bold text-slate-800">Coordinadora / Servientrega · {ord.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Colombian Tax Breakdown (IVA 19% Estatuto Tributario) */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-2">
                          <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#7656D6]" />
                            Desglose Fiscal (IVA 19%)
                          </strong>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between text-slate-500">
                              <span>Subtotal Base (sin IVA):</span>
                              <span className="font-mono tabular-nums">{formatCOP(ord.subtotalBase || Math.round(ord.subtotal / 1.19))}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>IVA (19% régimen ordinario):</span>
                              <span className="font-mono tabular-nums">{formatCOP(ord.iva || (ord.subtotal - Math.round(ord.subtotal / 1.19)))}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Costo de Envío:</span>
                              <span className="font-mono tabular-nums">{ord.shipping === 0 ? 'GRATIS' : formatCOP(ord.shipping)}</span>
                            </div>
                            {ord.discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-semibold">
                                <span>Descuento aplicado:</span>
                                <span className="font-mono tabular-nums">-{formatCOP(ord.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-[#30234F] pt-1 border-t border-slate-100">
                              <span>Total Pagado:</span>
                              <span className="text-[#7656D6] font-mono tabular-nums">{formatCOP(ord.total)}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* ACTION BUTTONS (Comprobante & Retracto/Devolución) */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500">
                          {retractInfo.eligible ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {retractInfo.message}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {retractInfo.message}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Receipt Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForReceipt(ord)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-[#7656D6] hover:bg-purple-50 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Ver Comprobante</span>
                          </button>

                          {/* Retracto / Devolución Button */}
                          <button
                            type="button"
                            disabled={!retractInfo.eligible}
                            onClick={() => {
                              if (retractInfo.eligible) {
                                setReturnOrderTarget(ord);
                                setReturnReason('retracto');
                                setReturnErrorMsg(null);
                              }
                            }}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all ${
                              retractInfo.eligible
                                ? 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer'
                                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                            }`}
                            title={retractInfo.message}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Solicitar Retracto o Devolución</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. DEFAULT ADDRESS SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#7656D6]" />
                Dirección Predeterminada de Entrega
              </h2>
              <p className="text-xs text-slate-500">
                Lugar habitual donde recibes tus paquetes en Colombia.
              </p>
            </div>
            {!editingAddress && (
              <button
                onClick={() => setEditingAddress(true)}
                className="text-xs text-[#7656D6] font-semibold hover:underline cursor-pointer"
              >
                Editar
              </button>
            )}
          </div>

          {editingAddress ? (
            <div className="space-y-3 max-w-lg">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#7656D6]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-[#7656D6] text-white text-xs font-semibold rounded-xl hover:bg-[#6344be] cursor-pointer"
                >
                  Guardar Dirección
                </button>
                <button
                  onClick={() => setEditingAddress(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium">
              {savedAddress}
            </div>
          )}
        </div>

        {/* 4. HABEAS DATA & PRIVACY SECTION (Ley 1581 de 2012) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Mis Datos Personales (Habeas Data · Ley 1581 de 2012)
              </h2>
              <p className="text-xs text-slate-500">
                Ejerce tus derechos constitucionales de acceso, rectificación, portabilidad y supresión de datos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-slate-200/80 space-y-2">
              <strong className="text-xs font-bold text-slate-800 block">Descargar mis Datos Personales</strong>
              <p className="text-xs text-slate-500">
                Obtén una copia íntegra en formato legible con tu historial de usuario y compras registradas.
              </p>
              <button
                onClick={() => handleHabeasDataAction('download')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#7656D6] hover:bg-purple-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Solicitar Copia de mis Datos</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-slate-200/80 space-y-2">
              <strong className="text-xs font-bold text-slate-800 block">Solicitar Supresión de Cuenta</strong>
              <p className="text-xs text-slate-500">
                Conforme a la ley colombiana, puedes pedir la eliminación de tu perfil salvo registros requeridos por DIAN.
              </p>
              <button
                onClick={() => handleHabeasDataAction('delete')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Solicitar Supresión (Habeas Data)</span>
              </button>
            </div>
          </div>

          {habeasDataRequested && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {habeasDataRequested === 'download'
                  ? 'Se ha generado y descargado tu archivo de datos personales correctamente.'
                  : `Tu solicitud de supresión ha sido radicada ante el Oficial de Privacidad (${EMPRESA.correoPrivacidad}). Plazo legal de respuesta: 15 días hábiles.`}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* PRINTABLE OFFICIAL RECEIPT MODAL */}
      {selectedOrderForReceipt && (
        <OrderReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

      {/* RETURN / RETRACTO REQUEST MODAL (LEY 1480 ART. 47) */}
      {returnOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-[#30234F]">
                  Radicar Retracto / Devolución
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnOrderTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Pedido: <strong className="text-[#30234F]">{returnOrderTarget.id}</strong> · Total: <strong>{formatCOP(returnOrderTarget.total)}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Conforme al Art. 47 de la Ley 1480 de 2011, tienes derecho al reintegro del dinero dentro de los 30 días calendario siguientes a la radicación.
              </p>
            </div>

            {returnSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{returnSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-3 text-xs">
                {returnErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{returnErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Solicitud</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#7656D6]"
                  >
                    <option value="retracto">Derecho Legal de Retracto (Art. 47 Ley 1480)</option>
                    <option value="cambio_talla">Cambio por Talla o Color</option>
                    <option value="garantia">Garantía por Defecto de Fabricación</option>
                    <option value="insatisfaccion">Insatisfacción con el Producto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Motivo y Observaciones</label>
                  <textarea
                    required
                    rows={3}
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    placeholder="Describe el estado de la prenda y el motivo de tu solicitud..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Banco Reembolso</label>
                    <input
                      type="text"
                      required
                      value={returnBank}
                      onChange={(e) => setReturnBank(e.target.value)}
                      placeholder="Ej. Bancolombia / Nequi / Davivienda"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      required
                      value={returnAccount}
                      onChange={(e) => setReturnAccount(e.target.value)}
                      placeholder="Número y tipo de cuenta"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="flex-1 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#6344be] text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReturn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Radicando solicitud...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Solicitud</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnOrderTarget(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
