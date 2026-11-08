import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SENDA_OFICIAL_COORDS,
  CARNAVAL_DAYS_TRACKS,
  CARNAVAL_DAILY_TRACKS,
  SENDA_POINTS_OF_INTEREST,
} from '../data/carnavalRoutesGeoJSON';
import {
  calculateHaversineDistance,
  getWalkingRouteToSenda,
  getSnappedSendaRoute,
} from '../services/osrmRoutingService';

// Solución clásica de iconos rotos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hitos emblemáticos clave de la Senda del Carnaval
export const SENDA_EMBLEMATIC_LANDMARKS = [
  {
    id: 'partida-champagnat',
    name: 'Partida: Champagnat / Bolívar',
    type: 'partida',
    icon: '🚩',
    coords: [1.2055, -77.2798],
    badgeColor: '#10b981',
    description: 'Punto de partida oficial en Av. Champagnat con concentración de carrozas monumentales y colectivos.',
    role: 'Punto de Partida Oficial'
  },
  {
    id: 'hito-plaza-carnaval',
    name: 'Hito Central: Plaza del Carnaval y la Cultura',
    type: 'central',
    icon: '🎭',
    coords: [1.2138, -77.2782],
    badgeColor: '#f59e0b',
    description: 'Epicentro del Carnaval, tarima de jurados y graderías principales de transmisión.',
    role: 'Hito Central y Calificación'
  },
  {
    id: 'hito-plaza-narino',
    name: 'Hito Cívico: Plaza de Nariño',
    type: 'civico',
    icon: '🏛️',
    coords: [1.2168, -77.2805],
    badgeColor: '#3b82f6',
    description: 'Corazón histórico de Pasto, tarima cívica y paso multitudinario de agrupaciones.',
    role: 'Hito Cívico e Histórico'
  },
  {
    id: 'llegada-transparencia',
    name: 'Llegada / Desconcentración: Fuente de la Transparencia',
    type: 'llegada',
    icon: '🏁',
    coords: [1.2260, -77.2855],
    badgeColor: '#e11d48',
    description: 'Culminación del desfile oficial, zona de desconcentración y premiación en Av. de los Estudiantes.',
    role: 'Punto de Llegada y Desmonte'
  }
];

