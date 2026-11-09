import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  LayerGroup,
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
  address?: string;
  reference?: string;
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

// Helper para obtener el emoji característico de cada categoría
export function getCategoryEmoji(category: string): string {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'restroom':
    case 'baño':
    case 'bano':
      return '🚻';
    case 'police':
    case 'policia':
    case 'cai':
    case 'seguridad':
      return '👮';
    case 'health':
    case 'salud':
    case 'medico':
    case 'hospital':
    case 'urgencias':
      return '🚑';
    case 'stage':
    case 'tarima':
    case 'concierto':
      return '🎪';
    case 'shopping':
    case 'comercio':
    case 'tienda':
      return '🛍️';
    case 'restaurant':
    case 'restaurante':
    case 'comida':
      return '🍴';
    case 'risk_zone':
    case 'riesgo':
    case 'aglomeracion':
      return '⚠️';
    default:
      return '📍';
  }
}

// Helper para títulos legibles de categoría
export function formatCategoryTitle(category: string): string {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'restroom':
    case 'baño':
    case 'bano':
      return 'Batería Sanitaria';
    case 'police':
    case 'policia':
    case 'cai':
    case 'seguridad':
      return 'Seguridad y Convivencia (CAI)';
    case 'health':
    case 'salud':
    case 'medico':
    case 'hospital':
    case 'urgencias':
      return 'Primeros Auxilios y Salud';
    case 'stage':
    case 'tarima':
    case 'concierto':
      return 'Tarima Cultural y de Conciertos';
    case 'shopping':
    case 'comercio':
    case 'tienda':
      return 'Comercio y Abastecimiento';
    case 'restaurant':
    case 'restaurante':
    case 'comida':
      return 'Gastronomía Típica';
    case 'risk_zone':
    case 'riesgo':
    case 'aglomeracion':
      return 'Zona de Alta Aglomeración';
    default:
      return 'Punto de Interés';
  }
}

// Helper para clases de estilo neón del badge de categoría
export function getCategoryBadgeStyle(category: string): string {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'restroom':
    case 'baño':
    case 'bano':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    case 'police':
    case 'policia':
    case 'cai':
    case 'seguridad':
      return 'bg-slate-700/50 text-sky-300 border-sky-400/40';
    case 'health':
    case 'salud':
    case 'medico':
    case 'hospital':
    case 'urgencias':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'restaurant':
    case 'restaurante':
    case 'comida':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'stage':
    case 'tarima':
    case 'concierto':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }
}

/**
 * Normaliza y valida pares de coordenadas estrictamente en formato [lat, lng] (estándar de Leaflet).
 * Corrige automáticamente cualquier inversión de longitud/latitud originada por GeoJSON o servicios OSRM.
 */
export function sanitizeLeafletCoordinates(coords: any[]): [number, number][] {
  if (!Array.isArray(coords)) return [];
  const result: [number, number][] = [];

  for (const c of coords) {
    if (!c) continue;
    let lat: number | null = null;
    let lng: number | null = null;

    if (Array.isArray(c) && c.length >= 2) {
      const a = Number(c[0]);
      const b = Number(c[1]);
      if (!isNaN(a) && !isNaN(b)) {
        // En San Juan de Pasto la Latitud es ~1.21 y Longitud es ~-77.28
        if (a < -50 && b > -5 && b < 15) {
          lat = b;
          lng = a;
        } else {
          lat = a;
          lng = b;
        }
      }
    } else if (typeof c === 'object') {
      const latVal = Number((c as any).lat ?? (c as any).latitude);
      const lngVal = Number((c as any).lng ?? (c as any).lon ?? (c as any).longitude);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        lat = latVal;
        lng = lngVal;
      }
    }

    if (lat !== null && lng !== null) {
      result.push([lat, lng]);
    }
  }

  return result;
}

