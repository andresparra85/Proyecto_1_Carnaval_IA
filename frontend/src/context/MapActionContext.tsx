import React, { createContext, useContext, useState, useCallback } from 'react';
import { CARNAVAL_DAILY_TRACKS, CARNAVAL_DAYS_TRACKS, SENDA_OFICIAL_COORDS } from '../data/carnavalRoutesGeoJSON';
import { PASTO_POIS } from '../data/pastoPOIs';

export type MapActionType =
  | 'DRAW_SENDA'
  | 'FILTER_POIS'
  | 'SHOW_ALL_CLEAN'
  | 'FLY_TO'
  | 'SHOW_SENDA'
  | 'DRAW_ROUTE'
  | 'CLEAR';

export interface MapActionPayload {
  type: MapActionType | string;
  payload?: any;
}

export interface MapCommand {
  actionType: MapActionType;
  payload?: any;
  timestamp: number;
}

export interface MapActionContextType {
  mapCommand: MapCommand | null;
  dispatchMapCommand: (command: { actionType: MapActionType; payload?: any }) => void;
  executeMapAction: (action: { type: MapActionType | string; payload?: any }) => void;
  clearMapCommand: () => void;
}

// Coordenadas emblemáticas por categoría para centrado de cámara flyTo
const CATEGORY_EMBLEMATIC_COORDS: Record<string, { coords: [number, number]; zoom: number; name: string }> = {
  restaurantes: { coords: [1.2132, -77.2798], zoom: 17, name: 'Restaurante Rancho Grande / Gastronomía' },
  restaurante: { coords: [1.2132, -77.2798], zoom: 17, name: 'Restaurante Rancho Grande' },
  banos: { coords: [1.2145, -77.2845], zoom: 18, name: 'Batería Sanitaria Plaza del Carnaval' },
  bano: { coords: [1.2145, -77.2845], zoom: 18, name: 'Batería Sanitaria Plaza del Carnaval' },
  salud: { coords: [1.2158, -77.2835], zoom: 18, name: 'Puesto de Salud Cruz Roja Plaza del Carnaval' },
  cai: { coords: [1.2155, -77.2839], zoom: 18, name: 'CAI Plaza del Carnaval Policía Nacional' },
};

export const MapActionContext = createContext<MapActionContextType | undefined>(undefined);

export const MapActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);

  const dispatchMapCommand = useCallback((command: { actionType: MapActionType; payload?: any }) => {
    const fullCommand: MapCommand = {
      actionType: command.actionType,
      payload: command.payload,
      timestamp: Date.now(),
    };
    setMapCommand(fullCommand);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
      window.dispatchEvent(new CustomEvent(command.actionType, { detail: command.payload }));
    }
  }, []);

  /**
   * Motor de Despacho de Eventos Chat-to-Map:
   * Conecta de forma determinista intenciones semánticas de GuaneñaBot con las capas reactivas de Leaflet.
   */
  const executeMapAction = useCallback(
    ({ type, payload }: { type: MapActionType | string; payload?: any }) => {
      const normalizedType = type.toUpperCase() as MapActionType;

      switch (normalizedType) {
        case 'DRAW_SENDA': {
          const dayKey = (typeof payload === 'string' ? payload : payload?.dayKey || payload?.dayId) || 'jan_06';
          const track = (CARNAVAL_DAILY_TRACKS as any)[dayKey] || (CARNAVAL_DAYS_TRACKS as any)[dayKey] || CARNAVAL_DAILY_TRACKS.jan_06;
          const coords = track?.coords || SENDA_OFICIAL_COORDS;

          const actionPayload = {
            dayKey,
            track,
            coords,
            name: track?.name || 'Senda Oficial',
          };

          dispatchMapCommand({ actionType: 'DRAW_SENDA', payload: actionPayload });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('DRAW_SENDA', { detail: actionPayload }));
            window.dispatchEvent(new CustomEvent('SHOW_SENDA', { detail: actionPayload }));
            window.dispatchEvent(new CustomEvent('focus-senda', { detail: actionPayload }));
          }
          break;
        }

        case 'FILTER_POIS': {
          const rawCategory = typeof payload === 'string' ? payload.toLowerCase() : (payload?.category || 'restaurantes').toLowerCase();
          const targetKey = rawCategory.includes('restauran') || rawCategory.includes('cuy') || rawCategory.includes('com')
            ? 'restaurantes'
            : rawCategory.includes('bañ') || rawCategory.includes('ban') || rawCategory.includes('sanitar')
            ? 'banos'
            : rawCategory.includes('salud') || rawCategory.includes('cruz') || rawCategory.includes('medic')
            ? 'salud'
            : rawCategory.includes('cai') || rawCategory.includes('polic') || rawCategory.includes('segurid')
            ? 'cai'
            : rawCategory;

          const matchedConfig = CATEGORY_EMBLEMATIC_COORDS[targetKey] || { coords: [1.2168, -77.2805], zoom: 16, name: 'Pasto Centro' };
          const singularCategory = targetKey === 'restaurantes' ? 'restaurante' : targetKey === 'banos' ? 'bano' : targetKey;

          const actionPayload = {
            category: singularCategory,
            rawCategory: targetKey,
            coords: matchedConfig.coords,
            zoom: matchedConfig.zoom,
            name: matchedConfig.name,
          };

          dispatchMapCommand({ actionType: 'FILTER_POIS', payload: actionPayload });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('FILTER_POIS', { detail: actionPayload }));
            window.dispatchEvent(new CustomEvent('FLY_TO', { detail: actionPayload }));
            window.dispatchEvent(new CustomEvent('show-poi-category', { detail: actionPayload }));
          }
          break;
        }

        case 'SHOW_ALL_CLEAN': {
          dispatchMapCommand({ actionType: 'SHOW_ALL_CLEAN', payload: {} });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('SHOW_ALL_CLEAN', { detail: {} }));
            window.dispatchEvent(new CustomEvent('CLEAR', { detail: {} }));
          }
          break;
        }

        default: {
          dispatchMapCommand({ actionType: normalizedType, payload });
          break;
        }
      }
    },
    [dispatchMapCommand]
  );

  const clearMapCommand = useCallback(() => {
    executeMapAction({ type: 'SHOW_ALL_CLEAN' });
  }, [executeMapAction]);

  return (
    <MapActionContext.Provider value={{ mapCommand, dispatchMapCommand, executeMapAction, clearMapCommand }}>
      {children}
    </MapActionContext.Provider>
  );
};

export const useMapAction = (): MapActionContextType => {
  const context = useContext(MapActionContext);
  if (!context) {
    return {
      mapCommand: null,
      dispatchMapCommand: (command) => {
        if (typeof window !== 'undefined') {
          const fullCommand: MapCommand = {
            actionType: command.actionType,
            payload: command.payload,
            timestamp: Date.now(),
          };
          window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
          window.dispatchEvent(new CustomEvent(command.actionType, { detail: command.payload }));
        }
      },
      executeMapAction: ({ type, payload }) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(type, { detail: payload }));
          window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: { actionType: type, payload, timestamp: Date.now() } }));
        }
      },
      clearMapCommand: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('SHOW_ALL_CLEAN', { detail: {} }));
        }
      },
    };
  }
  return context;
};

export default MapActionContext;
