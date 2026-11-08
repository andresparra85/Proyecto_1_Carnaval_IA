import React, { useState, useEffect } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PASTO_POIS, PointOfInterest, LatLngTuple, dispatchGuanenaAction } from '../../data/pastoPOIs';
import { SENDA_OFICIAL_COORDS, HITOS_SENDA } from '../../data/sendaCoords';

// Resuelve el error clásico de Leaflet con Vite donde las rutas de los iconos por defecto se rompen
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constantes visuales y de posicionamiento robusto de MapComponent
export const DEFAULT_MAP_CENTER: [number, number] = [1.2140, -77.2820]; // Centro Histórico de Pasto
export const DEFAULT_MAP_ZOOM = 15;
export const DEFAULT_MAP_CONTAINER_CLASS = "h-[calc(100vh-4rem)] w-full relative z-0";
export const DEFAULT_MAP_CONTAINER_STYLE: React.CSSProperties = { minHeight: '500px', width: '100%' };

/**
 * Hook de geolocalización segura para MapComponent que garantiza orden de declaración hoisted
 */
export function useMapUserGps() {
  const [userGps, setUserGps] = useState<[number, number] | null>(null);
  const originPoint: [number, number] = userGps || [1.2138, -77.2818]; // Fallback al Parque Nariño si no hay GPS activo
  return { userGps, setUserGps, originPoint };
}

/**
 * Componente blindado para renderizar el marcador de usuario solo con coordenadas válidas
 */
export function GuardedUserMarker({ userGps }: { userGps: [number, number] | null }) {
  if (!userGps || isNaN(userGps[0]) || isNaN(userGps[1])) {
    return null;
  }
  return (
    <Marker position={userGps}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  );
}

/**
 * Componente blindado para renderizar polilíneas de navegación solo con arrays de al menos 2 puntos
 */
export function GuardedNavigationPolyline({ navigationPath }: { navigationPath: [number, number][] | null | undefined }) {
  if (!Array.isArray(navigationPath) || navigationPath.length < 2) {
    return null;
  }
  return (
    <Polyline
      positions={navigationPath}
      pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.85 }}
    />
  );
}

/**
 * Capa de marcadores interactivos georreferenciados para Pasto (Restaurantes, Baños, CAIs, Salud)
 */
export function PastoPoiMarkersLayer({
  activeCategory = 'todos',
  onSelectPoi,
}: {
  activeCategory?: string;
  onSelectPoi?: (poi: PointOfInterest) => void;
}) {
  const filtered = activeCategory === 'todos'
    ? PASTO_POIS
    : PASTO_POIS.filter((p) => p.category === activeCategory || (activeCategory === 'banio' && p.category === 'bano'));

  return (
    <>
      {filtered.map((poi) => (
        <Marker
          key={poi.id}
          position={poi.coords}
          eventHandlers={{
            click: () => onSelectPoi && onSelectPoi(poi),
          }}
        >
          <Popup>
            <div className="p-1 font-sans text-xs">
              <strong className="block text-amber-500 font-bold">{poi.name}</strong>
              <p className="text-slate-600 dark:text-slate-300 my-1">{poi.description}</p>
              <span className="text-[10px] text-slate-400 block">{poi.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/**
 * Hook para sincronizar comandos conversacionales de GuaneñaBot (FOCUS_CATEGORY, SHOW_SENDA, NAVIGATE_TO)
 */
export function useConversationalMapActions({
  onFilterCategory,
  onShowSenda,
}: {
  onFilterCategory?: (category: string) => void;
  onShowSenda?: () => void;
} = {}) {
  const map = useMap();

  useEffect(() => {
    const handleGuanena = (e: any) => {
      const detail = e.detail || {};
      const actionType = detail.type || e.type;

      if (actionType === 'FOCUS_CATEGORY') {
        const cat = detail.category || 'todos';
        if (onFilterCategory) onFilterCategory(cat);
        const target = PASTO_POIS.find((p) => p.category === cat || (cat === 'banio' && p.category === 'bano'));
        if (target && map?.flyTo) {
          map.flyTo(target.coords, 16, { animate: true, duration: 1.5 });
        }
      } else if (actionType === 'SHOW_SENDA') {
        if (onShowSenda) onShowSenda();
        if (map?.flyTo) {
          map.flyTo([1.2140, -77.2820], 15, { animate: true, duration: 1.5 });
        }
      } else if (actionType === 'NAVIGATE_TO') {
        const coords = detail.targetCoords || detail.coords;
        if (coords && map?.flyTo) {
          map.flyTo(coords, 17, { animate: true, duration: 1.5 });
        }
      }
    };

    window.addEventListener('FOCUS_CATEGORY', handleGuanena);
    window.addEventListener('SHOW_SENDA', handleGuanena);
    window.addEventListener('NAVIGATE_TO', handleGuanena);
    window.addEventListener('guanena-action', handleGuanena);

    return () => {
      window.removeEventListener('FOCUS_CATEGORY', handleGuanena);
      window.removeEventListener('SHOW_SENDA', handleGuanena);
      window.removeEventListener('NAVIGATE_TO', handleGuanena);
      window.removeEventListener('guanena-action', handleGuanena);
    };
  }, [map, onFilterCategory, onShowSenda]);
}

/**
 * Generador de pines SVG modernos y festivos con resplandor para los Hitos de la Senda del Carnaval
 */
export function createSvgLandmarkPin({
  type,
  label,
}: {
  type: 'inicio' | 'intermedio' | 'fin' | 'plaza' | 'salud';
  label?: string;
}) {
  let pinColor = '#F59E0B'; // Ámbar por defecto
  let shadowColor = 'rgba(245, 158, 11, 0.6)';
  let iconSvg = '';
  let subText = 'Hito';

  if (type === 'inicio') {
    // Verde Esmeralda con icono de Bandera de Salida
    pinColor = '#10B981';
    shadowColor = 'rgba(16, 185, 129, 0.65)';
    subText = 'Salida';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2v20h2v-8h14l-2-6 2-6H6V2H4z"/>
      </svg>
    `;
  } else if (type === 'fin') {
    // Carmesí festivo con icono de Meta / Llegada
    pinColor = '#E11D48';
    shadowColor = 'rgba(225, 29, 72, 0.7)';
    subText = 'Llegada';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    `;
  } else {
    // Dorado / Ámbar con icono de Corona / Tarima Festiva (Plaza Nariño / Carnaval)
    pinColor = '#F59E0B';
    shadowColor = 'rgba(245, 158, 11, 0.65)';
    subText = 'Hito';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 19h19v2h-19zm19.5-8.5-5 3.5-5-7-5 7-5-3.5 2 9h16z"/>
      </svg>
    `;
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <!-- Pin SVG con sombra y borde pulido -->
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: ${pinColor};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px ${shadowColor}, 0 8px 16px rgba(0,0,0,0.6);
        transition: transform 0.2s ease;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
      <!-- Resplandor pulsante en la base -->
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${pinColor};
        opacity: 0.8;
        box-shadow: 0 0 12px ${pinColor};
        margin-top: 2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-svg-landmark-pin',
    html,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -50],
  });
}

export * from './CarnavalDaySelector';
export { default as CarnavalDaySelector } from './CarnavalDaySelector';
export * from '../MapView';
export { default } from '../MapView';
export { MapView as MapComponent } from '../MapView';
