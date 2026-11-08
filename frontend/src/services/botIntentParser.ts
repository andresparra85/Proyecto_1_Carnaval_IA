import { searchPastoPOI, PASTO_POIS, PointOfInterest, LatLngTuple } from '../data/pastoPOIs';
import { CARNAVAL_DAILY_TRACKS, CARNAVAL_DAYS_TRACKS, SENDA_OFICIAL_COORDS } from '../data/carnavalRoutesGeoJSON';
import { MapActionType, MapCommand } from '../context/MapActionContext';

export interface ParsedBotIntent {
  intentType: 'parade' | 'poi_search' | 'route_navigation' | 'general';
  mapCommand: {
    actionType: MapActionType | string;
    payload: any;
  };
  matchedPoi?: PointOfInterest | null;
  feedbackText: string;
}

/**
 * Normaliza cadenas para comparaciones semánticas libres de acentos y mayúsculas
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Procesa preguntas turísticas y mapea intenciones a comandos reactivos de mapa
 */
export function parseBotIntent(
  userMessage: string,
  userGps?: LatLngTuple | null
): ParsedBotIntent | null {
  if (!userMessage || typeof userMessage !== 'string') return null;

  const clean = normalizeText(userMessage);

  // 1. Detección de intenciones sobre Días y Recorridos de Desfiles (28 Dic al 7 Ene)
  const isParadeQuery =
    clean.includes('desfile') ||
    clean.includes('senda') ||
    clean.includes('recorrido') ||
    clean.includes('carroza') ||
    clean.includes('comparsa') ||
    clean.includes('ruta') ||
    clean.includes('arcoiris') ||
    clean.includes('anos viejos') ||
    clean.includes('carnavalito') ||
    clean.includes('canto a la tierra') ||
    clean.includes('castaneda') ||
    clean.includes('negros') ||
    clean.includes('blancos') ||
    clean.includes('magno') ||
    clean.includes('cuy') ||
    clean.includes('28 de dic') ||
    clean.includes('31 de dic') ||
    clean.includes('2 de ene') ||
    clean.includes('3 de ene') ||
    clean.includes('4 de ene') ||
    clean.includes('5 de ene') ||
    clean.includes('6 de ene') ||
    clean.includes('7 de ene');

  if (isParadeQuery && !clean.includes('como llego') && !clean.includes('donde comer') && !clean.includes('tengo hambre')) {
    let dayKey = 'jan_06';

    if (clean.includes('28') || clean.includes('arcoiris') || clean.includes('tiza')) {
      dayKey = 'dec_28';
    } else if (clean.includes('31') || clean.includes('anos viejos') || clean.includes('ano viejo')) {
      dayKey = 'dec_31';
    } else if (clean.includes('2 de ene') || clean.includes('carnavalito') || clean.includes('mercedes')) {
      dayKey = 'jan_02';
    } else if (clean.includes('3 de ene') || clean.includes('canto a la tierra') || clean.includes('coreografico') || clean.includes('pachamama')) {
      dayKey = 'jan_03';
    } else if (clean.includes('4 de ene') || clean.includes('castaneda') || clean.includes('familia')) {
      dayKey = 'jan_04';
    } else if (clean.includes('5 de ene') || clean.includes('dia de negros') || clean.includes('juego de identidad')) {
      dayKey = 'jan_05';
    } else if (clean.includes('6 de ene') || clean.includes('magno') || clean.includes('dia de blancos') || clean.includes('carrozas gigantes')) {
      dayKey = 'jan_06';
    } else if (clean.includes('7 de ene') || clean.includes('festival del cuy') || clean.includes('campesina') || clean.includes('obonuco') || clean.includes('catambuco')) {
      dayKey = 'jan_07';
    }

    const track = CARNAVAL_DAILY_TRACKS[dayKey as keyof typeof CARNAVAL_DAILY_TRACKS] || CARNAVAL_DAILY_TRACKS.jan_06;

    return {
      intentType: 'parade',
      mapCommand: {
        actionType: 'DRAW_SENDA',
        payload: {
          dayKey: track.id,
          track,
          coords: track.coords,
          name: track.name,
        },
      },
      feedbackText: `Para el ${track.date} (${track.name}): ${track.direction} (${track.lengthKm} km). Ruta trazada en el mapa.`,
    };
  }

  // 2. Detección de Gastronomía Típica Nariñense
  const isGastronomy =
    clean.includes('comer') ||
    clean.includes('cuy') ||
    clean.includes('frito') ||
    clean.includes('hambre') ||
    clean.includes('empanada') ||
    clean.includes('restaurante') ||
    clean.includes('almuerzo') ||
    clean.includes('gastronomia') ||
    clean.includes('helado de paila') ||
    clean.includes('cafe');

  if (isGastronomy) {
    const coords: [number, number] = [1.2132, -77.2798]; // Restaurante Rancho Grande
    return {
      intentType: 'poi_search',
      mapCommand: {
        actionType: 'FILTER_POIS',
        payload: {
          category: 'restaurantes',
          coords,
          zoom: 17,
          name: 'Restaurante Rancho Grande / Gastronomía Nariñense',
        },
      },
      feedbackText: `Encuentras cuy típico en el sector de Bombona y en el Parque Bolívar. Marcadores ubicados en el mapa.`,
    };
  }

  // 3. Detección de Baterías Sanitarias y Baños Públicos
  const isBathroom =
    clean.includes('bano') ||
    clean.includes('sanitario') ||
    clean.includes('orinar') ||
    clean.includes('bateria sanitaria') ||
    clean.includes('necesidad');

  if (isBathroom) {
    const coords: [number, number] = [1.2145, -77.2845]; // Plaza del Carnaval
    return {
      intentType: 'poi_search',
      mapCommand: {
        actionType: 'FILTER_POIS',
        payload: {
          category: 'banos',
          coords,
          zoom: 18,
          name: 'Batería Sanitaria Plaza del Carnaval',
        },
      },
      feedbackText: `Baterías sanitarias activas en Plaza del Carnaval y Plaza de Nariño. Marcadores ubicados en el mapa.`,
    };
  }

  // 4. Detección de Salud y Primeros Auxilios (Cruz Roja / Defensa Civil)
  const isHealth =
    clean.includes('salud') ||
    clean.includes('cruz roja') ||
    clean.includes('primeros auxilios') ||
    clean.includes('ambulancia') ||
    clean.includes('hospital') ||
    clean.includes('medico') ||
    clean.includes('urgencia') ||
    clean.includes('curacion');

  if (isHealth) {
    const coords: [number, number] = [1.2158, -77.2835]; // Cruz Roja Plaza del Carnaval
    return {
      intentType: 'poi_search',
      mapCommand: {
        actionType: 'FILTER_POIS',
        payload: {
          category: 'salud',
          coords,
          zoom: 18,
          name: 'Puesto de Salud Cruz Roja Plaza del Carnaval',
        },
      },
      feedbackText: `Puestos de primeros auxilios y triage de la Cruz Roja ubicados en Plaza del Carnaval y Plaza de Nariño.`,
    };
  }

  // 5. Detección de Seguridad y CAI Policía Nacional
  const isPolice =
    clean.includes('cai') ||
    clean.includes('policia') ||
    clean.includes('seguridad') ||
    clean.includes('robo') ||
    clean.includes('extraviado') ||
    clean.includes('perdido') ||
    clean.includes('denuncia');

  if (isPolice) {
    const coords: [number, number] = [1.2155, -77.2839]; // CAI Plaza del Carnaval
    return {
      intentType: 'poi_search',
      mapCommand: {
        actionType: 'FILTER_POIS',
        payload: {
          category: 'cai',
          coords,
          zoom: 18,
          name: 'CAI Plaza del Carnaval Policía Nacional',
        },
      },
      feedbackText: `CAI de Policía Nacional disponible en Plaza del Carnaval y Parque Nariño. Marcadores ubicados en el mapa.`,
    };
  }

  // 6. Detección de "¿Cómo llego a...?"
  const isRouteQuery =
    clean.includes('como llego') ||
    clean.includes('como llegar') ||
    clean.includes('llegar a') ||
    clean.includes('ir a') ||
    clean.includes('ruta a pie') ||
    clean.includes('camino a');

  if (isRouteQuery) {
    const matchedPoi = searchPastoPOI(userMessage) || PASTO_POIS[0];
    const start: LatLngTuple = userGps || [1.2138, -77.2818];
    const target: LatLngTuple = matchedPoi.coords;

    return {
      intentType: 'route_navigation',
      matchedPoi,
      mapCommand: {
        actionType: 'DRAW_ROUTE',
        payload: {
          startCoords: start,
          targetCoords: target,
          targetName: matchedPoi.name,
          category: matchedPoi.category,
        },
      },
      feedbackText: `¡Con mucho gusto! He trazado la ruta peatonal más corta hacia ${matchedPoi.name} en el mapa interactivo.`,
    };
  }

  return null;
}

/**
 * Despacha el comando del parser a través de contexto o evento global
 */
export function dispatchIntentCommand(
  parsed: ParsedBotIntent,
  dispatchContext?: (command: { actionType: string; payload?: any }) => void
) {
  if (!parsed || !parsed.mapCommand) return;

  const { actionType, payload } = parsed.mapCommand;

  if (dispatchContext) {
    dispatchContext({ actionType, payload });
  }

  if (typeof window !== 'undefined') {
    const fullCommand: MapCommand = {
      actionType: actionType as MapActionType,
      payload,
      timestamp: Date.now(),
    };
    window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
    window.dispatchEvent(new CustomEvent(actionType, { detail: payload }));
  }
}

export default parseBotIntent;