// Generador de iconos temáticos para los hitos emblemáticos
export function createEmblematicLandmarkIcon(landmark) {
  const bg = landmark.badgeColor || '#f59e0b';
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 50% 50% 50% 0;
        background: ${bg};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px ${bg}aa, 0 8px 16px rgba(0,0,0,0.6);
        transition: transform 0.2s ease;
      ">
        <div style="transform: rotate(45deg); font-size: 20px;">
          ${landmark.icon}
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: ${bg};
        font-family: sans-serif;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid ${bg};
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      ">
        ${landmark.name.split(':')[0]}
      </div>
    </div>
  `;
  return L.divIcon({
    className: `custom-emblematic-landmark-${landmark.id}`,
    html,
    iconSize: [44, 66],
    iconAnchor: [22, 66],
    popupAnchor: [0, -68],
  });
}

// Icono personalizado para el Punto de Partida (Salida)
export function createTerminalStartIcon() {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.75), 0 8px 16px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
          🚩
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #10b981;
        font-family: sans-serif;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #10b981;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        SALIDA OFICIAL
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-terminal-start-icon',
    html,
    iconSize: [42, 60],
    iconAnchor: [21, 60],
    popupAnchor: [0, -62],
  });
}

// Icono personalizado para el Punto de Culminación (Llegada)
export function createTerminalEndIcon() {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(225, 29, 72, 0.75), 0 8px 16px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
          🏁
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #fb7185;
        font-family: sans-serif;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #e11d48;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        META / LLEGADA
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-terminal-end-icon',
    html,
    iconSize: [42, 60],
    iconAnchor: [21, 60],
    popupAnchor: [0, -62],
  });
}

// Icono GPS en tiempo real para el espectador con anillo radar pulsante
export function createSpectatorGpsIcon() {
  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <!-- Anillo radar exterior pulsante -->
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.35);
        border: 2px solid #3b82f6;
        animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <!-- Punto azul central -->
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #2563eb;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.9), 0 2px 4px rgba(0,0,0,0.5);
      "></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-spectator-gps-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Icono personalizado para Puntos de Interés a lo largo de la Senda
export function createPoiIcon(poi) {
  const bg = poi.badgeColor || '#f59e0b';
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: ${bg};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px ${bg}88, 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">
          ${poi.icon || '📍'}
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    className: `custom-senda-poi-icon-${poi.id}`,
    html,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
  });
}

// Controlador de cámara para animar suavemente a los límites de la Senda seleccionada
function DynamicRouteCameraController({ routeCoords, focusTrigger }) {
  const map = useMap();
  useEffect(() => {
    if (map && routeCoords && routeCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
        });
      } catch (err) {
        console.warn('Error al ajustar límites de la ruta:', err);
      }
    }
  }, [map, routeCoords, focusTrigger]);
  return null;
}

// Puente para exponer la instancia activa del mapa a controles externos
function MapInstanceBridge({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
}

export const AVAILABLE_CARNAVAL_DAYS = [
  { id: '03-ene', label: '3 de Enero - Canto a la Tierra', short: '3 Ene • Canto a la Tierra', icon: '🌿' },
  { id: '04-ene', label: '4 de Enero - Familia Castañeda', short: '4 Ene • Flia Castañeda', icon: '👨‍👩‍👦' },
  { id: '05-ene', label: '5 de Enero - Día de Negros', short: '5 Ene • Día de Negros', icon: '🎨' },
  { id: '06-ene', label: '6 de Enero - Desfile Magno', short: '6 Ene • Desfile Magno', icon: '👑' },
];

export function CarnavalMap({
  selectedDay: propSelectedDay = null,
  onSelectDay,
  zones = [],
}) {
  // Estado inicial limpio y reactivo gobernado por GuaneñaBot (Chat-Driven UI)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSendaVisible, setIsSendaVisible] = useState(false);
  const [activeRouteCoords, setActiveRouteCoords] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showRiskZones, setShowRiskZones] = useState(false);
  const [currentDay, setCurrentDay] = useState(propSelectedDay || null);

  const activePoiCategory = activeCategory;
  const setActivePoiCategory = setActiveCategory;

  const [mapInstance, setMapInstance] = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  // Escucha de eventos Chat-to-Map desde GuaneñaBot
  useEffect(() => {
    const handleDrawSenda = (e) => {
      const detail = e?.detail;
      const dayKey = (typeof detail === 'object' ? (detail?.dayKey || detail?.dayId) : detail) || 'jan_06';
      const track = CARNAVAL_DAILY_TRACKS[dayKey] || CARNAVAL_DAYS_TRACKS[dayKey] || CARNAVAL_DAILY_TRACKS.jan_06;
      if (track) {
        setSelectedEvent(track);
        setIsSendaVisible(true);
        setActiveRouteCoords(track.coords || []);
        setCurrentDay(dayKey);
        if (mapInstance && track.coords) {
          const bounds = L.latLngBounds(track.coords);
          mapInstance.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      }
    };

    const handleFilterPois = (e) => {
      const detail = e?.detail;
      const category = typeof detail === 'object' ? (detail?.category || detail?.name) : detail;
      setActiveCategory(category || null);
    };

    const handleCleanMap = () => {
      setSelectedEvent(null);
      setIsSendaVisible(false);
      setActiveRouteCoords([]);
      setActiveCategory(null);
      setShowRiskZones(false);
      if (mapInstance) {
        mapInstance.flyTo([1.2168, -77.2805], 15, { duration: 1.2 });
      }
    };

    window.addEventListener('DRAW_SENDA', handleDrawSenda);
    window.addEventListener('FILTER_POIS', handleFilterPois);
    window.addEventListener('SHOW_ALL_CLEAN', handleCleanMap);

    return () => {
      window.removeEventListener('DRAW_SENDA', handleDrawSenda);
      window.removeEventListener('FILTER_POIS', handleFilterPois);
      window.removeEventListener('SHOW_ALL_CLEAN', handleCleanMap);
    };
  }, [mapInstance]);

  useEffect(() => {
    if (propSelectedDay) {
      setCurrentDay(propSelectedDay);
      const track = CARNAVAL_DAILY_TRACKS[propSelectedDay] || CARNAVAL_DAYS_TRACKS[propSelectedDay];
      if (track) {
        setSelectedEvent(track);
        setIsSendaVisible(true);
        setActiveRouteCoords(track.coords || []);
      }
    }
  }, [propSelectedDay]);

  const handleDaySelect = (dayId) => {
    setCurrentDay(dayId);
    const track = CARNAVAL_DAILY_TRACKS[dayId] || CARNAVAL_DAYS_TRACKS[dayId];
    if (track) {
      setSelectedEvent(track);
      setIsSendaVisible(true);
      setActiveRouteCoords(track.coords || []);
    } else {
      setSelectedEvent(null);
      setIsSendaVisible(false);
      setActiveRouteCoords([]);
    }
    if (onSelectDay) {
      onSelectDay(dayId);
    }
  };

  // Compatibilidad y enlaces directos
  const activeSendaTrack = selectedEvent;
  const setActiveSendaTrack = (track) => {
    setSelectedEvent(track);
    if (track) {
      setIsSendaVisible(true);
      setActiveRouteCoords(track.coords || []);
    } else {
      setIsSendaVisible(false);
      setActiveRouteCoords([]);
    }
  };
  const currentTrack = selectedEvent;
  const routeCoords = isSendaVisible ? activeRouteCoords : [];

  // Ajuste de cámara inteligente (Fit Bounds) para encuadrar la Senda completa
  const handleFitSendaBounds = useCallback(() => {
    const coordsToFit = activeRouteCoords.length > 0 ? activeRouteCoords : SENDA_OFICIAL_COORDS;
    if (!selectedEvent) {
      const defaultTrack = CARNAVAL_DAILY_TRACKS.jan_06;
      setSelectedEvent(defaultTrack);
      setIsSendaVisible(true);
      setActiveRouteCoords(defaultTrack.coords || []);
    }
    if (mapInstance && typeof mapInstance.fitBounds === 'function') {
      try {
        const bounds = L.latLngBounds(coordsToFit);
        mapInstance.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
        });
      } catch (err) {
        console.warn('Error al ajustar límites de la Senda:', err);
      }
    }
    setFocusTrigger((prev) => prev + 1);
  }, [mapInstance, selectedEvent, activeRouteCoords]);

  // Soporte para despachos directos de GuaneñaBot (focus-senda)
  useEffect(() => {
    const handleSendaEvent = () => {
      handleFitSendaBounds();
    };
    window.addEventListener('focus-senda', handleSendaEvent);
    return () => {
      window.removeEventListener('focus-senda', handleSendaEvent);
    };
  }, [handleFitSendaBounds]);

  // Puntos terminales: Salida y Llegada
  const startPoint = currentTrack?.startPoint;
  const endPoint = currentTrack?.endPoint;

  // Rastreo GPS en tiempo real del espectador con watchPosition
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        console.warn('Aviso de geolocalización espectador:', err?.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 2000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Cálculo de cercanía del espectador a la Senda en metros (umbral < 50m)
  const distanceToSendaMeters = React.useMemo(() => {
    if (!userPosition || !routeCoords || routeCoords.length === 0) return Infinity;
    let minD = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
      const [sLat, sLng] = routeCoords[i];
      const distKm = calculateHaversineDistance(userPosition.lat, userPosition.lng, sLat, sLng);
      const distMeters = distKm * 1000;
      if (distMeters < minD) {
        minD = distMeters;
      }
    }
    return minD;
  }, [userPosition, routeCoords]);

  const isNearSenda = distanceToSendaMeters <= 50;

  // Estado para la ruta peatonal calculada por OSRM
  const [walkingRoute, setWalkingRoute] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  const handleRouteToPoi = async (poi) => {
    setIsRouting(true);
    const startLat = userPosition ? userPosition.lat : 1.2138;
    const startLng = userPosition ? userPosition.lng : -77.2818;

    try {
      const result = await getWalkingRouteToSenda(startLat, startLng, poi.coords[0], poi.coords[1]);
      setWalkingRoute({
        coordinates: result.coordinates,
        targetName: poi.name,
        distanceMeters: result.distanceMeters,
        durationMinutes: result.durationMinutes,
      });
    } catch (err) {
      console.warn('Error calculando ruta a pie hacia POI:', err);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Badge en vivo si el usuario se encuentra a menos de 50 metros de la Senda */}
      {isNearSenda && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[950] animate-bounce px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 text-white font-black text-xs sm:text-sm shadow-2xl border-2 border-white/40 flex items-center gap-2 whitespace-nowrap">
          <span className="text-base">🎉</span>
          <span>¡Estás sobre la Senda del Carnaval! 🎉</span>
        </div>
      )}
      {/* Selector dinámico de trazado por día del evento (Glassmorphic) */}
      <div className="absolute top-4 left-4 z-[900] max-w-[95vw] sm:max-w-2xl bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {AVAILABLE_CARNAVAL_DAYS.map((day) => {
            const isSelected = Boolean(selectedEvent && (day.id === currentDay || selectedEvent?.id === day.id));
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDaySelect(day.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-lg font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={day.label}
              >
                <span>{day.icon}</span>
                <span className="hidden sm:inline">{day.label}</span>
                <span className="inline sm:hidden">{day.short}</span>
              </button>
            );
          })}
        </div>
        {/* Metadatos en vivo del día seleccionado */}
        {currentTrack && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 px-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400">{currentTrack.name}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">{currentTrack.lengthKm} km</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:inline font-mono">
              {currentTrack.direction}
            </span>
          </div>
        )}
      </div>

      {/* Botón flotante para encuadrar la Senda Completa (Champagnat a Fuente de la Transparencia) */}
      <button
        type="button"
        id="btn-ver-senda-completa"
        onClick={handleFitSendaBounds}
        className="absolute top-4 right-4 z-[900] flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 backdrop-blur-md cursor-pointer group"
        title="Encuadrar Senda Completa (Champagnat a Fuente de la Transparencia)"
      >
        <span className="text-base group-hover:rotate-12 transition-transform">🎭</span>
        <span className="font-extrabold tracking-wide uppercase">Senda</span>
      </button>

      <MapContainer
        center={[1.2168, -77.2805]}
        zoom={15}
        className="h-[calc(100vh-4rem)] w-full relative z-0"
        style={{ minHeight: '500px', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <MapInstanceBridge onMapReady={setMapInstance} />
        {activeSendaTrack && (
          <DynamicRouteCameraController
            routeCoords={activeSendaTrack.coords || SENDA_OFICIAL_COORDS}
            focusTrigger={focusTrigger}
          />
        )}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Capa de la Senda Oficial - Renderizado condicional reactivo bajo petición de GuaneñaBot */}
        {activeSendaTrack && (
          <>
            {/* 1. Capa vectorial principal oficial ceñida a la calzada vial */}
            <Polyline
              positions={activeSendaTrack.coords || SENDA_OFICIAL_COORDS}
              pathOptions={{
                color: '#e11d48',
                weight: 6,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
                className: 'drop-shadow-lg',
              }}
            />

            {/* Marcador contextual de Inicio oficial de la Senda activa */}
            {activeSendaTrack.startPoint && (
              <Marker
                position={activeSendaTrack.startPoint.coords}
                icon={createTerminalStartIcon()}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black border-b border-white/10 pb-1 mb-1">
                      <span>🚩</span>
                      <span className="uppercase text-[11px]">{activeSendaTrack.startPoint.name}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeSendaTrack.startPoint.description}
                    </p>
                    <div className="mt-1.5 text-[10px] text-emerald-300 font-mono">
                      {activeSendaTrack.name} • Partida
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcador contextual de Fin oficial de la Senda activa */}
            {activeSendaTrack.endPoint && (
              <Marker
                position={activeSendaTrack.endPoint.coords}
                icon={createTerminalEndIcon()}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                    <div className="flex items-center gap-1.5 text-rose-400 font-black border-b border-white/10 pb-1 mb-1">
                      <span>🏁</span>
                      <span className="uppercase text-[11px]">{activeSendaTrack.endPoint.name}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeSendaTrack.endPoint.description}
                    </p>
                    <div className="mt-1.5 text-[10px] text-rose-300 font-mono">
                      {activeSendaTrack.name} • Llegada y Desmonte
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcadores de hitos emblemáticos clave de la Senda */}
            {SENDA_EMBLEMATIC_LANDMARKS.map((landmark) => (
              <Marker
                key={landmark.id}
                position={landmark.coords}
                icon={createEmblematicLandmarkIcon(landmark)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[220px] max-w-[260px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                    <div
                      className="flex items-center gap-1.5 font-black border-b border-white/10 pb-1 mb-1"
                      style={{ color: landmark.badgeColor }}
                    >
                      <span className="text-base">{landmark.icon}</span>
                      <span className="uppercase text-[11px]">{landmark.name}</span>
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold mb-1">
                      {landmark.role}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {landmark.description}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between border-t border-white/10 pt-1">
                      <span>Lat: {landmark.coords[0].toFixed(4)}</span>
                      <span>Lng: {landmark.coords[1].toFixed(4)}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* 5. Rastreo GPS en tiempo real del espectador con punto azul y anillo radar */}
        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={Math.min(userPosition.accuracy || 25, 45)}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1.5,
              }}
            />
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={createSpectatorGpsIcon()}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center gap-1.5 text-blue-400 font-black border-b border-white/10 pb-1 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="uppercase">Tu ubicación GPS</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {isNearSenda
                      ? '¡Estás en plena fiesta sobre la Senda del Carnaval!'
                      : `Te encuentras a aprox. ${Math.round(distanceToSendaMeters)} m de la Senda.`}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between border-t border-white/10 pt-1">
                    <span>Lat: {userPosition.lat.toFixed(5)}</span>
                    <span>Lng: {userPosition.lng.toFixed(5)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Círculos de aglomeración / zonas de riesgo (activación reactiva bajo petición) */}
        {showRiskZones && zones && zones.map((zone) => {
          const lat = zone.latitude || zone.coords?.[0];
          const lng = zone.longitude || zone.coords?.[1];
          if (!lat || !lng) return null;
          const isHigh = zone.risk_level === 'Alto' || zone.level === 'Alto';
          return (
            <Circle
              key={`zone-${zone.id || `${lat}-${lng}`}`}
              center={[lat, lng]}
              radius={zone.radius || 90}
              pathOptions={{
                color: isHigh ? '#e11d48' : '#f59e0b',
                fillColor: isHigh ? '#e11d48' : '#f59e0b',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            >
              {zone.name && (
                <Popup className="custom-popup">
                  <div className="p-2 text-xs bg-slate-900 text-white rounded-lg">
                    <span className="font-bold">{zone.name}</span>
                    <p className="text-[11px] text-slate-300 mt-1">Zona de aglomeración monitoreada</p>
                  </div>
                </Popup>
              )}
            </Circle>
          );
        })}

        {/* Puntos de Interés interactivos - Visualización gobernada estrictamente por la categoría activa */}
        {activePoiCategory && SENDA_POINTS_OF_INTEREST
          .filter((poi) => activePoiCategory === 'todos' || poi.category === activePoiCategory)
          .map((poi) => (
            <Marker
              key={poi.id}
              position={poi.coords}
              icon={createPoiIcon(poi)}
            >
              <Popup className="custom-popup">
                <div className="p-2.5 min-w-[220px] max-w-[270px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold border-b border-white/10 pb-1 mb-1.5 text-amber-400">
                    <span className="text-base">{poi.icon}</span>
                    <span className="leading-tight">{poi.name}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                    {poi.description}
                  </p>
                  <div className="text-[10px] text-slate-400 mb-2 font-mono">
                    📍 {poi.address}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRouteToPoi(poi)}
                    disabled={isRouting}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <span>🚶‍♂️</span>
                    <span>{isRouting ? 'Calculando ruta...' : 'Cómo llegar a pie'}</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 7. Polilínea peatonal calculada por OSRM hacia el punto de interés */}
        {walkingRoute && walkingRoute.coordinates && walkingRoute.coordinates.length > 1 && (
          <Polyline
            positions={walkingRoute.coordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              dashArray: '8, 8',
              opacity: 0.95,
            }}
          />
        )}
      </MapContainer>

      {/* Banner flotante sutil del evento activo con opción de quitar ruta con un solo clic */}
      {activeSendaTrack && !walkingRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[950] max-w-[95vw] sm:max-w-lg bg-slate-950/92 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-base shadow-md shrink-0">
              🎭
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <span className="truncate">{activeSendaTrack.name}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                  {activeSendaTrack.lengthKm} km
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs">
                {activeSendaTrack.tagline || activeSendaTrack.direction}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSendaTrack(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 text-xs font-bold border border-white/10 hover:border-rose-500/40 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            title="Quitar ruta activa de la Senda"
          >
            <span>✕</span>
            <span>Quitar ruta</span>
          </button>
        </div>
      )}

      {/* Tarjeta flotante de navegación peatonal OSRM activa */}
      {walkingRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[950] max-w-[90vw] sm:max-w-md bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-blue-500/40 shadow-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 text-lg">
              🚶‍♂️
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight">
                Hacia: {walkingRoute.targetName}
              </div>
              <div className="text-[11px] text-blue-300 font-mono">
                {walkingRoute.distanceMeters} m • ~{walkingRoute.durationMinutes} min a pie
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWalkingRoute(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition text-xs font-bold"
            title="Cerrar ruta peatonal"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default CarnavalMap;
