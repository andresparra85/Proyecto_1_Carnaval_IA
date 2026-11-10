import React from 'react';
import { Map, Calendar, ShieldAlert, Plus, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface NavbarProps {
  activeView?: string;
  onSelectSenda?: () => void;
  onOpenCalendar?: () => void;
  onOpenReports?: () => void;
  onOpenReportModal?: () => void;
  reportsCount?: number;
  poisCount?: number;
  onOpenAuth?: (view: 'login' | 'register') => void;
}

export function Navbar({
  activeView = 'senda',
  onSelectSenda,
  onOpenCalendar,
  onOpenReports,
  onOpenReportModal,
  reportsCount = 0,
  poisCount = 18,
  onOpenAuth,
}: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    try {
      localStorage.removeItem('carnavalia_session');
    } catch (e) {
      console.warn('Error clearing session:', e);
    }
    logout();
  };

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Turista';
  const isTurista = user?.role === 'turista' || displayName.toLowerCase().includes('turista');

  return (
    <header className="fixed top-3 left-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl select-none transition-all pointer-events-auto">
      {/* 1. Logo CarnavalIA con acento neón y badges de telemetría */}
      <div
        onClick={onSelectSenda}
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        title="CarnavalIA • Sistema GIS del Carnaval de Pasto"
      >
        <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-400 p-[1.5px] shadow-[0_0_18px_rgba(225,29,72,0.5)] group-hover:scale-105 transition-all">
          <div className="w-full h-full rounded-full bg-[#07090e] flex items-center justify-center text-base sm:text-lg">
            🎭
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-sans">
              Carnaval<span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">IA</span>
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              Edición Oficial
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="font-bold text-cyan-400">{poisCount} Puntos Activos</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-slate-400 font-medium truncate hidden sm:inline">Telemetría GIS Pasto</span>
          </div>
        </div>
      </div>

      {/* 2. Centro: Navegación Principal en Cápsulas */}
      <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-950/60 border border-white/10 backdrop-blur-md shadow-inner">
        <button
          type="button"
          onClick={onSelectSenda}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeView === 'senda'
              ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Ver mapa interactivo de la Senda"
        >
          <Map className="w-3.5 h-3.5 shrink-0" />
          <span>Senda</span>
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeView === 'calendario'
              ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Ver programación oficial"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Calendario</span>
        </button>

        <button
          type="button"
          onClick={onOpenReports}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeView === 'reportes'
              ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Ver reportes ciudadanos"
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Reportes</span>
          {reportsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40">
              {reportsCount}
            </span>
          )}
        </button>
      </nav>

      {/* 3. Lado Derecho: Botón directo "+ Reportar Incidente", Avatar & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(225,29,72,0.45)] border border-rose-400/30 active:scale-95 transition-all cursor-pointer"
          title="Crear un nuevo reporte de incidencia en la Senda"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">+ Reportar Incidente</span>
          <span className="sm:hidden font-bold">Reportar</span>
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 border border-white/10 shadow-sm"
              title={`Usuario: ${displayName}`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {isTurista ? '🎭' : displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[90px] truncate">
                {displayName}
              </span>
            </div>

            <button
              id="header-logout-btn"
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 transition active:scale-95 cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth && onOpenAuth('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-rose-500/30 shadow-sm transition active:scale-95 cursor-pointer"
            title="Iniciar sesión"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;

