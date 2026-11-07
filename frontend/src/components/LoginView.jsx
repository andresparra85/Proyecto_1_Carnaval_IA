import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView() {
  const { login, register, loginAsGuest } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const userName = name.trim() || trimmedEmail.split('@')[0].replace(/[._]/g, ' ');
        await register(userName, trimmedEmail, trimmedPassword);
      } else {
        await login(trimmedEmail, trimmedPassword);
      }
      localStorage.setItem('carnavalia_session', 'active');
    } catch (err) {
      console.error('Error de autenticación:', err);
      const detail = err.detail || err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setError(detail[0].msg);
      } else if (err.status === 401 || err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (err.status === 400 || err.response?.status === 400) {
        setError('Este correo electrónico ya se encuentra registrado.');
      } else {
        setError(err.message || 'No fue posible conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegister((prev) => !prev);
    setError(null);
  };

  const handleGuestLogin = () => {
    setError(null);
    localStorage.setItem('carnavalia_session', 'active');
    loginAsGuest();
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden select-none">
      {/* 1. Fondo Atmosférico con Gradientes y Resplandor Carnavalesco */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      
      {/* Orbes de luz difuminada inspirados en la paleta andina */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute -top-32 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Siluetas y partículas sutiles alusivas a la fiesta */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Elementos flotantes decorativos estilo carnaval */}
      <div className="absolute top-12 left-12 text-2xl opacity-20 pointer-events-none hidden sm:block animate-float">🎭</div>
      <div className="absolute bottom-16 left-20 text-xl opacity-20 pointer-events-none hidden sm:block animate-float" style={{ animationDelay: '2s' }}>🎺</div>
      <div className="absolute top-20 right-16 text-2xl opacity-20 pointer-events-none hidden sm:block animate-float" style={{ animationDelay: '3s' }}>👑</div>
      <div className="absolute bottom-20 right-20 text-xl opacity-20 pointer-events-none hidden sm:block animate-float" style={{ animationDelay: '1s' }}>🎨</div>

      {/* 2. Tarjeta Central Glassmorphism Pulida */}
      <div className="relative w-full max-w-sm sm:max-w-md p-7 sm:p-9 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-rose-950/40 z-10 transition-all duration-300">
        
        {/* Cabecera de Impacto con Insignia Cultural */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/15 via-fuchsia-500/15 to-amber-500/15 border border-white/10 text-[11px] font-semibold text-amber-300 shadow-sm mb-3">
            <span>🎭</span>
            <span>Patrimonio Cultural Inmaterial UNESCO</span>
          </div>

          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white text-3xl mb-2.5 shadow-lg shadow-rose-600/30 ring-4 ring-white/10">
            🎭
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1">
            Carnaval<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">IA</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-semibold tracking-wide">
            Senda Interactiva y Guía Cultural • Pasto, Nariño
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isRegister
              ? 'Regístrate para colaborar y explorar la fiesta magna'
              : 'Inicia sesión para acceder a la Senda y servicios en vivo'}
          </p>
        </div>

        {/* Alerta de error elegante */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1 font-medium leading-tight">{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre en Registro */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Camila Narváez"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition duration-200"
              />
            </div>
          )}

          {/* Campo de Correo Electrónico */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@carnavalia.co"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition duration-200"
              />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 rounded-xl cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón Principal de Acción con Degradado Festivo */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-600/30 hover:shadow-rose-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isRegister ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Crear Cuenta y Entrar' : 'Iniciar Sesión'}</span>
            )}
          </button>

          {/* Separador sutil */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-slate-900/90 px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold select-none">
              o acceso libre
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Botón Secundario: Explorar como Invitado / Turista */}
          <button
            id="guest-login-btn"
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
            title="Explorar como Invitado / Turista sin credenciales"
          >
            <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>Explorar como Invitado / Turista</span>
          </button>
        </form>

        {/* Enlace inferior para alternar entre Login y Registro */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={handleToggleMode}
                className="font-bold text-rose-400 hover:text-amber-300 transition cursor-pointer ml-1 underline decoration-rose-500/40 underline-offset-4"
              >
                Iniciar sesión
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={handleToggleMode}
                className="font-bold text-rose-400 hover:text-amber-300 transition cursor-pointer ml-1 underline decoration-rose-500/40 underline-offset-4"
              >
                Regístrate aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginView;
