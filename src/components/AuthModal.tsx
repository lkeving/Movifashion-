import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { authFetch, setStoredToken } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMessage?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMessage,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(initialMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }
    }

    if (!email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    if (mode === 'forgot') {
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setMode('login');
      }, 2000);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register'
        ? { name: name.trim(), email: email.trim().toLowerCase(), password }
        : { email: email.trim().toLowerCase(), password };

      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al autenticar');
      }

      if (data.token) {
        setStoredToken(data.token);
      }

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onLoginSuccess(data.user);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#30234F] to-[#7656D6] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E9E2FA]">
              Autenticación Segura · MOVIFASHION AI
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta de Cliente'}
              {mode === 'forgot' && 'Recuperar Contraseña'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-gray-800">
                {mode === 'forgot' ? 'Instrucciones enviadas a tu correo' : '¡Sesión Iniciada con Éxito!'}
              </p>
              <p className="text-xs text-gray-500">Cargando perfil y credenciales seguras...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Valentina Restrepo"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@movifashion.ai"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar a MOVIFASHION'}
                      {mode === 'register' && 'Crear Cuenta'}
                      {mode === 'forgot' && 'Enviar Correo de Recuperación'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-gray-100">
                {mode === 'login' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMsg('');
                      }}
                      className="text-[#7656D6] font-semibold hover:underline cursor-pointer"
                    >
                      ¿No tienes cuenta? Regístrate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-[#7656D6] font-semibold hover:underline mx-auto cursor-pointer"
                  >
                    Ya tengo cuenta. Iniciar Sesión
                  </button>
                )}
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
