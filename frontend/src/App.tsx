import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import ReportModal from './components/ReportModal';
import CitizenReportsModal from './components/CitizenReportsModal';
import EventsCalendarModal from './components/EventsCalendarModal';
import ChatBot from './components/ChatBot';
import GuanenaChat from './components/GuanenaChat';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import LoginView from './components/LoginView';
import Toast from './components/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { api } from './services/api';
import { fetchActiveReports, submitIncidentReport } from './services/reportService';
import { useAuth } from './context/AuthContext';
import { RefreshCw, ShieldAlert, MapPin } from 'lucide-react';

export function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Auditar estrictamente el estado de autenticación desde localStorage con manejo seguro de excepciones
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    try {
      return Boolean(
        typeof window !== 'undefined' &&
        localStorage.getItem('carnavalia_session') === 'active'
      );
    } catch (e) {
      console.warn('Error leyendo carnavalia_session en inicialización:', e);
      return false;
    }
  });

  useEffect(() => {
    try {
      const active = Boolean(
        isAuthenticated &&
        typeof window !== 'undefined' &&
        localStorage.getItem('carnavalia_session') === 'active'
      );
      setIsSessionActive(active);
    } catch (e) {
      console.warn('Error actualizando carnavalia_session:', e);
      setIsSessionActive(false);
    }
  }, [isAuthenticated]);

  const [pois, setPois] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [isServerHealthy, setIsServerHealthy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('senda');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentCarnivalDay, setCurrentCarnivalDay] = useState('06-ene');
  const [userGps, setUserGps] = useState<any>(null);
  const userGpsRef = useRef<any>(null);
  useEffect(() => {
    userGpsRef.current = userGps;
  }, [userGps]);

  const [navRoute, setNavRoute] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Estado para la capa y foco de la Senda del Carnaval
  const [showSenda, setShowSenda] = useState(false);
  const [focusSendaTrigger, setFocusSendaTrigger] = useState(0);

  // Estado para la ruta dinámica y telemetría trazada por GuaneñaBot (Gemini 2.5 Flash)
  const [activeRouteCoordinates, setActiveRouteCoordinates] = useState<[number, number][]>([]);
  const [shouldDrawRoute, setShouldDrawRoute] = useState<boolean>(false);
  const [routeTitle, setRouteTitle] = useState<string>('');
  const [activeSchedule, setActiveSchedule] = useState<any>(null);
  const [activeNearbyPlaces, setActiveNearbyPlaces] = useState<any[]>([]);

  const handleRouteReceived = useCallback((
    waypoints: [number, number][],
    shouldDraw: boolean,
    title?: string,
    schedule?: any,
    nearbyPlaces?: any[]
  ) => {
    setActiveRouteCoordinates(waypoints);
    setShouldDrawRoute(shouldDraw);
    if (title) setRouteTitle(title);
    if (schedule) setActiveSchedule(schedule);
    if (nearbyPlaces) setActiveNearbyPlaces(nearbyPlaces);
    setShowSenda(true);
    if (waypoints && waypoints.length >= 2) {
      setNavRoute({
        startCoords: waypoints[0],
        targetCoords: waypoints[waypoints.length - 1],
        targetName: title || 'Ruta guiada por GuaneñaBot',
        isGeminiRoute: true,
        waypoints: waypoints,
        schedule: schedule || null,
        nearbyPlaces: nearbyPlaces || [],
      });
    }
  }, []);

  const handleFocusSenda = useCallback(() => {
    setShowSenda(true);
    setFocusSendaTrigger((prev) => prev + 1);
  }, []);

  // Escuchar comandos de IA emitidos desde GuaneñaBot para cambiar fecha de carnaval o trazar ruta OSRM
  useEffect(() => {
    const handleDayEvent = (e: any) => {
      if (e?.detail?.dayId) {
        setCurrentCarnivalDay(e.detail.dayId);
      }
    };
    const handleRouteEvent = (e: any) => {
      if (e?.detail) {
        const detail = e.detail;
        const currentGps = userGpsRef.current;
        const start = detail.startCoords || (currentGps ? [currentGps.lat, currentGps.lng] : [1.2136, -77.2811]);
        setNavRoute({
          ...detail,
          startCoords: start,
        });
      }
    };
    window.addEventListener('focus-carnival-day', handleDayEvent);
    window.addEventListener('route-to-poi', handleRouteEvent);
    return () => {
      window.removeEventListener('focus-carnival-day', handleDayEvent);
      window.removeEventListener('route-to-poi', handleRouteEvent);
    };
  }, []);

  // Estado para Toast de notificaciones
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 4000);
  }, []);

  // Carga sincronizada de datos desde el backend y Supabase
  const loadDashboardData = useCallback(async () => {
    try {
      const [healthRes, poisRes, reportsRes, zonesRes, supabaseReportsRes] = await Promise.allSettled([
        api.checkHealth(),
        api.getPOIs(),
        api.getReports(),
        api.getZonesRisk(),
        fetchActiveReports(),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value?.status === 'healthy') {
        setIsServerHealthy(true);
      } else {
        setIsServerHealthy(false);
      }

      if (poisRes.status === 'fulfilled') {
        setPois(poisRes.value || []);
      }

      // Priorizar o fusionar reportes de Supabase y API de respaldo
      if (supabaseReportsRes.status === 'fulfilled' && Array.isArray(supabaseReportsRes.value) && supabaseReportsRes.value.length > 0) {
        setReports(supabaseReportsRes.value);
      } else if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value || []);
      }

      if (zonesRes.status === 'fulfilled') {
        setZones(zonesRes.value || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al sincronizar datos:', err);
      setIsServerHealthy(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling periódico cada 30 segundos solo si está autenticado
  useEffect(() => {
    if (isSessionActive) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isSessionActive, loadDashboardData]);

  // Al iniciar sesión, asegurar que la vista por defecto sea el mapa principal (Senda)
  useEffect(() => {
    if (isSessionActive) {
      setActiveView('senda');
      setCalendarOpen(false);
      setReportsModalOpen(false);
      setReportModalOpen(false);
    }
  }, [isSessionActive]);

  // Manejar selección de coordenadas al hacer clic en el mapa (solo en modo de reporte)
  const handleSelectCoordinates = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  // Callback al crearse un nuevo reporte
  const handleReportCreated = (newReport: any) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedLocation(null);
    api.getZonesRisk().then(setZones).catch(console.error);
  };

  // Conteo de reportes por severidad
  const highRiskCount = reports.filter((r) => r.ai_risk_level === 'Alto').length;

  // 1. Pantalla de carga mientras se verifica sesión local
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0a0a0b] text-slate-100">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-coral-500 via-coral-600 to-rose-800 text-white text-2xl shadow-lg shadow-rose-500/30 animate-bounce">
          🎭
        </div>
        <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-4">
          Iniciando CarnavalIA...
        </p>
      </div>
    );
  }

  // 2. Si NO existe sesión activa, renderizar ÚNICA Y EXCLUSIVAMENTE Login (bloqueo total de mapa, chat y modales)
  if (!isSessionActive) {
    return <LoginView />;
  }

  // 3. Una vez autenticado con sesión activa, renderizar la aplicación completa
  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0b] text-slate-100">
      {/* 0. Orbes de luz ambiental multicromáticos (Carnaval Vivo) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-coral-600/30 blur-[120px]" />
        <div className="absolute -top-24 -right-32 h-[32rem] w-[32rem] rounded-full bg-rose-500/25 blur-[130px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[38rem] w-[38rem] rounded-full bg-aqua-500/20 blur-[140px]" />
      </div>

      {/* 1. Barra de Navegación Superior Glassmorphic */}
      <Header
        activeView={reportsModalOpen ? 'reportes' : calendarOpen ? 'calendario' : activeView}
        onSelectSenda={() => {
          setActiveView('senda');
          setCalendarOpen(false);
          setReportsModalOpen(false);
          setShowSenda((prev) => !prev);
        }}
        onOpenCalendar={() => {
          setCalendarOpen(true);
          setReportsModalOpen(false);
        }}
        onOpenReports={() => {
          setReportsModalOpen(true);
          setCalendarOpen(false);
        }}
        onOpenReportModal={() => {
          setSelectedLocation(null);
          setReportModalOpen(true);
        }}
        reportsCount={reports.length}
      />

      {/* 2. Cuerpo Principal (Mapa de la Senda + Widgets flotantes) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Mapa Interactivo Leaflet con ErrorBoundary de protección */}
        <ErrorBoundary>
          <MapView
            pois={pois}
            reports={reports}
            zones={zones}
            onSelectCoordinates={handleSelectCoordinates}
            isSelectingLocation={reportModalOpen}
            selectedLocation={selectedLocation}
            currentCarnivalDay={currentCarnivalDay}
            selectedDay={currentCarnivalDay}
            onSelectDay={setCurrentCarnivalDay}
            onUserLocationChange={setUserGps}
            navRoute={navRoute}
            setNavRoute={setNavRoute}
            showSenda={showSenda}
            onToggleSenda={() => setShowSenda((prev) => !prev)}
            focusSendaTrigger={focusSendaTrigger}
            schedule={activeSchedule}
            nearbyPlaces={activeNearbyPlaces}
          />
        </ErrorBoundary>

        {/* Panel Superior Flotante: Métricas en Vivo */}
        <div className="absolute top-4 right-4 z-[900] flex flex-col sm:flex-row items-end sm:items-center gap-2 pointer-events-auto">
          {/* Badge de Alertas Críticas */}
          {highRiskCount > 0 && (
            <div
              onClick={() => setReportsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-500/20 backdrop-blur-md text-rose-300 text-xs font-bold border border-rose-500/40 shadow-sm animate-pulse cursor-pointer hover:bg-rose-500/30 transition"
              title="Ver alertas críticas"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{highRiskCount} Alerta{highRiskCount > 1 ? 's' : ''} Crítica{highRiskCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Tarjeta Cápsula de Resumen Rápido Glassmorphic */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl backdrop-blur-md bg-[#101012]/80 border border-rose-500/25 shadow-[0_0_20px_rgba(220,38,38,0.25)] text-xs text-slate-200">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-aqua-400" />
              <span><strong className="text-white font-bold">{pois.length}</strong> Puntos</span>
            </div>
            <span className="text-slate-500">•</span>
            <button
              type="button"
              onClick={() => setReportsModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-aqua-300 transition cursor-pointer"
              title="Abrir panel de reportes ciudadanos"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span><strong className="text-white font-bold">{reports.length}</strong> Reportes</span>
            </button>
            <span className="text-slate-500">•</span>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="text-slate-400 hover:text-white transition p-1 hover:bg-white/10 rounded-xl active:scale-95 cursor-pointer"
              title={`Actualizar datos (Última: ${lastUpdated.toLocaleTimeString()})`}
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-aqua-400' : 'hover:text-aqua-300'}`} />
            </button>
          </div>
        </div>

        {/* Prompt para Instalar PWA */}
        <InstallPwaPrompt />

        {/* Componente del Asistente GuaneñaBot (Chatbot UI Flotante con Gemini 2.5 Flash y Trazado de Rutas) */}
        <GuanenaChat onRouteReceived={handleRouteReceived} onFocusSenda={handleFocusSenda} />
      </main>

      {/* Modal para Registro de Reportes */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedLocation(null);
        }}
        initialCoordinates={selectedLocation || userGps}
        userGps={userGps}
        onReportCreated={handleReportCreated}
        onShowToast={showToast}
      />

      {/* Modal de Lista de Reportes Ciudadanos */}
      <CitizenReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        reports={reports}
        onOpenNewReport={() => {
          setSelectedLocation(null);
          setReportModalOpen(true);
        }}
      />

      {/* Modal de Calendario de Eventos */}
      <EventsCalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDay={currentCarnivalDay}
        onSelectDay={(day: string) => {
          setCurrentCarnivalDay(day);
          setActiveView('senda');
        }}
      />

      {/* Notificación Toast flotante */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default App;

