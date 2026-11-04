import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Building2, Truck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { CartItem, User, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [recipientName, setRecipientName] = useState(user.addresses?.[0]?.recipientName || user.name || '');
  const [street, setStreet] = useState(user.addresses?.[0]?.street || 'Carrera 43A # 18 Sur - 122');
  const [city, setCity] = useState(user.addresses?.[0]?.city || 'Medellín');
  const [department, setDepartment] = useState(user.addresses?.[0]?.department || 'Antioquia');
  const [phone, setPhone] = useState(user.addresses?.[0]?.phone || '+57 312 890 4421');
  
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pse' | 'cash_on_delivery'>('credit_card');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8892');
  const [cardHolder, setCardHolder] = useState(user.name || 'Valentina Restrepo');
  const [cardExp, setCardExp] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('892');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Client calculation matching server rule: free shipping from $200.000 COP
  const subtotal = items.reduce((acc, i) => acc + (i.product.discountPrice || i.product.price) * i.quantity, 0);
  const shipping = subtotal >= 200000 ? 0 : 15000;
  const total = subtotal + shipping;

  const validatePayment = (): boolean => {
    setErrorMessage(null);
    if (paymentMethod === 'credit_card') {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      if (cleanDigits.length !== 16) {
        setErrorMessage('El número de tarjeta demo debe contener 16 dígitos numéricos.');
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExp.trim())) {
        setErrorMessage('La fecha de vencimiento debe tener formato MM/AA (ejemplo: 11/28).');
        return false;
      }
      const cleanCvv = cardCvv.trim();
      if (!/^\d{3,4}$/.test(cleanCvv)) {
        setErrorMessage('El código de seguridad CVV debe contener 3 dígitos numéricos.');
        return false;
      }
    }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validatePayment()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      const last4 = cleanDigits.slice(-4) || '8892';

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
          recipientName,
          street,
          city,
          department,
          postalCode: '050022',
          phone,
          isDefault: true,
        },
        paymentMethod,
        cardLast4: paymentMethod === 'credit_card' ? last4 : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(orderPayload),
      });

      const responseData = await res.json();

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
            <h2 className="text-base font-bold text-[#30234F]">
              {step === 'shipping' && 'Paso 1: Dirección de Envío'}
              {step === 'payment' && 'Paso 2: Método de Pago Seguro'}
              {step === 'success' && '¡Pedido Confirmado!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Step 1: Shipping Details */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo del Destinatario</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección Completa (Calle, Edificio, Apto)</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('payment');
                  }}
                  disabled={!recipientName || !street || !city || !phone}
                  className="px-6 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Continuar al Pago
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Sandbox */}
          {step === 'payment' && (
            <div className="space-y-4">
              
              {/* Visible Simulated Payment Notice Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pago simulado – no se realiza ningún cobro real.</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#7656D6] bg-[#E9E2FA]/30 text-[#7656D6] font-bold ring-1 ring-[#7656D6]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">Tarjeta Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pse')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'pse'
                      ? 'border-[#7656D6] bg-[#E9E2FA]/30 text-[#7656D6] font-bold ring-1 ring-[#7656D6]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">PSE Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-[#7656D6] bg-[#E9E2FA]/30 text-[#7656D6] font-bold ring-1 ring-[#7656D6]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Truck className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">Contraentrega</span>
                </button>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="p-4 rounded-2xl bg-[#F5F5F8] border border-gray-100 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Valentina Restrepo"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Número de Tarjeta (16 dígitos)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      maxLength={19}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8901 2345 8892"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        value={cardExp}
                        maxLength={5}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="11/28"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">CVV (3 dígitos)</label>
                      <input
                        type="password"
                        value={cardCvv}
                        maxLength={4}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="892"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'pse' && (
                <div className="p-4 rounded-2xl bg-[#F5F5F8] text-xs text-gray-600 space-y-2 border border-gray-100">
                  <p className="font-semibold text-gray-800">Pasarela PSE Simulada</p>
                  <p>Al confirmar, se procesará la autorización bancaria de prueba instantáneamente en modo sandbox.</p>
                </div>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="p-4 rounded-2xl bg-[#E9E2FA]/40 text-xs text-gray-700 space-y-1.5 border border-[#E9E2FA]">
                  <p className="font-bold text-[#30234F]">Pago Contraentrega</p>
                  <p>Pagarás en efectivo o datáfono al recibir tus prendas en la dirección indicada: <strong>{street}, {city}</strong>.</p>
                </div>
              )}

              {/* Order Breakdown */}
              <div className="p-3.5 rounded-xl bg-gray-50 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Prendas ({items.length})</span>
                  <span className="font-semibold tabular-nums">${subtotal.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío (Gratis desde $200.000)</span>
                  <span className="font-semibold tabular-nums">{shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString('es-CO')} COP`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#30234F] pt-1.5 border-t border-gray-200">
                  <span>Total a Pagar</span>
                  <span className="text-[#7656D6] tabular-nums font-black">${total.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con pasarela sandbox (~1.5s)...</span>
                  </>
                ) : (
                  <span>Pagar Ahora (Simulado) · ${total.toLocaleString('es-CO')} COP</span>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 'success' && createdOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#30234F]">¡Pedido {createdOrder.id} Exitoso!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Hemos enviado la confirmación y recibo detallado a <strong>{createdOrder.userEmail || user.email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F5F8] text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado inicial:</span>
                  <span className="font-bold text-[#7656D6]">{createdOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Número de seguimiento:</span>
                  <span className="font-mono font-medium text-gray-800">{createdOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dirección:</span>
                  <span className="text-gray-800 truncate max-w-[200px]">{createdOrder.shippingAddress?.street}, {createdOrder.shippingAddress?.city}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500">Total pagado:</span>
                  <span className="font-bold tabular-nums text-gray-900">${createdOrder.total.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#30234F] text-white text-xs font-bold hover:bg-[#7656D6] transition-colors cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
