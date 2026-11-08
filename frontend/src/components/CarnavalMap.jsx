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
import { SENDA_OFICIAL_COORDS } from '../data/sendaOficialTrack.js';
import {
  CARNAVAL_DAYS_TRACKS,
  CARNAVAL_DAILY_TRACKS,
  SENDA_POINTS_OF_INTEREST,
} from '../data/carnavalRoutesGeoJSON';
import {
  calculateHaversineDistance,
  getWalkingRouteToSenda,
  fetchFootRoute,
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

// Icono personalizado para el destino de la navegación peatonal dinámica de GuaneñaBot
export function createDestinationFlagIcon(name = 'Destino') {
  const shortName = (name || 'Destino').split(':')[0];
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.85), 0 6px 14px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 18px; color: white;">
          🏁
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #22d3ee;
        font-family: sans-serif;
        font-weight: 800;
        font-size: 9px;
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid #06b6d4;
        margin-top: 3px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      ">
        ${shortName}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-destination-flag-icon',
    html,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -58],
  });
}

// Tarjeta flotante interactiva de Evento Oficial (EventCard / EventOverlayCard)
export function EventCard({ event, onClose }) {
  if (!event) return null;
  const eventName = event?.name || '';
  const eventLengthKm = event?.lengthKm || 0;
  const eventDirection = event?.tagline || event?.direction || '';

  return (
    <div className="absolute bottom-6 left-4 z-[950] max-w-[95vw] sm:max-w-md bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl flex items-center justify-between gap-4 text-slate-800 dark:text-white">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-base shadow-md shrink-0">
          🎭
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
              Evento Oficial
            </span>
            {event?.hours && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.2 rounded-md">
                {event.hours}
              </span>
            )}
            {eventLengthKm > 0 && (
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                {eventLengthKm} km
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
            {eventName}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs">
            {eventDirection}
          </p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-400 text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-rose-500/30 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          title="Cerrar tarjeta de evento"
        >
          <span>✕</span>
          <span>Quitar</span>
        </button>
      )}
    </div>
  );
}

