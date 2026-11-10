import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/layout/Navbar';
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
import { RefreshCw, ShieldAlert, MapPin, Crosshair } from 'lucide-react';
import { useRealtimeLocation } from './hooks/useRealtimeLocation';

export function App() {
  const { isAuthenticated, loading: authLoading, loginAsGuest } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Acceso directo a la Senda y Telemetría GIS para todos los visitantes (modo Turista sin barreras)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('carnavalia_session')) {
        localStorage.setItem('carnavalia_session', 'active');
        if (loginAsGuest) loginAsGuest();
      }
    } catch (e) {
      console.warn('Error inicializando sesión de turista:', e);
    }
  }, [loginAsGuest]);

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
  const { centerOnMe, location: realtimeLocation } = useRealtimeLocation();
  const [userGps, setUserGps] = useState<any>(null);
  const userGpsRef = useRef<any>(null);
  useEffect(() => {
    userGpsRef.current = userGps;
  }, [userGps]);

  useEffect(() => {
    if (realtimeLocation) {
      setUserGps(realtimeLocation);
    }
  }, [realtimeLocation]);

  const [navRoute, setNavRoute] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Estado para la capa y foco de la Senda del Carnaval (activa por defecto con resplandor Neón)
  const [showSenda, setShowSenda] = useState(true);
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
    if (activeRouteCoordinates && activeRouteCoordinates.length >= 2) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('FOCUS_MAP_BOUNDS', {
            detail: { coordinates: activeRouteCoordinates },
          })
        );
      }
    }
  }, [activeRouteCoordinates]);

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
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#07090e] text-slate-100">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-400 text-white text-2xl shadow-lg shadow-rose-500/40 animate-bounce">
          🎭
        </div>
        <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-4">
          Iniciando CarnavalIA • Pasto GIS...
        </p>
      </div>
    );
  }

  // 2. Renderizado de la aplicación completa con acceso público inmediato para visitantes y turistas
  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100">
      {/* 0. Orbes de luz ambiental multicromáticos (Carnaval Vivo) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-rose-600/25 blur-[120px]" />
        <div className="absolute -top-24 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[38rem] w-[38rem] rounded-full bg-amber-500/15 blur-[140px]" />
      </div>

      {/* 1. Barra de Navegación Superior Flotante Glassmorphic (Stitch Style) */}
      <Navbar
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
        onOpenAuth={() => setAuthModalOpen(true)}
        reportsCount={reports.length}
        poisCount={pois.length || 18}
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

        {/* Prompt para Instalar PWA */}
        <InstallPwaPrompt />

        {/* Botón flotante "Centrar en mi ubicación" (Crosshair) */}
        <button
          type="button"
          onClick={() => centerOnMe()}
          className="absolute bottom-6 left-4 z-[900] flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 hover:border-sky-400 text-sky-400 hover:text-sky-300 font-bold text-xs shadow-2xl shadow-black/80 transition-all duration-200 active:scale-95 cursor-pointer group"
          title="Centrar mapa en mi ubicación GPS en tiempo real"
          aria-label="Centrar en mi ubicación"
        >
          <Crosshair className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
          <span className="hidden sm:inline font-semibold">Centrar en mi ubicación</span>
        </button>

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

      {/* Modal de Autenticación / Registro Flotante (Stitch Glass HUD) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md">
            <LoginView
              onClose={() => setAuthModalOpen(false)}
              onLoginSuccess={() => setAuthModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

