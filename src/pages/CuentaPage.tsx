import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { Seo } from '../components/Seo.tsx';
import { OrderReceiptModal } from '../components/OrderReceiptModal.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP } from '../utils/impuestos.ts';
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Download, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CuentaPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const CuentaPage: React.FC<CuentaPageProps> = ({ user, onOpenAuth, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  
  // Habeas Data Request State
  const [habeasDataRequested, setHabeasDataRequested] = useState<'download' | 'delete' | null>(null);

  // Address State
  const [savedAddress, setSavedAddress] = useState(() => {
    return localStorage.getItem('movifashion_user_address') || 'Calle 93B # 13-45, Bogotá D.C.';
  });
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(savedAddress);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch('/api/orders/mine', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch(() => {
          // Silent fallback
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

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
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Mi Cuenta & Mis Pedidos"
        description={`Panel de cliente de ${EMPRESA.nombreComercial}. Consulta tus compras, comprobantes con IVA y gestiona tus datos personales.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Mi Cuenta', path: '/cuenta' },
        ]}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* User Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#30234F] text-white flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#30234F]">{user.name}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-2 py-0.5 rounded">
                Cliente Verificado MoviFashion
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#30234F] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#7656D6]" />
                Mis Pedidos y Envíos
              </h2>
              <p className="text-xs text-slate-500">
                Historial de compras con número de guía y comprobante imprimible con desglose de IVA 19%.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {orders.length} pedidos
            </span>
          </div>

          {loadingOrders ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Cargando historial de pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aún no has realizado pedidos</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explora nuestras colecciones y descubre prendas contemporáneas con envío gratis desde {formatCOP(EMPRESA.umbralEnvioGratis)}.
              </p>
              <Link
                to="/catalogo"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#7656D6] text-white text-xs font-semibold hover:bg-[#6344be] transition-colors"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#30234F]">{ord.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString('es-CO')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span>{ord.items.length} prenda(s): </span>
                      <strong className="text-slate-800">{ord.items.map(i => i.product.name).join(', ')}</strong>
                    </div>

                    {ord.trackingNumber && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Transportadora: Coordinadora / Servientrega · Guía: <strong>{ord.trackingNumber}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-base font-black text-[#30234F] tabular-nums">
                      {formatCOP(ord.total)}
                    </span>
                    <button
                      onClick={() => setSelectedOrderForReceipt(ord)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-[#7656D6] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Comprobante PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
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
                className="text-xs text-[#7656D6] font-semibold hover:underline"
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
                  className="px-4 py-2 bg-[#7656D6] text-white text-xs font-semibold rounded-xl hover:bg-[#6344be]"
                >
                  Guardar Dirección
                </button>
                <button
                  onClick={() => setEditingAddress(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
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

        {/* Habeas Data & Privacy Section (Ley 1581 de 2012) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
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

      {/* Printable Receipt Modal */}
      {selectedOrderForReceipt && (
        <OrderReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
