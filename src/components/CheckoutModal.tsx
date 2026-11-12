import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Truck, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Tag,
  Download,
  Lock
} from 'lucide-react';
import { CartItem, User, Order } from '../types';
import { authFetch } from '../utils/api';
import { EMPRESA } from '../config/empresa.ts';
import { formatCOP, calcularBaseGravable, calcularIva } from '../utils/impuestos.ts';
import { OrderReceiptModal } from './OrderReceiptModal.tsx';
import { Link } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User;
  onOrderSuccess: (order: Order) => void;
  onSessionExpired?: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onOrderSuccess,
  onSessionExpired,
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [recipientName, setRecipientName] = useState(user.addresses?.[0]?.recipientName || user.name || '');
  const [street, setStreet] = useState(user.addresses?.[0]?.street || '');
  const [city, setCity] = useState(user.addresses?.[0]?.city || '');
  const [department, setDepartment] = useState(user.addresses?.[0]?.department || '');
  const [phone, setPhone] = useState(user.addresses?.[0]?.phone || '');
  const [documentId, setDocumentId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer'>('cash_on_delivery');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    freeShipping?: boolean;
    gift?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [ruletaCouponHint, setRuletaCouponHint] = useState(false);

  // Legal Consent Checkbox
  const [legalConsent, setLegalConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRecipientName((prev) => prev || user.addresses?.[0]?.recipientName || user.name || '');
    setStreet((prev) => prev || user.addresses?.[0]?.street || '');
    setCity((prev) => prev || user.addresses?.[0]?.city || '');
    setDepartment((prev) => prev || user.addresses?.[0]?.department || '');
    setPhone((prev) => prev || user.addresses?.[0]?.phone || '');
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('movifashion_ruleta_v1');
      if (!raw) {
        setRuletaCouponHint(false);
        return;
      }
      const parsed = JSON.parse(raw);
      const codigo = typeof parsed?.codigo === 'string' ? parsed.codigo.trim().toUpperCase() : '';
      const expiraMs = parsed?.expira ? new Date(parsed.expira).getTime() : null;
      const isExpired = expiraMs !== null && !Number.isNaN(expiraMs) && expiraMs <= Date.now();
      if (codigo && !isExpired) {
        setRuletaCouponHint(true);
        setCouponCode((prev) => (prev.trim() === '' ? codigo : prev));
      } else {
        setRuletaCouponHint(false);
      }
    } catch {
      setRuletaCouponHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculations
  const subtotal = items.reduce((acc, i) => acc + (i.product.discountPrice || i.product.price) * i.quantity, 0);
  const shipping = (appliedCoupon?.freeShipping || subtotal >= EMPRESA.umbralEnvioGratis) ? 0 : EMPRESA.costoEnvioNacional;
  
  const discountVal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountVal + shipping);

  const baseGravable = calcularBaseGravable(subtotal - discountVal);
  const valorIva = (subtotal - discountVal) - baseGravable;

  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await authFetch('/api/auth/me');
      if (res.status === 401) {
        onClose();
        if (onSessionExpired) {
          onSessionExpired('Tu sesión expiró, inicia sesión de nuevo');
        }
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          freeShipping: Boolean(data.freeShipping),
          gift: typeof data.gift === 'string' ? data.gift : undefined,
        });
      } else {
        setCouponError(data.error || 'Cupón inválido o expirado.');
      }
    } catch {
      // Fallback para códigos conocidos
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === 'MOVI10' || codeUpper === 'COLOMBIA10') {
        const disc = Math.round(subtotal * 0.10);
        setAppliedCoupon({ code: codeUpper, discountPercent: 10, discountAmount: disc });
      } else {
        setCouponError('Código no válido. Prueba con "MOVI10" para 10% de descuento.');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceedToPaymentStep = async () => {
    if (!recipientName.trim() || !documentId.trim() || !street.trim() || !city.trim() || !department.trim() || !phone.trim()) {
      setErrorMessage('Por favor completa todos los datos obligatorios de envío.');
      return;
    }
    const valid = await checkSession();
    if (!valid) return;
    setErrorMessage(null);
    setStep('payment');
  };

  const validatePayment = (): boolean => {
    setErrorMessage(null);
    if (!legalConsent) {
      setErrorMessage('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
      return false;
    }
    if (paymentMethod === 'bank_transfer') {
      const digits = accountNumber.replace(/\D/g, '');
      if (!bankName.trim() || !accountHolder.trim() || digits.length < 4) {
        setErrorMessage('Por favor ingresa el banco, el titular y al menos 4 dígitos del número de cuenta para la transferencia simulada.');
        return false;
      }
    }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validatePayment()) return;

    const valid = await checkSession();
    if (!valid) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanAccountDigits = accountNumber.replace(/\D/g, '');
      const last4 = cleanAccountDigits.slice(-4);

      const orderPayload = {
        items: items.map(i => ({
          id: i.id,
          productId: i.product.id,
          product: i.product,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
        })),
        shippingAddress: {
          id: `addr-${Date.now()}`,
          recipientName: recipientName.trim(),
          address: street.trim(),
          street: street.trim(),
          city: city.trim(),
          department: department.trim(),
          postalCode: user.addresses?.[0]?.postalCode || '',
          phone: phone.trim(),
          isDefault: true,
        },
        documentId: documentId.trim(),
        paymentMethod,
        bankTransfer: paymentMethod === 'bank_transfer'
          ? {
              bankName: bankName.trim(),
              accountHolder: accountHolder.trim(),
              accountLast4: last4 || undefined,
            }
          : undefined,
        couponCode: appliedCoupon?.code,
        discount: discountVal,
      };

      const res = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await res.json();

      if (res.status === 401) {
        onClose();
        if (onSessionExpired) {
          onSessionExpired('Tu sesión expiró, inicia sesión de nuevo');
        }
        return;
      }

      if (!res.ok) {
        throw new Error(responseData.error || 'Error al procesar el pedido en el servidor');
      }

      setCreatedOrder(responseData);
      setStep('success');
      onOrderSuccess(responseData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión al procesar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 'payment' && (
              <button
                onClick={() => {
                  setStep('shipping');
                  setErrorMessage(null);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-sm sm:text-base text-[#30234F]">
              {step === 'shipping' && 'Paso 1: Destino de Entrega (Colombia)'}
              {step === 'payment' && 'Paso 2: Método de Pago Seguro (Simulado)'}
              {step === 'success' && 'Confirmación de Compra'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 bg-[#F5F5F8] text-[11px] font-semibold text-center border-b border-gray-100">
          <div className={`py-2 ${step === 'shipping' ? 'bg-[#7656D6] text-white' : 'text-gray-500'}`}>
            1. Envío
          </div>
          <div className={`py-2 ${step === 'payment' ? 'bg-[#7656D6] text-white' : 'text-gray-500'}`}>
            2. Pago & Impuestos
          </div>
          <div className={`py-2 ${step === 'success' ? 'bg-[#7656D6] text-white' : 'text-gray-500'}`}>
            3. Comprobante
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SHIPPING */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de quien recibe *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Escribe tu nombre completo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cédula de Ciudadanía / NIT *</label>
                    <input
                      type="text"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Escribe tu número de cédula o NIT"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Escribe tu celular con indicativo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección Completa de Entrega *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Escribe la dirección completa de entrega"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ciudad / Municipio *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Escribe la ciudad de entrega"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Departamento *</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Escribe el departamento de entrega"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="pt-2 border-t border-slate-100">
                {ruletaCouponHint && !appliedCoupon && (
                  <p className="text-[11px] font-semibold text-[#7656D6] mb-1.5">
                    Tienes un cupón de la ruleta
                  </p>
                )}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Escribe tu código de cupón (opcional)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
                  >
                    {couponLoading ? 'Aplicando...' : 'Aplicar'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {appliedCoupon.freeShipping
                      ? `Cupón "${appliedCoupon.code}" aplicado: Envío nacional GRATIS.`
                      : appliedCoupon.gift
                        ? `Cupón "${appliedCoupon.code}" aplicado: Incluye obsequio sorpresa.`
                        : `Cupón "${appliedCoupon.code}" aplicado: -${formatCOP(appliedCoupon.discountAmount)} de descuento.`}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Prendas ({items.length}):</span>
                  <span className="font-semibold tabular-nums">{formatCOP(subtotal)}</span>
                </div>
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento cupón ({appliedCoupon.discountPercent}%):</span>
                    <span className="tabular-nums">-{formatCOP(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                {appliedCoupon?.gift && (
                  <div className="flex justify-between text-[#7656D6] font-semibold">
                    <span>Beneficio de ruleta:</span>
                    <span>Incluye obsequio sorpresa</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío nacional:</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    {shipping === 0 ? 'GRATIS' : formatCOP(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#30234F] pt-1 border-t border-purple-200">
                  <span>Total Estimado:</span>
                  <span className="tabular-nums font-black">{formatCOP(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPaymentStep}
                className="w-full py-3 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar al Pago</span>
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT & TAXES */}
          {step === 'payment' && (
            <div className="space-y-4">
              
              {/* Payment Mode Info Alert */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Modalidades habilitadas:</strong> Puedes pagar al recibir (Contraentrega) o registrar una transferencia bancaria simulada sin débito ni cargo real.
                </span>
              </div>

              {/* Payment Method Selector (ONLY 2 modalities) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-[#7656D6] bg-[#E9E2FA]/40 text-[#30234F] font-bold shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Contraentrega</span>
                    <span className="text-[10px] text-gray-500 font-normal">Pagas en efectivo al recibir</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#7656D6] bg-[#E9E2FA]/40 text-[#30234F] font-bold shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-[#7656D6] shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Cuenta bancaria / transferencia simulada</span>
                    <span className="text-[10px] text-gray-500 font-normal">Simulación académica sin débito real</span>
                  </div>
                </button>
              </div>

              {/* Form Fields according to method */}
              {paymentMethod === 'cash_on_delivery' && (
                <div className="p-4 rounded-2xl bg-[#E9E2FA]/40 text-xs text-gray-700 space-y-1.5 border border-[#E9E2FA]">
                  <p className="font-bold text-[#30234F]">Pago Contraentrega en Efectivo</p>
                  <p>Pagarás en efectivo al recibir tu paquete en: <strong>{street}, {city}</strong>.</p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                  <p className="text-[11px] font-semibold text-[#30234F]">
                    Simulación de Transferencia Bancaria (no realiza débito ni transacción real)
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Entidad Bancaria *</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Escribe el nombre de tu banco"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Titular de la Cuenta *</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Escribe el nombre del titular de la cuenta"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Número de Cuenta (Simulación) *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Escribe el número de cuenta bancaria (solo simulación)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white font-mono focus:outline-none focus:border-[#7656D6]"
                    />
                  </div>
                </div>
              )}

              {/* Statutory Tax Breakdown (IVA 19%) */}
              <div className="p-3.5 rounded-xl bg-slate-50 text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Base gravable liquidada:</span>
                  <span className="tabular-nums font-mono">{formatCOP(baseGravable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impuesto sobre las Ventas (IVA 19%):</span>
                  <span className="tabular-nums font-mono">{formatCOP(valorIva)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo de Envío:</span>
                  <span className="tabular-nums font-mono">{shipping === 0 ? 'GRATIS' : formatCOP(shipping)}</span>
                </div>
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento cupón:</span>
                    <span className="tabular-nums font-mono">-{formatCOP(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                {appliedCoupon?.gift && (
                  <div className="flex justify-between text-[#7656D6] font-semibold">
                    <span>Obsequio:</span>
                    <span>Incluye obsequio sorpresa</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-[#30234F] pt-2 border-t border-slate-200">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-[#7656D6] tabular-nums font-black">{formatCOP(total)}</span>
                </div>
              </div>

              {/* Mandatory Colombian Legal Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="checkout-legal"
                  checked={legalConsent}
                  onChange={(e) => setLegalConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#7656D6] focus:ring-[#7656D6]"
                />
                <label htmlFor="checkout-legal" className="text-[11px] text-slate-600 leading-tight">
                  He leído y acepto los{' '}
                  <Link to="/terminos-y-condiciones" target="_blank" className="text-[#7656D6] underline">
                    Términos y Condiciones
                  </Link>
                  , conozco el derecho de retracto de 5 días (Ley 1480 de 2011) y autorizo el tratamiento de mis datos personales según la{' '}
                  <Link to="/politica-de-privacidad" target="_blank" className="text-[#7656D6] underline">
                    Ley 1581 de 2012
                  </Link>.
                </label>
              </div>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting || !legalConsent}
                className="w-full py-3.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando pedido en el sistema...</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'cash_on_delivery'
                      ? `Confirmar Pedido Contraentrega · ${formatCOP(total)}`
                      : `Confirmar Transferencia Simulada · ${formatCOP(total)}`}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && createdOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#30234F]">¡Pedido {createdOrder.id} Confirmado!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Hemos enviado la constancia legal y el desglose de IVA a <strong>{createdOrder.userEmail || user.email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F5F8] text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className="font-bold text-[#7656D6]">{createdOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guía de transporte:</span>
                  <span className="font-mono font-medium text-gray-800">{createdOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destino:</span>
                  <span className="text-gray-800 truncate max-w-[200px]">{createdOrder.shippingAddress?.street || createdOrder.shippingAddress?.address}, {createdOrder.shippingAddress?.city}</span>
                </div>
                {((createdOrder as any).gift || appliedCoupon?.gift) && (
                  <div className="flex justify-between text-[#7656D6] font-semibold">
                    <span>Obsequio:</span>
                    <span>Incluye obsequio sorpresa</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500">Total pagado:</span>
                  <span className="font-bold tabular-nums text-gray-900">{formatCOP(createdOrder.total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7656D6] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-purple-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Comprobante</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#30234F] text-white text-xs font-bold hover:bg-[#7656D6] transition-colors cursor-pointer"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {showReceiptModal && createdOrder && (
        <OrderReceiptModal
          order={createdOrder}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
