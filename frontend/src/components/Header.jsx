import React from 'react';
import { Map, Calendar, ShieldAlert, Plus, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({
  activeView = 'senda',
  onSelectSenda,
  onOpenCalendar,
  onOpenReports,
  onOpenReportModal,
  reportsCount = 0,
  onOpenAuth,
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('carnavalia_session');
    logout();
  };

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Turista';
  const isTurista = user?.role === 'turista' || displayName.toLowerCase().includes('turista');

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 transition-all shadow-2xl select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* 1. Lado Izquierdo: Logotipo, Antifaz y Badge de Estado en Vivo */}
        <div
          onClick={onSelectSenda}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          title="CarnavalIA - Sistema Inteligente del Carnaval de Pasto"
        >
          {/* Icono de Antifaz con Gradiente Andina Neón */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-500 text-white shadow-lg shadow-rose-600/30 text-xl group-hover:scale-105 transition-all">
            🎭
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
                CarnavalIA
              </span>

              {/* Badge de Estado en Vivo ("Edición Oficial") */}
              <div className="hidden xs:inline-flex sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Edición Oficial</span>
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
              San Juan de Pasto • Senda Interactiva
            </p>
          </div>
        </div>

        {/* 2. Centro: Navegación Principal en Píldoras (rounded-full) */}
        <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-2 p-1 rounded-full bg-slate-900/60 border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
          {/* Pestaña: Senda del Carnaval */}
          <button
            type="button"
            onClick={onSelectSenda}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeView === 'senda'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-600/30 andean-glow-crimson'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ver mapa de la Senda del Carnaval"
          >
            <Map className="w-4 h-4 shrink-0" />
            <span>Senda</span>
          </button>

          {/* Pestaña: Calendario de Eventos */}
          <button
            type="button"
            onClick={onOpenCalendar}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeView === 'calendario'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-600/30 andean-glow-crimson'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Abrir programación y calendario oficial"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Calendario</span>
            <span className="md:hidden">Eventos</span>
          </button>

          {/* Pestaña: Reportes Ciudadanos */}
          <button
            type="button"
            onClick={onOpenReports}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeView === 'reportes'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-600/30 andean-glow-crimson'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ver incidencias y reportes ciudadanos"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Reportes</span>
            {reportsCount > 0 && (
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                activeView === 'reportes' ? 'bg-white/30 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {reportsCount}
              </span>
            )}
          </button>
        </nav>

        {/* 3. Lado Derecho: Botón CTA Reportar, Avatar y Cerrar Sesión */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Botón de Reportar Incidente con CTA Claro */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/30 rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Crear un reporte rápido de incidencia en la senda"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline font-semibold">Reportar Incidente</span>
            <span className="sm:hidden font-semibold">Reportar</span>
          </button>

          {/* Sección de Usuario / Sesión en Cápsula Moderna */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Avatar Estilizado en Cápsula con Punto Brillante */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-md backdrop-blur-md"
                title={`Sesión activa: ${displayName}`}
              >
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-[11px] font-black text-white shadow-sm shrink-0">
                  {isTurista ? '🎭' : displayName.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  {isTurista && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-300">
                      Turista
                    </span>
                  )}
                </div>
              </div>

              {/* Botón Discreto y Limpio para Cerrar Sesión */}
              <button
                id="header-logout-btn"
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium hidden lg:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 shadow-sm transition active:scale-95 cursor-pointer"
              title="Iniciar sesión"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
