// Module: Marketing, Cupones & Editor de Banners
// Promo codes management, usage statistics, top banner announcement editor

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Percent,
  Megaphone,
  Check,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { authFetch } from '../../utils/api.ts';

export const MarketingModule: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any>({ topBannerText: '' });
  const [topBannerInput, setTopBannerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [minSubtotal, setMinSubtotal] = useState('100000');
  const [maxUses, setMaxUses] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);

  const fetchMarketingData = async () => {
    setIsLoading(true);
    try {
      const [resCoup, resBan] = await Promise.all([
        authFetch('/api/admin/marketing/coupons'),
        authFetch('/api/admin/marketing/banners'),
      ]);
      if (resCoup.ok) setCoupons(await resCoup.json());
      if (resBan.ok) {
        const banData = await resBan.json();
        setBanners(banData);
        setTopBannerInput(banData.topBannerText || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/marketing/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountPercent: Number(discountPercent),
          minSubtotal: Number(minSubtotal),
          maxUses: Number(maxUses),
        }),
      });
      if (res.ok) {
        setShowCouponModal(false);
        setCode('');
        await fetchMarketingData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    if (!confirm(`¿Eliminar cupón ${couponCode}?`)) return;
    try {
      await authFetch(`/api/admin/marketing/coupons/${couponCode}`, { method: 'DELETE' });
      await fetchMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBanner = async () => {
    try {
      await authFetch('/api/admin/marketing/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topBannerText: topBannerInput }),
      });
      setBannerSaved(true);
      setTimeout(() => setBannerSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Announcement Editor */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#7656D6]" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Barra Superior de Avisos (Top Banner)
            </h3>
            <p className="text-xs text-slate-500">
              Texto promocional fijo visible en la parte superior de todas las páginas de la tienda.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={topBannerInput}
            onChange={e => setTopBannerInput(e.target.value)}
            placeholder="Ej: Envío gratis desde $200.000 · IVA 19% incluido en todos los precios"
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
          />
          <button
            onClick={handleSaveBanner}
            className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            {bannerSaved ? <Check className="w-4 h-4" /> : null}
            <span>{bannerSaved ? '¡Guardado!' : 'Actualizar Banner'}</span>
          </button>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cupones de Descuento Activos
              </h3>
              <p className="text-xs text-slate-500">
                Los clientes pueden ingresar estos códigos en el paso 1 del Checkout.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCouponModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Cupón</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {coupons.map(c => {
            const usagePercent = Math.min(100, Math.round(((c.usesCount || 0) / (c.maxUses || 500)) * 100));
            return (
              <div
                key={c.code}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {c.code}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {c.discountPercent}% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mínimo de compra: ${(c.minSubtotal || 0).toLocaleString('es-CO')} COP
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Usos: {c.usesCount || 0}</span>
                      <span>Límite: {c.maxUses || 500}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#7656D6] h-full" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-200 mt-4">
                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Crear Cupón */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">Nuevo Código Promocional</h3>
            <p className="text-slate-500 mb-4">Configura las condiciones de aplicación en el checkout.</p>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código del Cupón *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: COLOMBIA15"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descuento (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compra Mínima (COP)</label>
                  <input
                    type="number"
                    value={minSubtotal}
                    onChange={e => setMinSubtotal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Límite Máximo de Usos</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear Cupón</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
