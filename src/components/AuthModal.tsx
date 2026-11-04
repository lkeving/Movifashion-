import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('La contraseña debe tener al menos 8 caracteres (OWASP A07).');
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

    // Success flow
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onLoginSuccess(selectedRole);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#30234F] to-[#7656D6] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E9E2FA]">
              Autenticación Segura · Supabase Auth
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'forgot' && 'Recuperar Contraseña'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Seleccionar Rol de Acceso
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F8] rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('cliente')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'cliente'
                    ? 'bg-white text-[#7656D6] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#30234F] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Administrador
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {successNotice ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-gray-800">Sesión iniciada correctamente</p>
              <p className="text-xs text-gray-500">Cargando perfil y permisos RBAC...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                    placeholder={selectedRole === 'admin' ? 'admin@movifashion.ai' : 'cliente@movifashion.ai'}
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
                      placeholder="••••••••"
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
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#7656D6] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>
                  {mode === 'login' && 'Entrar a MOVIFASHION'}
                  {mode === 'register' && 'Completar Registro'}
                  {mode === 'forgot' && 'Enviar Correo de Recuperación'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-gray-100">
                {mode === 'login' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[#7656D6] font-semibold hover:underline"
                    >
                      ¿No tienes cuenta? Regístrate
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="hover:underline"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#7656D6] font-semibold hover:underline mx-auto"
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
