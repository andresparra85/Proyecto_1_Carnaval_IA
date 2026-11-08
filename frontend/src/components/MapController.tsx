import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapAction, MapCommand } from '../context/MapActionContext';
import { SENDA_OFICIAL_STREET_COORDS } from '../data/carnavalRoutesGeoJSON';

export interface MapControllerProps {
  onCommandExecuted?: (command: MapCommand) => void;
}

/**
 * Sub-componente interno para MapContainer de React-Leaflet.
 * Escucha comandos emitidos desde el contexto global MapActionContext o desde GuaneñaBot
 * y ejecuta transiciones de cámara fluidas y seguras sobre el canvas del mapa.
 */
export const MapController: React.FC<MapControllerProps> = ({ onCommandExecuted }) => {
  const map = useMap();
  const { mapCommand } = useMapAction();

  useEffect(() => {
    if (!map || !mapCommand) return;

    const { actionType, payload } = mapCommand;

    try {
      switch (actionType) {
        case 'FLY_TO': {
          if (payload?.coords) {
            const zoom = payload.zoom || 16;
            map.flyTo(payload.coords, zoom, { duration: 1.5 });
          }
          break;
        }

        case 'SHOW_SENDA': {
          const coords = payload?.coords || SENDA_OFICIAL_STREET_COORDS;
          const sendaBounds = L.latLngBounds(coords);
          map.fitBounds(sendaBounds, { padding: [50, 50], animate: true });
          break;
        }

        case 'FILTER_POIS': {
          if (payload?.coords) {
            const zoom = payload.zoom || 17;
            map.flyTo(payload.coords, zoom, { duration: 1.2 });
          }
          break;
        }

        case 'DRAW_ROUTE': {
          if (payload?.startCoords && payload?.targetCoords) {
            const routeBounds = L.latLngBounds([payload.startCoords, payload.targetCoords]);
            map.fitBounds(routeBounds, { padding: [70, 70], animate: true });
          } else if (payload?.targetCoords) {
            map.flyTo(payload.targetCoords, payload.zoom || 17, { duration: 1.2 });
          }
          break;
        }

        case 'CLEAR': {
          const defaultBounds = L.latLngBounds(SENDA_OFICIAL_STREET_COORDS);
          map.fitBounds(defaultBounds, { padding: [50, 50], animate: true });
          break;
        }

        default:
          break;
      }

      if (onCommandExecuted) {
        onCommandExecuted(mapCommand);
      }
    } catch (err) {
      console.warn('Error al ejecutar transición de cámara en MapController:', err);
    }
  }, [map, mapCommand, onCommandExecuted]);

  // Escucha secundaria de eventos directos en window para máxima interoperabilidad
  useEffect(() => {
    if (!map) return;

    const handleFlyToEvent = (e: any) => {
      const detail = e.detail;
      if (detail?.coords) {
        map.flyTo(detail.coords, detail.zoom || 16, { duration: 1.5 });
      }
    };

    const handleShowSendaEvent = (e: any) => {
      const detail = e.detail;
      const coords = detail?.coords || SENDA_OFICIAL_STREET_COORDS;
      const sendaBounds = L.latLngBounds(coords);
      map.fitBounds(sendaBounds, { padding: [50, 50], animate: true });
    };

    window.addEventListener('FLY_TO', handleFlyToEvent);
    window.addEventListener('SHOW_SENDA', handleShowSendaEvent);

    return () => {
      window.removeEventListener('FLY_TO', handleFlyToEvent);
      window.removeEventListener('SHOW_SENDA', handleShowSendaEvent);
    };
  }, [map]);

  return null;
};

export default MapController;