export const EventOverlayCard = ({ event, onClose }) => {
  if (!event) return null;
  return <EventCard event={event} onClose={onClose} />;
};

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
  const [showSendaDetails, setShowSendaDetails] = useState(false);
  const [isSendaActive, setIsSendaActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeRouteCoords, setActiveRouteCoords] = useState([]);
  const [activeCategory, setActiveCategory] = useState('none');
  const [showRiskZones, setShowRiskZones] = useState(false);
  const [currentDay, setCurrentDay] = useState(propSelectedDay || null);
  const [userPosition, setUserPosition] = useState(null);

  // Estados dinámicos de navegación peatonal (GuaneñaBot Chat-Driven UI)
  const [activeNavRoute, setActiveNavRoute] = useState(null); // [lat, lng][]
  const [navDestinationInfo, setNavDestinationInfo] = useState(null); // { name, eta, distance, coords }

  // Aliases de compatibilidad
  const isSendaVisible = isSendaActive;
  const setIsSendaVisible = setIsSendaActive;
  const showSenda = isSendaActive;
  const setShowSenda = setIsSendaActive;

  const selectedEvent = activeEvent;
  const setSelectedEvent = setActiveEvent;

  const activePoiCategory = activeCategory;
  const setActivePoiCategory = setActiveCategory;

  const [mapInstance, setMapInstance] = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  // Disparador de navegación dinámica peatonal OSRM
  const handleTriggerNavigation = useCallback(async (targetCoords, targetName = 'Destino', originCoords = null) => {
    if (!targetCoords) return;
    const origin = originCoords || (userPosition ? [userPosition.lat, userPosition.lng] : [1.2168, -77.2805]);
    try {
      const res = await fetchFootRoute(origin, targetCoords);
      if (res && res.coordinates && res.coordinates.length > 0) {
        setActiveNavRoute(res.coordinates);
        setNavDestinationInfo({
          name: targetName,
          eta: res.durationMinutes || 1,
          distance: res.distanceMeters || 0,
          coords: targetCoords,
        });
        if (mapInstance && typeof mapInstance.fitBounds === 'function') {
          const bounds = L.latLngBounds([origin, targetCoords, ...(res.coordinates || [])]);
          mapInstance.fitBounds(bounds, { padding: [60, 60], animate: true });
        }
      }
    } catch (err) {
      console.warn('Error al activar navegación dinámica peatonal:', err);
    }
  }, [userPosition, mapInstance]);

  // Escucha de eventos Chat-to-Map desde GuaneñaBot
  useEffect(() => {
    const handleDrawSenda = (e) => {
      const detail = e?.detail;
      const rawDayKey = (typeof detail === 'object' ? (detail?.dayKey || detail?.dayId || detail?.name) : detail) || 'jan_06';
      const dayKey = (rawDayKey || '').toLowerCase();
      const track = CARNAVAL_DAILY_TRACKS[dayKey] ||
        CARNAVAL_DAYS_TRACKS[dayKey] ||
        Object.values(CARNAVAL_DAILY_TRACKS).find((t) =>
          (t.id || '').toLowerCase() === dayKey ||
          (t.name || '').toLowerCase().includes(dayKey)
        ) ||
        CARNAVAL_DAILY_TRACKS.jan_06;
      if (track) {
        setActiveEvent(track);
        setIsSendaActive(true);
        setActiveRouteCoords(track.coords || []);
        setCurrentDay(track.id || dayKey);
        if (mapInstance && track.coords) {
          const bounds = L.latLngBounds(track.coords);
          mapInstance.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      }
    };

    const handleFilterPois = (e) => {
      const detail = e?.detail;
      const category = typeof detail === 'object' ? (detail?.category || detail?.name) : detail;
      setActiveCategory(category || 'none');
    };

    const handleCleanMap = () => {
      setActiveEvent(null);
      setIsSendaActive(false);
      setShowSendaDetails(false);
      setActiveRouteCoords([]);
      setActiveCategory('none');
      setShowRiskZones(false);
      setActiveNavRoute(null);
      setNavDestinationInfo(null);
      if (mapInstance) {
        mapInstance.flyTo([1.2168, -77.2805], 15, { duration: 1.2 });
      }
    };

    const handleTriggerNavEvent = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetCoords = detail.targetCoords || detail.target_coords || detail.coords;
      const targetName = detail.targetName || detail.target_name || detail.name || 'Destino';
      const originCoords = detail.originCoords || detail.origin_coords || null;
      handleTriggerNavigation(targetCoords, targetName, originCoords);
    };

    window.addEventListener('DRAW_SENDA', handleDrawSenda);
    window.addEventListener('FILTER_POIS', handleFilterPois);
    window.addEventListener('SHOW_ALL_CLEAN', handleCleanMap);
    window.addEventListener('TRIGGER_NAVIGATION', handleTriggerNavEvent);
    window.addEventListener('ROUTE_TO_DESTINATION', handleTriggerNavEvent);
    window.addEventListener('DRAW_ROUTE', handleTriggerNavEvent);
    window.addEventListener('ROUTE_TO_EVENT_START', handleTriggerNavEvent);

    return () => {
      window.removeEventListener('DRAW_SENDA', handleDrawSenda);
      window.removeEventListener('FILTER_POIS', handleFilterPois);
      window.removeEventListener('SHOW_ALL_CLEAN', handleCleanMap);
      window.removeEventListener('TRIGGER_NAVIGATION', handleTriggerNavEvent);
      window.removeEventListener('ROUTE_TO_DESTINATION', handleTriggerNavEvent);
      window.removeEventListener('DRAW_ROUTE', handleTriggerNavEvent);
      window.removeEventListener('ROUTE_TO_EVENT_START', handleTriggerNavEvent);
    };
  }, [mapInstance, handleTriggerNavigation]);

  useEffect(() => {
    if (propSelectedDay) {
      setCurrentDay(propSelectedDay);
      const track = CARNAVAL_DAILY_TRACKS[propSelectedDay] || CARNAVAL_DAYS_TRACKS[propSelectedDay];
      if (track) {
        setActiveEvent(track);
        setIsSendaActive(true);
        setActiveRouteCoords(track.coords || []);
      }
    }
  }, [propSelectedDay]);

  const handleDaySelect = (dayId) => {
    if (!dayId) {
      setActiveEvent(null);
      setIsSendaActive(false);
      setActiveRouteCoords([]);
      setCurrentDay(null);
      return;
    }
    setCurrentDay(dayId);
    const normDayId = (dayId || '').toLowerCase();
    const track = CARNAVAL_DAILY_TRACKS[dayId] ||
      CARNAVAL_DAYS_TRACKS[dayId] ||
      Object.values(CARNAVAL_DAILY_TRACKS).find((t) =>
        (t.id || '').toLowerCase() === normDayId ||
        (t.name || '').toLowerCase().includes(normDayId)
      ) ||
      null;
    if (track) {
      setActiveEvent(track);
      setIsSendaActive(true);
      setActiveRouteCoords(track.coords || []);
    } else {
      setActiveEvent(null);
      setIsSendaActive(false);
      setActiveRouteCoords([]);
    }
    if (onSelectDay) {
      onSelectDay(dayId);
    }
  };

  // Compatibilidad y enlaces directos
  const activeSendaTrack = activeEvent;
  const setActiveSendaTrack = (track) => {
    setActiveEvent(track);
    if (track) {
      setIsSendaActive(true);
      setActiveRouteCoords(track.coords || []);
    } else {
      setIsSendaActive(false);
      setActiveRouteCoords([]);
    }
  };
  const currentTrack = activeEvent;
  const routeCoords = isSendaActive ? activeRouteCoords : [];

  // Toggle interactivo para el botón 'Senda del Carnaval' con ajuste dinámico de cámara
  const handleToggleSenda = useCallback(() => {
    setShowSendaDetails((prev) => !prev);
    setIsSendaActive((prev) => {
      const nextState = !prev;
      if (nextState) {
        if (!activeEvent) {
          setActiveEvent(CARNAVAL_DAILY_TRACKS.jan_06);
          setActiveRouteCoords(SENDA_OFICIAL_COORDS);
        }
        if (mapInstance && typeof mapInstance.fitBounds === 'function') {
          try {
            mapInstance.fitBounds(SENDA_OFICIAL_COORDS, { padding: [40, 40] });
          } catch (err) {
            console.warn('Error al ajustar límites de la Senda:', err);
          }
        }
      } else {
        setActiveEvent(null);
        setActiveRouteCoords([]);
        if (mapInstance && typeof mapInstance.flyTo === 'function') {
          mapInstance.flyTo([1.2168, -77.2805], 15, { duration: 1.2 });
        }
      }
      return nextState;
    });
    setFocusTrigger((prev) => prev + 1);
  }, [mapInstance, activeEvent]);

  // Ajuste de cámara inteligente (Fit Bounds) para encuadrar la Senda completa
  const handleFitSendaBounds = useCallback(() => {
    handleToggleSenda();
  }, [handleToggleSenda]);

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

  // Filtrado reactivo y protegido contra nulos de Puntos de Interés (POIs)
  const filteredPois = React.useMemo(() => {
    if (!activeCategory || activeCategory === 'none' || activeCategory === null) {
      return [];
    }
    if (activeCategory === 'all' || activeCategory === 'todos') {
      return SENDA_POINTS_OF_INTEREST;
    }
    return SENDA_POINTS_OF_INTEREST.filter((poi) =>
      activeCategory && poi.category
        ? poi.category.toLowerCase() === activeCategory.toLowerCase()
        : false
    );
  }, [activeCategory]);

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
      {/* 1. Contenedor Superior Fijo: Banner de Evento Activo y Chips de Controles */}
      <div className="absolute top-4 left-4 right-4 z-[900] flex flex-col gap-2 pointer-events-none max-w-2xl">
        {/* Banner Superior Dinámico de Evento Oficial controlado por GuaneñaBot */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm text-xs w-fit max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${activeEvent ? 'bg-amber-500' : 'bg-slate-500'}`}
            />
            <div className="truncate text-slate-600 dark:text-slate-300">
              <span className="hidden sm:inline text-slate-400">Evento Activo: </span>
              <strong className="font-bold text-slate-900 dark:text-white">
                {activeEvent ? (activeEvent.name || 'Ninguno') : 'Ninguno'}
              </strong>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-500 dark:text-amber-400">
            🎭 GuaneñaBot AI
          </span>
        </div>

        {/* Barra de Controles y Selector Dinámico de Días */}
        <div className="pointer-events-auto flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar py-0.5">
          {/* Botón directo de activación / desactivación de la Senda del Carnaval */}
          <button
            type="button"
            id="btn-senda-carnaval-toggle"
            onClick={handleToggleSenda}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer backdrop-blur-sm ${
              isSendaActive
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md ring-2 ring-amber-400/50'
                : 'bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isSendaActive ? 'Ocultar Senda del Carnaval' : 'Mostrar Senda del Carnaval'}
          >
            <span className="text-sm">🎭</span>
            <span>Senda del Carnaval</span>
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                isSendaActive ? 'bg-white shadow-sm' : 'bg-slate-400'
              }`}
            />
          </button>

          {AVAILABLE_CARNAVAL_DAYS.map((day) => {
            const isSelected = Boolean(
              activeEvent && (
                (day.id || '').toLowerCase() === (currentDay || '').toLowerCase() ||
                (day.id || '').toLowerCase() === (activeEvent?.id || '').toLowerCase() ||
                (day.label || '').toLowerCase().includes((activeEvent?.name || '').toLowerCase())
              )
            );
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDaySelect(day.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-lg font-black'
                    : 'bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
        {activeEvent && (
          <div className="pointer-events-auto mt-0.5 py-1 px-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px] text-slate-300 w-fit">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400">{activeEvent?.name || ''}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">{activeEvent?.lengthKm || 0} km</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:inline font-mono ml-3">
              {activeEvent?.direction || ''}
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
        className="w-full h-full min-h-[500px] relative z-0"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <MapInstanceBridge onMapReady={setMapInstance} />
        {Array.isArray(activeRouteCoords) && activeRouteCoords.length > 0 && isSendaVisible && (
          <DynamicRouteCameraController
            routeCoords={activeRouteCoords}
            focusTrigger={focusTrigger}
          />
        )}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="w-full h-full"
        />

        {/* Capa de la Senda Oficial - Renderizado condicional reactivo bajo petición de GuaneñaBot */}
        {isSendaActive && (
          <Polyline
            positions={SENDA_OFICIAL_COORDS}
            pathOptions={{
              color: '#e11d48',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Marcadores de terminales (Inicio/Fin), hitos y cierres viales encapsulados bajo showSendaDetails e isSendaActive */}
        {showSendaDetails && isSendaActive && (
          <>
            {/* Marcador contextual de Inicio oficial de la Senda activa (Verde) */}
            <Marker
              position={SENDA_OFICIAL_COORDS[0]}
              icon={createTerminalStartIcon()}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-black border-b border-white/10 pb-1 mb-1">
                    <span>🚩</span>
                    <span className="uppercase text-[11px]">
                      {activeEvent?.startPoint?.name || 'Partida: Champagnat / Bolívar'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeEvent?.startPoint?.description || 'Punto de partida oficial en Av. Champagnat con concentración de carrozas monumentales y colectivos.'}
                  </p>
                  <div className="mt-1.5 text-[10px] text-emerald-300 font-mono">
                    {activeEvent?.name || 'Senda del Carnaval'} • Partida
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Marcador contextual de Fin oficial de la Senda activa (Rojo) */}
            <Marker
              position={SENDA_OFICIAL_COORDS[SENDA_OFICIAL_COORDS.length - 1]}
              icon={createTerminalEndIcon()}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center gap-1.5 text-rose-400 font-black border-b border-white/10 pb-1 mb-1">
                    <span>🏁</span>
                    <span className="uppercase text-[11px]">
                      {activeEvent?.endPoint?.name || 'Llegada: Fuente de la Transparencia'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeEvent?.endPoint?.description || 'Culminación del desfile oficial, zona de desconcentración y desmonte en Av. de los Estudiantes.'}
                  </p>
                  <div className="mt-1.5 text-[10px] text-rose-300 font-mono">
                    {activeEvent?.name || 'Senda del Carnaval'} • Llegada y Desmonte
                  </div>
                </div>
              </Popup>
            </Marker>

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

        {/* Círculos de cierres viales / zonas de riesgo (solo si isSendaActive está encendido) */}
        {isSendaActive && showRiskZones && zones && zones.map((zone) => {
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
        {filteredPois.map((poi) => (
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

        {/* 8. Ruta peatonal guiada dinámica de GuaneñaBot (Línea punteada cian animada) */}
        {activeNavRoute && activeNavRoute.length > 0 && (
          <>
            <Polyline
              positions={activeNavRoute}
              pathOptions={{
                color: '#06b6d4',
                weight: 6,
                dashArray: '8, 8',
                lineCap: 'round',
                opacity: 0.95,
              }}
            />
            {navDestinationInfo?.coords && (
              <Marker
                position={navDestinationInfo.coords}
                icon={createDestinationFlagIcon(navDestinationInfo.name)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px] bg-slate-900 text-white rounded-xl text-xs font-sans">
                    <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                      <span>🏁</span>
                      <span>{navDestinationInfo.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {navDestinationInfo.distance ? `${navDestinationInfo.distance} m` : ''} • ~{navDestinationInfo.eta || 1} min a pie
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>

      {/* Tarjeta flotante inferior de Evento Oficial desmontada al inicio si !activeEvent */}
      {activeEvent && !walkingRoute && !activeNavRoute && (
        <EventCard
          event={activeEvent}
          onClose={() => {
            setActiveEvent(null);
            setIsSendaActive(false);
            setActiveRouteCoords([]);
          }}
        />
      )}

      {/* Floating HUD navigation banner con ETA y dismissal de ruta activa */}
      {activeNavRoute && navDestinationInfo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[950] w-[92vw] max-w-lg bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-cyan-500/50 shadow-2xl shadow-cyan-950/40 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shrink-0">
              🚶‍♂️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  Ruta Peatonal Activa • OSRM
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                Ruta hacia: {navDestinationInfo.name}
              </h4>
              <p className="text-[11px] text-cyan-200 font-mono mt-0.5">
                {navDestinationInfo.distance ? `${navDestinationInfo.distance} m` : ''} • ~{navDestinationInfo.eta || 1} min a pie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveNavRoute(null);
              setNavDestinationInfo(null);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-rose-500/30 text-cyan-300 hover:text-rose-300 text-xs font-bold border border-cyan-400/40 hover:border-rose-400/50 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            title="Finalizar y cerrar ruta"
          >
            <span>✕</span>
            <span>Finalizar Ruta</span>
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
