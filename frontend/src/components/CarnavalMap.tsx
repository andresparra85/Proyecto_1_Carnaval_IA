import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet standard default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface NearbyPlace {
  name: string;
  category: 'restroom' | 'police' | 'health' | 'stage' | 'restaurant' | 'shopping' | 'risk_zone' | string;
  coordinates: [number, number];
  description?: string;
  schedule?: string;
  status?: string;
}

export interface CarnavalSchedule {
  start_time: string;
  estimated_arrival_time: string;
  start_location: string;
  finish_location: string;
  event_name?: string;
  distance_km?: number | string;
}

export interface CarnavalMapProps {
  routeCoordinates?: [number, number][];
  shouldDrawRoute?: boolean;
  routeTitle?: string;
  schedule?: CarnavalSchedule | null;
  nearbyPlaces?: NearbyPlace[];
  onRouteClear?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
  className?: string;
  pois?: any[];
  reports?: any[];
  zones?: any[];
  onSelectCoordinates?: (coords: { lat: number; lng: number }) => void;
}

// Centro neurálgico del Carnaval de Negros y Blancos: Plaza de Nariño, Pasto
const DEFAULT_CENTER: [number, number] = [1.2168, -77.2805];
const DEFAULT_ZOOM = 15;

// Generador de pin de inicio (bandera verde con destello)
export function createStartPinIcon(label: string = 'Punto de Salida') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 22px rgba(16, 185, 129, 0.85), 0 6px 12px rgba(0,0,0,0.6);
      ">
        <div style="transform: rotate(45deg); font-size: 19px;">
          🚩
        </div>
      </div>
      <div style="
        background: rgba(9, 13, 22, 0.95);
        color: #6ee7b7;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 12px;
        border: 1px solid rgba(16, 185, 129, 0.5);
        margin-top: 5px;
        white-space: nowrap;
        box-shadow: 0 3px 10px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-start-pin-marker',
    html,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -58],
  });
}

// Generador de pin de llegada (cuadriculado/antifaz festivo)
export function createEndPinIcon(label: string = 'Punto de Llegada') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 22px rgba(245, 158, 11, 0.85), 0 6px 12px rgba(0,0,0,0.6);
      ">
        <div style="transform: rotate(45deg); font-size: 19px;">
          🏁
        </div>
      </div>
      <div style="
        background: rgba(9, 13, 22, 0.95);
        color: #fde68a;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.5);
        margin-top: 5px;
        white-space: nowrap;
        box-shadow: 0 3px 10px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-end-pin-marker',
    html,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -58],
  });
}

// ---------------------------------------------------------------------------
// Iconos especializados para capas de telemetría urbana de GuaneñaBot
// ---------------------------------------------------------------------------

// 1. Restroom: Blue pin with 🚻 icon
export function createRestroomPinIcon(label: string = 'Baños') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 18px rgba(59, 130, 246, 0.8), 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 17px;">
          🚻
        </div>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #93c5fd;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(59, 130, 246, 0.45);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-restroom-marker',
    html,
    iconSize: [38, 54],
    iconAnchor: [19, 54],
    popupAnchor: [0, -56],
  });
}

// 2. Police: Navy shield with 👮 icon
export function createPolicePinIcon(label: string = 'CAI Policial') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 38px;
        height: 42px;
        clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);
        background: linear-gradient(145deg, #1e3a8a 0%, #0f172a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #60a5fa;
        box-shadow: 0 0 20px rgba(30, 58, 138, 0.8), 0 4px 10px rgba(0,0,0,0.6);
      ">
        <span style="font-size: 19px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">👮</span>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #93c5fd;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(96, 165, 250, 0.4);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-police-marker',
    html,
    iconSize: [40, 58],
    iconAnchor: [20, 58],
    popupAnchor: [0, -60],
  });
}

// 3. Health: Red cross / Emergency pin with 🚑 icon
export function createHealthPinIcon(label: string = 'Salud / Socorro') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 22px rgba(239, 68, 68, 0.85), 0 6px 12px rgba(0,0,0,0.6);
      ">
        <div style="transform: rotate(45deg); font-size: 19px;">
          🚑
        </div>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #fca5a5;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(239, 68, 68, 0.5);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-health-marker',
    html,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -58],
  });
}

// 4. Stage: Purple star with 🎪 icon
export function createStagePinIcon(label: string = 'Tarima Oficial') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 14px;
        background: linear-gradient(135deg, #a855f7 0%, #6b21a8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #f3e8ff;
        box-shadow: 0 0 22px rgba(168, 85, 247, 0.85), 0 6px 14px rgba(0,0,0,0.6);
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg); font-size: 19px;">
          🎪
        </div>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #d8b4fe;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(168, 85, 247, 0.5);
        margin-top: 6px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-stage-marker',
    html,
    iconSize: [42, 58],
    iconAnchor: [21, 58],
    popupAnchor: [0, -60],
  });
}