// Controlador de cámara para auto-ajustar los límites (fitBounds / flyToBounds) al recibir una polilínea
function RouteBoundsAutoFitter({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  const prevCoordRef = useRef<string>('');

  useEffect(() => {
    if (!map || !Array.isArray(coordinates) || coordinates.length < 2) return;

    const key = `${coordinates.length}-${coordinates[0][0]},${coordinates[0][1]}-${coordinates[coordinates.length - 1][0]},${coordinates[coordinates.length - 1][1]}`;
    if (prevCoordRef.current === key) return;
    prevCoordRef.current = key;

    try {
      const bounds = L.latLngBounds(coordinates);
      if (typeof (map as any).flyToBounds === 'function') {
        (map as any).flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          duration: 1.5,
        });
      } else {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
        });
      }
    } catch (err) {
      console.warn('[CarnavalMap] Error while fitting bounds:', err);
    }
  }, [coordinates, map]);

  return null;
}

// Controlador para centrar la cámara suavemente en el usuario al disparar evento
function MapCenterOnUserController() {
  const map = useMap();

  useEffect(() => {
    const handleCenterOnUser = (e: any) => {
      const { lat, lng, zoom } = e.detail || {};
      if (lat !== undefined && lng !== undefined && map) {
        map.flyTo([lat, lng], zoom || 17, {
          duration: 1.5,
          animate: true,
        });
      }
    };

    window.addEventListener('CENTER_MAP_ON_USER', handleCenterOnUser);
    return () => window.removeEventListener('CENTER_MAP_ON_USER', handleCenterOnUser);
  }, [map]);

  return null;
}

