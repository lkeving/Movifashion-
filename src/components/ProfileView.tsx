import React, { useState } from 'react';
import { User, Order, UserAddress } from '../types';
import { User as UserIcon, Package, Sliders, MapPin, Bell, Check, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { SafeProductImage } from './SafeProductImage';

interface ProfileViewProps {
  user: User;
  orders: Order[];
  onUpdatePreferences: (preferences: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  orders,
  onUpdatePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'orders' | 'addresses'>('preferences');
  const [style, setStyle] = useState(user.preferences.style);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(user.preferences.favoriteCategories);
  const [budget, setBudget] = useState(user.preferences.typicalBudget);
  const [saveNotice, setSaveNotice] = useState(false);

  const allCategories = ['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Zapatos', 'Bolsos', 'Accesorios', 'Ropa deportiva'];
  const styles = [
    { id: 'minimalista', label: 'Minimalista Studio', desc: 'Líneas limpias, tonos neutros y cortes arquitectónicos' },
    { id: 'streetwear', label: 'Urban Streetwear', desc: 'Siluetas holgadas, estética contemporánea y zapatillas' },
    { id: 'clasico', label: 'Sartorial Clásico', desc: 'Sastrería tradicional, sobriedad y acabados prémium' },
    { id: 'deportivo', label: 'Activewear Tech', desc: 'Prendas ergonómicas, transpirables y funcionales' },
    { id: 'elegante', label: 'Alta Elegancia', desc: 'Prendas de gala, tejidos nobles y distinción nocturna' },
  ];

  const handleToggleCategory = (cat: string) => {
    setFavoriteCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    onUpdatePreferences({
      style,
      favoriteCategories,
      typicalBudget: budget,
    });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7656D6] to-[#30234F] text-white flex items-center justify-center text-2xl font-black shadow-md overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-[#30234F]">{user.name}</h1>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#E9E2FA] text-[#7656D6] w-fit mx-auto sm:mx-0">
              Cliente MOVIFASHION
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-600">
            <span><strong>{orders.length}</strong> pedidos realizados</span>
            <span aria-hidden="true">·</span>
            <span>Estilo: <strong className="capitalize">{user.preferences.style}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Presupuesto habitual: <strong>${user.preferences.typicalBudget.toLocaleString('es-CO')} COP</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#F5F5F8] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-white text-[#30234F] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Preferencias de Moda (IA)</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-[#30234F] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Mis Pedidos ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'addresses'
              ? 'bg-white text-[#30234F] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Direcciones</span>
        </button>
      </div>

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F] mb-1">
              Estilo de Moda Predilecto
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              La IA adaptará sus sugerencias en el feed principal y el asistente según tu perfil.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStyle(s.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    style === s.id
                      ? 'border-[#7656D6] bg-[#E9E2FA]/20 ring-1 ring-[#7656D6]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs font-bold text-[#30234F]">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F] mb-1">
              Categorías Favoritas
            </h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {allCategories.map((cat) => {
                const isSelected = favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#7656D6] text-white shadow-xs'
                        : 'bg-[#F5F5F8] text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
                Presupuesto Habitual de Compra
              </h2>
              <span className="text-xs font-extrabold text-[#7656D6] tabular-nums">
                ${budget.toLocaleString('es-CO')} COP
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="25000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#7656D6] cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Datos protegidos según normativas de privacidad y OWASP A04
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all"
            >
              {saveNotice ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Preferencias Guardadas!</span>
                </>
              ) : (
                <span>Guardar Preferencias</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          {orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">Aún no tienes pedidos registrados</p>
              <p className="text-xs text-gray-500 mt-1">Tus compras con seguimiento en tiempo real aparecerán aquí.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#30234F]">{order.id}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Guía: <span className="font-mono font-medium text-gray-800">{order.trackingNumber}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit bg-[#E9E2FA] text-[#7656D6]">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => {
                    const itemImg =
                      (item.selectedColor && item.product.colorImages?.[item.selectedColor.name]?.[0]) ||
                      item.product.images[0];
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <SafeProductImage
                            src={itemImg}
                            fallbackSrc="/images/hero_fashion_editorial.jpg"
                            alt={`${item.product.name} - ${item.selectedColor?.name || ''}`}
                            productName={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0"
                          />
                        <div>
                          <p className="font-semibold text-gray-800">{item.product.name}</p>
                          <p className="text-[11px] text-gray-500">
                            Cant: {item.quantity} · Talla: {item.selectedSize} · {item.selectedColor.name}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 tabular-nums">
                        ${((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  );
                })}
              </div>

                {/* Total */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Total con envío asegurado</span>
                  <span className="text-sm font-extrabold text-[#7656D6] tabular-nums">
                    ${order.total.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#30234F]">
            Direcciones de Envío Guardadas
          </h2>
          {user.addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-2xl bg-[#F5F5F8] border border-gray-200/60 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">{addr.recipientName}</p>
                <p className="text-xs text-gray-600 mt-1">{addr.street}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.department} (CP {addr.postalCode})</p>
                <p className="text-[11px] text-gray-400 mt-1">Tel: {addr.phone}</p>
              </div>
              {addr.isDefault && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-700">
                  Predeterminada
                </span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
