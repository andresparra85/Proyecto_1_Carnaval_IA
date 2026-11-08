import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapAction } from '../context/MapActionContext';

export interface PoiData {
  id: string | number;
  name: string;
  category?: string;
  coords?: [number, number];
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  schedule?: string;
  badgeColor?: string;
  icon?: string;
  is_open?: boolean;
}

export interface PoiMarkerProps {
  poi: PoiData;
  userGps?: [number, number] | null;
  onRouteClick?: (coords: [number, number], name: string) => void;
}

// Icono temático dinámico según la categoría del POI
function createThemedPoiIcon(poi: PoiData) {
  let bg = poi.badgeColor || '#f59e0b';
  let emoji = poi.icon || '📍';

  if (!poi.icon) {
    switch (poi.category) {
      case 'bano':
        emoji = '🚻';
        bg = '#06b6d4';
        break;
      case 'salud':
        emoji = '🚨';
        bg = '#ef4444';
        break;
      case 'restaurante':
        emoji = '🍽️';
        bg = '#f97316';
        break;
      case 'cai':
        emoji = '👮';
        bg = '#3b82f6';
        break;
      case 'graderia':
        emoji = '🏟️';
        bg = '#eab308';
        break;
      default:
        emoji = '📍';
        break;
    }
  }

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
        box-shadow: 0 0 16px ${bg}88, 0 4px 8px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">
          ${emoji}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: `custom-poi-marker-${poi.id}`,
    html,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
  });
}

/**
 * Marcador de Punto de Interés (POI) para Leaflet con botón interactivo
 * de trazado de ruta peatonal directa OSRM hacia sus coordenadas.
 */
export const PoiMarker: React.FC<PoiMarkerProps> = ({ poi, userGps, onRouteClick }) => {
  const { dispatchMapCommand } = useMapAction();

  const coords: [number, number] | null = poi.coords
    ? poi.coords
    : typeof poi.latitude === 'number' && typeof poi.longitude === 'number'
    ? [poi.latitude, poi.longitude]
    : null;

  if (!coords) return null;

  const handleHowToGetThere = () => {
    const start: [number, number] = userGps || [1.2138, -77.2818]; // Plaza Nariño por defecto

    // Despacho de comando de enrutamiento sin recargar ni romper el estado del mapa
    dispatchMapCommand({
      actionType: 'DRAW_ROUTE',
      payload: {
        startCoords: start,
        targetCoords: coords,
        targetName: poi.name,
        category: poi.category,
      },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('route-to-poi', {
          detail: {
            startCoords: start,
            targetCoords: coords,
            targetName: poi.name,
          },
        })
      );
    }

    if (onRouteClick) {
      onRouteClick(coords, poi.name);
    }
  };

  return (
    <Marker position={coords} icon={createThemedPoiIcon(poi)}>
      <Popup className="custom-popup" autoPan={true}>
        <div className="p-2.5 min-w-[220px] max-w-[270px] font-sans text-xs bg-slate-900 text-white rounded-xl">
          <div className="flex items-center gap-1.5 font-bold border-b border-white/10 pb-1 mb-1.5 text-amber-400">
            <span className="text-base">{poi.icon || '📍'}</span>
            <span className="leading-tight">{poi.name}</span>
          </div>

          {poi.description && (
            <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
              {poi.description}
            </p>
          )}

          {poi.address && (
            <div className="text-[10px] text-slate-400 mb-1 font-mono">
              📍 {poi.address}
            </div>
          )}

          {poi.schedule && (
            <div className="text-[10px] text-emerald-400 mb-2 font-mono">
              🕒 {poi.schedule}
            </div>
          )}

          {/* Botón de acción directo para trazar ruta peatonal */}
          <button
            type="button"
            onClick={handleHowToGetThere}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer mt-1"
            title={`Trazar ruta a pie hacia ${poi.name}`}
          >
            <span>📍</span>
            <span>¿Cómo llegar a pie?</span>
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default PoiMarker;