// 5. Risk Zone: Amber/Red pulsing hazard marker with ⚠️ icon
export function createRiskZonePinIcon(label: string = 'Zona de Aglomeración') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
      <span style="
        position: absolute;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.45);
        animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></span>
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.9), 0 4px 10px rgba(0,0,0,0.6);
      ">
        <span style="font-size: 18px;">⚠️</span>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #fca5a5;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.6);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-risk-zone-marker',
    html,
    iconSize: [46, 54],
    iconAnchor: [23, 27],
    popupAnchor: [0, -28],
  });
}

// 6. Shopping: Green bag with 🛍️ icon
export function createShoppingPinIcon(label: string = 'Comercio') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.8), 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 18px;">
          🛍️
        </div>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #6ee7b7;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(16, 185, 129, 0.5);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-shopping-marker',
    html,
    iconSize: [38, 54],
    iconAnchor: [19, 54],
    popupAnchor: [0, -56],
  });
}

// 7. Restaurant: Orange pin with 🍴 icon
export function createRestaurantPinIcon(label: string = 'Gastronomía') {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 18px rgba(249, 115, 22, 0.8), 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 18px;">
          🍴
        </div>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #fed7aa;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(249, 115, 22, 0.5);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'telemetry-restaurant-marker',
    html,
    iconSize: [38, 54],
    iconAnchor: [19, 54],
    popupAnchor: [0, -56],
  });
}

// Helper para seleccionar el icono adecuado según categoría
export function getNearbyPlaceIcon(category: string, name?: string) {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'restroom':
    case 'baño':
    case 'bano':
      return createRestroomPinIcon(name);
    case 'police':
    case 'policia':
    case 'cai':
    case 'seguridad':
      return createPolicePinIcon(name);
    case 'health':
    case 'salud':
    case 'medico':
    case 'hospital':
    case 'urgencias':
      return createHealthPinIcon(name);
    case 'stage':
    case 'tarima':
    case 'concierto':
      return createStagePinIcon(name);
    case 'shopping':
    case 'comercio':
    case 'tienda':
      return createShoppingPinIcon(name);
    case 'restaurant':
    case 'restaurante':
    case 'comida':
      return createRestaurantPinIcon(name);
    case 'risk_zone':
    case 'riesgo':
    case 'aglomeracion':
      return createRiskZonePinIcon(name);
    default:
      return createShoppingPinIcon(name);
  }
}

// Controlador de cámara para auto-ajustar los límites (fitBounds) al recibir una polilínea
function RouteBoundsAutoFitter({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  const prevCoordCountRef = useRef<number>(0);

  useEffect(() => {
    if (!map || !Array.isArray(coordinates) || coordinates.length < 2) return;

    // Evitar zoom redundante si los puntos no cambiaron
    if (prevCoordCountRef.current === coordinates.length) return;
    prevCoordCountRef.current = coordinates.length;

    try {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
      });
    } catch (err) {
      console.warn('[CarnavalMap] Error while fitting bounds:', err);
    }
  }, [coordinates, map]);

  return null;
}

