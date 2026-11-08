import React, { useState, useEffect } from 'react';
import { Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapAction } from '../context/MapActionContext';
import { getWalkingRouteToSenda } from '../services/osrmRoutingService';

export interface ActiveRouteData {
  coordinates: [number, number][];
  distanceMeters: number;
  durationMinutes: number;
  targetName: string;
  targetCoords: [number, number];
}

export interface ActiveRouteLayerProps {
  routeRequest?: {
    startCoords?: [number, number];
    targetCoords: [number, number];
    targetName?: string;
  } | null;
  userGps?: [number, number] | null;
  onClose?: () => void;
}

// Icono personalizado para el destino de la ruta activa
function createDestinationPinIcon(name: string) {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 18px rgba(37, 99, 235, 0.8), 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 18px;">
          📍
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #60a5fa;
        font-family: sans-serif;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #3b82f6;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        ${name ? name.substring(0, 16) : 'Destino'}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-active-destination-marker',
    html,
    iconSize: [38, 54],
    iconAnchor: [19, 54],
    popupAnchor: [0, -56],
  });
}

/**
 * Capa de enrutamiento dinámico para Leaflet.
 * Escucha solicitudes DRAW_ROUTE y renderiza la polilínea peatonal OSRM
 * con animación, efecto neón punteado y métricas de caminata en vivo.
 */
export const ActiveRouteLayer: React.FC<ActiveRouteLayerProps> = ({
  routeRequest: propRequest,
  userGps,
  onClose,
}) => {
  const map = useMap();
  const { mapCommand, clearMapCommand } = useMapAction();
  const [activeRoute, setActiveRoute] = useState<ActiveRouteData | null>(null);
  const [loading, setLoading] = useState(false);

  // Escucha cambios provenientes del Contexto Global o de Props
  useEffect(() => {
    let req = propRequest;

    if (!req && mapCommand && mapCommand.actionType === 'DRAW_ROUTE' && mapCommand.payload?.targetCoords) {
      req = {
        startCoords: mapCommand.payload.startCoords,
        targetCoords: mapCommand.payload.targetCoords,
        targetName: mapCommand.payload.targetName,
      };
    }

    if (!req || !req.targetCoords) {
      return;
    }

    const start = req.startCoords || userGps || [1.2138, -77.2818]; // Plaza Nariño por defecto
    const target = req.targetCoords;
    const name = req.targetName || 'Punto de Interés';

    setLoading(true);
    let isMounted = true;

    getWalkingRouteToSenda(start[0], start[1], target[0], target[1])
      .then((res) => {
        if (!isMounted) return;
        if (res && res.coordinates && res.coordinates.length > 0) {
          const routeData: ActiveRouteData = {
            coordinates: res.coordinates,
            distanceMeters: res.distanceMeters,
            durationMinutes: res.durationMinutes,
            targetName: name,
            targetCoords: target,
          };
          setActiveRoute(routeData);

          // Ajustar límites de la cámara para visualizar toda la ruta
          try {
            if (map && res.coordinates.length > 1) {
              const bounds = L.latLngBounds(res.coordinates);
              map.fitBounds(bounds, { padding: [60, 60], animate: true });
            }
          } catch (e) {
            console.warn('Error al ajustar límites de ruta OSRM:', e);
          }
        }
      })
      .catch((err) => {
        console.warn('Error calculando ruta peatonal OSRM:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mapCommand, propRequest, userGps, map]);

  // Escucha de evento directo 'route-to-poi' en window
  useEffect(() => {
    const handleRouteEvent = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.targetCoords) return;

      const start = detail.startCoords || userGps || [1.2138, -77.2818];
      const target = detail.targetCoords;
      const name = detail.targetName || 'Destino';

      getWalkingRouteToSenda(start[0], start[1], target[0], target[1]).then((res) => {
        if (res && res.coordinates && res.coordinates.length > 0) {
          setActiveRoute({
            coordinates: res.coordinates,
            distanceMeters: res.distanceMeters,
            durationMinutes: res.durationMinutes,
            targetName: name,
            targetCoords: target,
          });
          if (map) {
            const bounds = L.latLngBounds(res.coordinates);
            map.fitBounds(bounds, { padding: [60, 60], animate: true });
          }
        }
      });
    };

    window.addEventListener('route-to-poi', handleRouteEvent);
    return () => window.removeEventListener('route-to-poi', handleRouteEvent);
  }, [userGps, map]);

  const handleDismiss = () => {
    setActiveRoute(null);
    clearMapCommand();
    if (onClose) onClose();
  };

  if (!activeRoute || activeRoute.coordinates.length < 2) {
    return null;
  }

  return (
    <>
      {/* 1. Resplandor exterior de la ruta activa */}
      <Polyline
        positions={activeRoute.coordinates}
        pathOptions={{
          color: '#38bdf8',
          weight: 9,
          opacity: 0.35,
          dashArray: '8, 8',
          lineJoin: 'round',
          lineCap: 'round',
        }}
      />

      {/* 2. Trazo peatonal primario punteado de alto contraste */}
      <Polyline
        positions={activeRoute.coordinates}
        pathOptions={{
          color: '#2563eb',
          weight: 5,
          opacity: 0.95,
          dashArray: '6, 8',
          lineJoin: 'round',
          lineCap: 'round',
          className: 'active-walking-route-path',
        }}
      />

      {/* 3. Marcador de Destino */}
      <Marker
        position={activeRoute.targetCoords}
        icon={createDestinationPinIcon(activeRoute.targetName)}
      >
        <Popup className="custom-popup" autoPan={false}>
          <div className="p-2 min-w-[200px] font-sans text-xs bg-slate-900 text-white rounded-xl">
            <div className="flex items-center gap-1.5 font-bold text-blue-400 border-b border-white/10 pb-1 mb-1">
              <span>🚶‍♂️</span>
              <span className="uppercase text-[11px]">{activeRoute.targetName}</span>
            </div>
            <div className="text-slate-300 text-[11px] mb-2">
              Distancia a pie: <strong className="text-white">{activeRoute.distanceMeters} m</strong>
              <br />
              Tiempo estimado: <strong className="text-amber-400">~{activeRoute.durationMinutes} min</strong>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold cursor-pointer transition text-center"
            >
              Cerrar ruta
            </button>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default ActiveRouteLayer;