// Componente para renderizar la zona de riesgo con halo de alerta pulsante
export function RiskZoneOverlay({ zone }: { zone: NearbyPlace }) {
  const [lat, lng] = zone.coordinates;
  return (
    <React.Fragment key={`risk-zone-${zone.name}-${lat}-${lng}`}>
      <Circle
        center={[lat, lng]}
        radius={140}
        pathOptions={{
          color: '#ef4444',
          fillColor: '#dc2626',
          fillOpacity: 0.28,
          weight: 2,
          dashArray: '6, 6',
        }}
      />
      <Marker position={[lat, lng]} icon={createRiskZonePinIcon(zone.name)}>
        <Popup className="custom-popup">
          <div className="p-2.5 min-w-[210px] max-w-[260px] font-sans text-xs bg-slate-950 text-white rounded-xl border border-red-500/40 shadow-xl">
            <div className="flex items-center gap-1.5 font-bold text-red-400 border-b border-red-500/30 pb-1 mb-1">
              <span>⚠️</span>
              <span className="uppercase text-[11px] tracking-wider">Zona de Aglomeración Crítica</span>
            </div>
            <h5 className="font-bold text-white text-xs mb-1">{zone.name}</h5>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {zone.description || 'Punto crítico de alta afluencia peatonal y cruce de carrozas gigantes. Camine con precaución y cuide sus pertenencias.'}
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-red-300 bg-red-950/60 px-2 py-1 rounded border border-red-500/20">
              <span>Nivel de Riesgo:</span>
              <strong className="text-red-400 uppercase font-black">Alto / Precaución</strong>
            </div>
          </div>
        </Popup>
      </Marker>
    </React.Fragment>
  );
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
  schedule: propSchedule,
  nearbyPlaces: propNearbyPlaces,
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
  const [activeSchedule, setActiveSchedule] = useState<CarnavalSchedule | null>(propSchedule || null);
  const [activeNearbyPlaces, setActiveNearbyPlaces] = useState<NearbyPlace[]>(propNearbyPlaces || []);

  const [liveUserLocation, setLiveUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    userLocation || null
  );

  useEffect(() => {
    if (userLocation) {
      setLiveUserLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    const handleGpsUpdate = (e: any) => {
      if (e.detail?.lat && e.detail?.lng) {
        setLiveUserLocation({
          lat: e.detail.lat,
          lng: e.detail.lng,
          accuracy: e.detail.accuracy,
        });
      }
    };
    window.addEventListener('USER_GPS_UPDATED', handleGpsUpdate);
    return () => window.removeEventListener('USER_GPS_UPDATED', handleGpsUpdate);
  }, []);

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

  useEffect(() => {
    if (propSchedule) {
      setActiveSchedule(propSchedule);
    }
  }, [propSchedule]);

  useEffect(() => {
    if (Array.isArray(propNearbyPlaces)) {
      setActiveNearbyPlaces(propNearbyPlaces);
    }
  }, [propNearbyPlaces]);

  // Escucha de eventos globales desacoplados (Chat-to-Map y Gemini Route Dispatcher)
  useEffect(() => {
    const handleDrawGeminiRoute = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;

      const rawWaypoints = detail.waypoints || detail.coordinates || detail.route_coordinates || [];
      const shouldDraw = detail.should_draw_route !== false && rawWaypoints.length >= 2;

      if (detail.schedule) {
        setActiveSchedule(detail.schedule);
      }
      if (Array.isArray(detail.nearby_places)) {
        setActiveNearbyPlaces(detail.nearby_places);
      }

      if (shouldDraw) {
        // Limpia cualquier ruta previa e inyecta las nuevas coordenadas
        setActiveRouteCoordinates(rawWaypoints);
        setIsRouteActive(true);
        if (detail.title || detail.reply) {
          setActiveTitle(detail.title || detail.event_name || 'Ruta generada por GuaneñaBot');
        }
      }
    };

    const handleClearRoute = () => {
      setActiveRouteCoordinates([]);
      setIsRouteActive(false);
      setActiveSchedule(null);
      setActiveNearbyPlaces([]);
      if (onRouteClear) onRouteClear();
    };

    const handleFocusBounds = (e: any) => {
      const coords = e?.detail?.coordinates || activeRouteCoordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        setActiveRouteCoordinates(coords);
        setIsRouteActive(true);
      }
    };

    window.addEventListener('DRAW_GEMINI_ROUTE', handleDrawGeminiRoute);
    window.addEventListener('CLEAR_MAP_ROUTE', handleClearRoute);
    window.addEventListener('route-to-poi', handleDrawGeminiRoute);
    window.addEventListener('FOCUS_MAP_BOUNDS', handleFocusBounds);

    return () => {
      window.removeEventListener('DRAW_GEMINI_ROUTE', handleDrawGeminiRoute);
      window.removeEventListener('CLEAR_MAP_ROUTE', handleClearRoute);
      window.removeEventListener('route-to-poi', handleDrawGeminiRoute);
      window.removeEventListener('FOCUS_MAP_BOUNDS', handleFocusBounds);
    };
  }, [onRouteClear]);

  const handleClearActiveRoute = useCallback(() => {
    setActiveRouteCoordinates([]);
    setIsRouteActive(false);
    setActiveSchedule(null);
    setActiveNearbyPlaces([]);
    if (onRouteClear) onRouteClear();
  }, [onRouteClear]);

  // Normalización estricta de coordenadas [lat, lng] para Leaflet
  const parsedRouteCoords = useMemo(
    () => sanitizeLeafletCoordinates(activeRouteCoordinates),
    [activeRouteCoordinates]
  );

  const startCoord = isRouteActive && parsedRouteCoords.length >= 2 ? parsedRouteCoords[0] : null;
  const endCoord = isRouteActive && parsedRouteCoords.length >= 2 ? parsedRouteCoords[parsedRouteCoords.length - 1] : null;

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

        {/* Controlador para centrar la cámara suavemente en el usuario */}
        <MapCenterOnUserController />

        {/* Auto-zoom y ajuste suave a los límites de la polilínea activa (padding: [50, 50]) */}
        {isRouteActive && parsedRouteCoords.length >= 2 && (
          <RouteBoundsAutoFitter coordinates={parsedRouteCoords} />
        )}

        {/* LayerGroup dedicado para el trazado de la Senda del Carnaval y sus hitos */}
        {isRouteActive && parsedRouteCoords.length >= 2 && (
          <LayerGroup>
            {/* Outer Border Line for Maximum Contrast */}
            <Polyline
              key={`casing-route-${parsedRouteCoords.length}`}
              positions={parsedRouteCoords}
              pathOptions={{
                color: '#000000',
                weight: 10,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Inner Glowing Carnival Line */}
            <Polyline
              key={`main-route-${parsedRouteCoords.length}`}
              positions={parsedRouteCoords}
              pathOptions={{
                color: '#ff0055',
                weight: 6,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Marcador de Inicio con badge "🟢 INICIO SENDA" en Estadio Libertad */}
            <Marker
              position={startCoord || [1.2025, -77.2762]}
              icon={createStartPinIcon('🟢 INICIO SENDA')}
            >
              <Popup className="custom-popup">
                <div className="p-2.5 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl border border-emerald-500/40 shadow-xl">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 border-b border-white/10 pb-1.5 mb-1.5">
                    <span className="text-base">🚩</span>
                    <span className="uppercase text-[11px] tracking-wide">Inicio de la Senda</span>
                  </div>
                  <h5 className="font-bold text-white text-xs mb-1">
                    {activeSchedule?.start_location || 'Estadio Departamental Libertad'}
                  </h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
                    Punto oficial de partida y concentración de carrozas, comparsas y murgas.
                  </p>
                  <div className="flex items-center justify-between text-[11px] bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/25 text-emerald-300 font-mono">
                    <span>Hora de Salida:</span>
                    <strong className="font-bold">{activeSchedule?.start_time || '10:00 AM'}</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 font-mono">
                    Lat: {(startCoord || [1.2025, -77.2762])[0].toFixed(4)}, Lng: {(startCoord || [1.2025, -77.2762])[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Marcador de Llegada con badge "🏁 LLEGADA SENDA" en Fuente de la Transparencia */}
            <Marker
              position={endCoord || [1.2330, -77.2845]}
              icon={createEndPinIcon('🏁 LLEGADA SENDA')}
            >
              <Popup className="custom-popup">
                <div className="p-2.5 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl border border-amber-500/40 shadow-xl">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 border-b border-white/10 pb-1.5 mb-1.5">
                    <span className="text-base">🏁</span>
                    <span className="uppercase text-[11px] tracking-wide">Llegada de la Senda</span>
                  </div>
                  <h5 className="font-bold text-white text-xs mb-1">
                    {activeSchedule?.finish_location || 'Fuente de la Transparencia / Torobajo'}
                  </h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
                    Punto de culminación, premiación oficial y desconcentración de agrupaciones y carrozas.
                  </p>
                  <div className="flex items-center justify-between text-[11px] bg-amber-950/60 px-2 py-1 rounded border border-amber-500/25 text-amber-300 font-mono">
                    <span>Hora Estimada:</span>
                    <strong className="font-bold">{activeSchedule?.estimated_arrival_time || '03:30 PM'}</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 font-mono">
                    Lat: {(endCoord || [1.2330, -77.2845])[0].toFixed(4)}, Lng: {(endCoord || [1.2330, -77.2845])[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </LayerGroup>
        )}
        )}

        {/* Capas interactivas de Telemetría (Restrooms, Police, Health, Stages, Shopping, Restaurants, Risk Zones) */}
        {Array.isArray(activeNearbyPlaces) && activeNearbyPlaces.map((place, idx) => {
          if (!place || !Array.isArray(place.coordinates) || place.coordinates.length < 2) return null;
          const [lat, lng] = place.coordinates;

          if (place.category === 'risk_zone' || place.category === 'aglomeracion') {
            return <RiskZoneOverlay key={`risk-${place.name}-${idx}`} zone={place} />;
          }

          return (
            <Marker
              key={`nearby-${place.name}-${idx}-${lat}-${lng}`}
              position={[lat, lng]}
              icon={getNearbyPlaceIcon(place.category, place.name)}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[210px] max-w-[270px] font-sans text-xs bg-slate-950/95 text-white rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md">
                  {/* Category badge */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-base">{getCategoryEmoji(place.category)}</span>
                      <span className={`uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full font-extrabold border ${getCategoryBadgeStyle(place.category)}`}>
                        {formatCategoryTitle(place.category)}
                      </span>
                    </div>
                  </div>

                  {/* Title: Place name */}
                  <h4 className="font-extrabold text-white text-sm leading-snug mb-1">
                    {place.name}
                  </h4>

                  {/* Address / reference */}
                  {(place.address || place.reference || place.schedule) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium mb-1.5">
                      <span>📍</span>
                      <span className="truncate">{place.address || place.reference || place.schedule}</span>
                    </div>
                  )}

                  {/* Description provided by Gemini */}
                  {place.description && (
                    <p className="text-slate-300 text-[11px] leading-relaxed mb-2 bg-slate-900/80 p-2 rounded-xl border border-white/5">
                      {place.description}
                    </p>
                  )}

                  {/* Status / Availability footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10 font-mono">
                    <span>Estado:</span>
                    <span className="text-emerald-400 font-bold">
                      {place.status || 'Habilitado Carnaval'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Marcador GPS en tiempo real del usuario */}
        {liveUserLocation && (
          <LayerGroup>
            {/* Halo de precisión / pulso animado */}
            <Circle
              center={[liveUserLocation.lat, liveUserLocation.lng]}
              radius={liveUserLocation.accuracy ? Math.max(liveUserLocation.accuracy, 25) : 30}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#2563eb',
                fillOpacity: 0.18,
                weight: 1.5,
              }}
            />
            {/* Pin GPS principal: CircleMarker azul con borde blanco */}
            <CircleMarker
              center={[liveUserLocation.lat, liveUserLocation.lng]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#2563eb',
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-xs font-sans p-1 text-slate-800">
                  <strong className="text-blue-600 block font-bold">📍 ¡Estás aquí en tiempo real!</strong>
                  <span className="text-slate-600 text-[11px]">
                    Lat: {liveUserLocation.lat.toFixed(5)}, Lng: {liveUserLocation.lng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          </LayerGroup>
        )}
      </MapContainer>

      {/* Tarjeta flotante de telemetría de horarios y recorrido oficial sobre el mapa */}
      {activeSchedule && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[950] w-[94vw] sm:max-w-2xl rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-black/80 px-4 py-3 text-white animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Título y estado */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-lg shadow-lg shadow-amber-500/30 shrink-0">
                🎭
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {activeSchedule.event_name || 'Telemetría Oficial de la Senda'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {activeTitle || 'Recorrido del Carnaval'}
                </h4>
              </div>
            </div>

            {/* Puntos de Salida y Llegada */}
            <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4 shrink-0">
              {/* Punto de Partida */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">🚩</span>
                <div className="min-w-0">
                  <span className="block text-[10px] text-emerald-400 uppercase font-black">Salida</span>
                  <span className="block text-white font-bold text-xs truncate max-w-[120px] sm:max-w-[140px]" title={activeSchedule.start_location}>
                    {activeSchedule.start_location}
                  </span>
                  <span className="block text-[11px] text-emerald-300 font-mono font-semibold">
                    {activeSchedule.start_time}
                  </span>
                </div>
              </div>

              <div className="text-slate-600 font-bold hidden sm:block">➜</div>

              {/* Punto de Llegada */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">🏁</span>
                <div className="min-w-0">
                  <span className="block text-[10px] text-amber-400 uppercase font-black">Llegada</span>
                  <span className="block text-white font-bold text-xs truncate max-w-[120px] sm:max-w-[140px]" title={activeSchedule.finish_location}>
                    {activeSchedule.finish_location}
                  </span>
                  <span className="block text-[11px] text-amber-300 font-mono font-semibold">
                    {activeSchedule.estimated_arrival_time}
                  </span>
                </div>
              </div>

              {activeSchedule.distance_km && (
                <div className="hidden md:flex flex-col items-center justify-center px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-[9px] uppercase font-bold text-amber-400">Distancia</span>
                  <span className="text-xs font-mono font-extrabold text-amber-300">
                    {typeof activeSchedule.distance_km === 'number' ? `${activeSchedule.distance_km} km` : activeSchedule.distance_km}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