// Selector de clics sobre el mapa para registrar incidentes o puntos
function MapClickHandler({ onSelectCoordinates }: { onSelectCoordinates?: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onSelectCoordinates) {
        onSelectCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export const CarnavalMap: React.FC<CarnavalMapProps> = ({
  routeCoordinates: propRouteCoordinates,
  shouldDrawRoute: propShouldDrawRoute,
  routeTitle: propRouteTitle,
  onRouteClear,
  userLocation,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = 'w-full h-full min-h-[500px]',
  pois = [],
  reports = [],
  zones = [],
  onSelectCoordinates,
}) => {
  // Estado interno para las coordenadas activas de la ruta
  const [activeRouteCoordinates, setActiveRouteCoordinates] = useState<[number, number][]>(
    propRouteCoordinates || []
  );
  const [isRouteActive, setIsRouteActive] = useState<boolean>(
    Boolean(propShouldDrawRoute && propRouteCoordinates && propRouteCoordinates.length >= 2)
  );
  const [activeTitle, setActiveTitle] = useState<string>(propRouteTitle || 'Recorrido del Carnaval');

  // Sincronizar cambios en props
  useEffect(() => {
    if (propRouteCoordinates && propRouteCoordinates.length >= 2 && propShouldDrawRoute) {
      setActiveRouteCoordinates(propRouteCoordinates);
      setIsRouteActive(true);
      if (propRouteTitle) setActiveTitle(propRouteTitle);
    } else if (propShouldDrawRoute === false) {
      setIsRouteActive(false);
      setActiveRouteCoordinates([]);
    }
  }, [propRouteCoordinates, propShouldDrawRoute, propRouteTitle]);

  // Escucha de eventos globales desacoplados (Chat-to-Map y Gemini Route Dispatcher)
  useEffect(() => {
    const handleDrawGeminiRoute = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;

      const rawWaypoints = detail.waypoints || detail.coordinates || [];
      const shouldDraw = detail.should_draw_route !== false && rawWaypoints.length >= 2;

      if (shouldDraw) {
        // Limpia cualquier ruta previa e inyecta las nuevas coordenadas
        setActiveRouteCoordinates(rawWaypoints);
        setIsRouteActive(true);
        if (detail.title || detail.reply) {
          setActiveTitle(detail.title || 'Ruta generada por GuaneñaBot');
        }
      }
    };

    const handleClearRoute = () => {
      setActiveRouteCoordinates([]);
      setIsRouteActive(false);
      if (onRouteClear) onRouteClear();
    };

    window.addEventListener('DRAW_GEMINI_ROUTE', handleDrawGeminiRoute);
    window.addEventListener('CLEAR_MAP_ROUTE', handleClearRoute);
    window.addEventListener('route-to-poi', handleDrawGeminiRoute);

    return () => {
      window.removeEventListener('DRAW_GEMINI_ROUTE', handleDrawGeminiRoute);
      window.removeEventListener('CLEAR_MAP_ROUTE', handleClearRoute);
      window.removeEventListener('route-to-poi', handleDrawGeminiRoute);
    };
  }, [onRouteClear]);

  const handleClearActiveRoute = useCallback(() => {
    setActiveRouteCoordinates([]);
    setIsRouteActive(false);
    if (onRouteClear) onRouteClear();
  }, [onRouteClear]);

  const startCoord = isRouteActive && activeRouteCoordinates.length >= 2 ? activeRouteCoordinates[0] : null;
  const endCoord = isRouteActive && activeRouteCoordinates.length >= 2 ? activeRouteCoordinates[activeRouteCoordinates.length - 1] : null;

  return (
    <div className={`relative ${className} select-none`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • CarnavalIA'
        />

        {/* Captura de eventos de clic */}
        <MapClickHandler onSelectCoordinates={onSelectCoordinates} />

        {/* Auto-zoom y ajuste suave a los límites de la polilínea activa */}
        {isRouteActive && activeRouteCoordinates.length >= 2 && (
          <RouteBoundsAutoFitter coordinates={activeRouteCoordinates} />
        )}

        {/* Polilínea trazada dinámicamente con color oro carnaval (#f59e0b) */}
        {isRouteActive && activeRouteCoordinates.length >= 2 && (
          <>
            {/* Capa de resplandor o sombra exterior */}
            <Polyline
              key={`glow-route-${activeRouteCoordinates.length}`}
              positions={activeRouteCoordinates}
              pathOptions={{
                color: '#f59e0b',
                weight: 12,
                opacity: 0.25,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Polilínea vibrante principal con patrón segmentado animado */}
            <Polyline
              key={`main-route-${activeRouteCoordinates.length}`}
              positions={activeRouteCoordinates}
              pathOptions={{
                color: '#f59e0b',
                weight: 6,
                opacity: 0.85,
                dashArray: '10, 10',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Marcador de Inicio (Bandera verde) */}
            {startCoord && (
              <Marker position={startCoord} icon={createStartPinIcon('Salida Oficial')}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[190px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 border-b border-white/10 pb-1 mb-1">
                      <span>🚩</span>
                      <span className="uppercase text-[11px]">Punto de Partida</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Inicio del recorrido oficial del Carnaval de Negros y Blancos.
                    </p>
                    <div className="mt-1.5 text-[10px] text-emerald-300 font-mono">
                      Lat: {startCoord[0].toFixed(4)}, Lng: {startCoord[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcador de Llegada (Bandera cuadros / fiesta) */}
            {endCoord && (
              <Marker position={endCoord} icon={createEndPinIcon('Llegada Oficial')}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[190px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400 border-b border-white/10 pb-1 mb-1">
                      <span>🏁</span>
                      <span className="uppercase text-[11px]">Punto de Culminación</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Llegada y desconcentración de agrupaciones y carrozas.
                    </p>
                    <div className="mt-1.5 text-[10px] text-amber-300 font-mono">
                      Lat: {endCoord[0].toFixed(4)}, Lng: {endCoord[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Marcador GPS del usuario */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={35}
              pathOptions={{
                color: '#38bdf8',
                fillColor: '#0284c7',
                fillOpacity: 0.2,
                weight: 1.5,
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-gps-dot',
                html: `
                  <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">
                    <span style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background: #38bdf8; opacity: 0.6; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
                    <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 10px #38bdf8;"></span>
                  </div>
                `,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              })}
            >
              <Popup>
                <div className="text-xs font-sans p-1">
                  <strong className="text-sky-400 block font-bold">📍 Tu ubicación actual</strong>
                  <span className="text-slate-600 text-[11px]">Turista en San Juan de Pasto</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Tarjeta HUD flotante inferior con indicador de ruta y botón para quitar trazado */}
      {isRouteActive && activeRouteCoordinates.length >= 2 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[950] w-[92vw] sm:max-w-md rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-amber-950/50 px-4 py-3 flex items-center justify-between gap-3 text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-lg shadow-lg shadow-amber-500/30 shrink-0">
              🎭
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Trazado Dinámico • GuaneñaBot
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {activeTitle}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {activeRouteCoordinates.length} waypoints sobre la malla vial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearActiveRoute}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-bold border border-white/10 hover:border-rose-400/50 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            title="Quitar ruta del mapa"
          >
            <span>✕</span>
            <span>Quitar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CarnavalMap;

