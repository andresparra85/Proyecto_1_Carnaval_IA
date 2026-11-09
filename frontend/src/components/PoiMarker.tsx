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
  activeCategory?: string | null;
  userGps?: [number, number] | null;
  onRouteClick?: (coords: [number, number], name: string) => void;
}

// Icono temático dinámico según la categoría del POI
function createThemedPoiIcon(poi: PoiData) {
  let bg = poi.badgeColor || '#ff6b5b';
  let emoji = poi.icon || '📍';

  if (!poi.icon) {
    switch (poi.category) {
      case 'bano':
      case 'banos':
        emoji = '🚻';
        bg = '#14b8a6';
        break;
      case 'salud':
        emoji = '🚨';
        bg = '#ef4444';
        break;
      case 'restaurante':
      case 'restaurantes':
        emoji = '🍽️';
        bg = '#f97316';
        break;
      case 'cai':
      case 'policia':
        emoji = '👮';
        bg = '#3b82f6';
        break;
      case 'graderia':
      case 'graderias':
        emoji = '🏟️';
        bg = '#ff6b5b';
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
 * Marcador de Punto de Interés (POI) para Leaflet.
 * Se dibuja únicamente si coincide con la categoría solicitada por GuaneñaBot
 * e integra en su popup información georreferenciada y el botón directo "📍 ¿Cómo llegar?".
 */
export const PoiMarker: React.FC<PoiMarkerProps> = ({ poi, activeCategory, userGps, onRouteClick }) => {
  const { dispatchMapCommand, mapCommand } = useMapAction();

  // Filtrado reactivo estricto por categoría solicitada por el bot
  const currentCategory = activeCategory || (mapCommand?.actionType === 'FILTER_POIS' ? mapCommand.payload?.category : null);

  if (currentCategory && currentCategory !== 'todos') {
    const normCurrent = currentCategory.toLowerCase();
    const normPoi = (poi.category || '').toLowerCase();
    const matches =
      normCurrent === normPoi ||
      (normCurrent.startsWith('restauran') && normPoi.startsWith('restauran')) ||
      (normCurrent.startsWith('ban') && normPoi.startsWith('ban')) ||
      (normCurrent.startsWith('salud') && normPoi.startsWith('salud')) ||
      (normCurrent.startsWith('cai') && normPoi.startsWith('cai'));

    if (!matches) {
      return null;
    }
  }

  const coords: [number, number] | null = poi.coords
    ? poi.coords
    : typeof poi.latitude === 'number' && typeof poi.longitude === 'number'
    ? [poi.latitude, poi.longitude]
    : null;

  if (!coords) return null;

  const handleHowToGetThere = () => {
    const start: [number, number] = userGps || [1.2138, -77.2818]; // Plaza Nariño por defecto

    // Despacho del comando de enrutamiento OSRM
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
          <div className="flex items-center gap-1.5 font-bold border-b border-white/10 pb-1 mb-1.5 text-coral-300">
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

          {/* Botón interactivo de enrutamiento peatonal solicitado */}
          <button
            type="button"
            onClick={handleHowToGetThere}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-coral-600 via-rose-600 to-coral-700 hover:from-coral-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer mt-1"
            title={`Trazar ruta a pie hacia ${poi.name}`}
          >
            <span>📍</span>
            <span>¿Cómo llegar?</span>
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default PoiMarker;
