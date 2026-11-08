import { searchPastoPOI, PASTO_POIS, PointOfInterest, LatLngTuple } from '../data/pastoPOIs';
import { SENDA_OFICIAL_STREET_COORDS } from '../data/carnavalRoutesGeoJSON';
import { MapActionType, MapCommand } from '../context/MapActionContext';

export interface ParsedBotIntent {
  intentType: 'parade' | 'poi_search' | 'route_navigation' | 'general';
  mapCommand: {
    actionType: MapActionType;
    payload: any;
  };
  matchedPoi?: PointOfInterest | null;
  feedbackText: string;
}

/**
 * Normaliza cadenas para comparaciones semánticas libres de acentos y mayúsculas
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parser semántico de intenciones para GuaneñaBot.
 * Interpreta el mensaje del usuario y lo transforma en comandos ejecutables para el mapa.
 */
export function parseBotIntent(
  userMessage: string,
  userGps?: LatLngTuple | null
): ParsedBotIntent | null {
  if (!userMessage || typeof userMessage !== 'string') return null;

  const clean = normalizeText(userMessage);

  // 1. Detección de intención: Ruta / "¿Cómo llego a...?"
  const isRouteQuery =
    clean.includes('como llego') ||
    clean.includes('como llegar') ||
    clean.includes('llegar a') ||
    clean.includes('ir a') ||
    clean.includes('ruta a pie') ||
    clean.includes('camino a') ||
    clean.includes('guiame a') ||
    clean.includes('llevarme a');

  if (isRouteQuery) {
    const matchedPoi = searchPastoPOI(userMessage) || PASTO_POIS[0];
    const start: LatLngTuple = userGps || [1.2138, -77.2818]; // Plaza Nariño por defecto si no hay GPS
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
      feedbackText: `¡A la orden, paisano! He trazado la ruta peatonal más corta hacia ${matchedPoi.name} en el mapa interactivo.`,
    };
  }

  // 2. Detección de intención: Desfiles y Recorrido de la Senda Oficial
  const isParadeQuery =
    clean.includes('desfile') ||
    clean.includes('senda') ||
    clean.includes('carroza') ||
    clean.includes('comparsa') ||
    clean.includes('canto a la tierra') ||
    clean.includes('castaneda') ||
    clean.includes('negros y blancos') ||
    clean.includes('magno') ||
    clean.includes('recorrido') ||
    clean.includes('6 de enero') ||
    clean.includes('3 de enero') ||
    clean.includes('4 de enero') ||
    clean.includes('5 de enero');

  if (isParadeQuery) {
    let dayId = '06-ene';
    if (clean.includes('3 de enero') || clean.includes('canto a la tierra')) dayId = '03-ene';
    else if (clean.includes('4 de enero') || clean.includes('castaneda')) dayId = '04-ene';
    else if (clean.includes('5 de enero') || clean.includes('dia de negros')) dayId = '05-ene';

    return {
      intentType: 'parade',
      mapCommand: {
        actionType: 'SHOW_SENDA',
        payload: {
          coords: SENDA_OFICIAL_STREET_COORDS,
          startCoords: [1.2055, -77.2798], // Champagnat / Bolívar
          dayId,
        },
      },
      feedbackText: `¡Que viva Pasto, carajo! 🎭 Te he enfocado en el mapa el recorrido oficial de la Senda del Carnaval para el desfile.`,
    };
  }

  // 3. Detección de intención: Búsqueda de POIs (Restaurantes, Baños, Salud, Policía)
  const isBathroom =
    clean.includes('bano') ||
    clean.includes('sanitario') ||
    clean.includes('orinar') ||
    clean.includes('bateria sanitaria');

  const isHealth =
    clean.includes('salud') ||
    clean.includes('medic') ||
    clean.includes('urgencia') ||
    clean.includes('cruz roja') ||
    clean.includes('primeros auxilios') ||
    clean.includes('hospital') ||
    clean.includes('ambulancia');

  const isFood =
    clean.includes('restaurante') ||
    clean.includes('comer') ||
    clean.includes('cuy') ||
    clean.includes('frito') ||
    clean.includes('almuerzo') ||
    clean.includes('hambre') ||
    clean.includes('empanada') ||
    clean.includes('cafe');

  const isPolice =
    clean.includes('policia') ||
    clean.includes('cai') ||
    clean.includes('seguridad') ||
    clean.includes('robo') ||
    clean.includes('extraviado');

  if (isBathroom || isHealth || isFood || isPolice) {
    const matchedPoi = searchPastoPOI(userMessage);
    const category = isBathroom ? 'bano' : isHealth ? 'salud' : isFood ? 'restaurante' : 'cai';
    const fallbackPoi = PASTO_POIS.find((p) => p.category === category) || PASTO_POIS[0];
    const targetPoi = matchedPoi || fallbackPoi;

    return {
      intentType: 'poi_search',
      matchedPoi: targetPoi,
      mapCommand: {
        actionType: 'FLY_TO',
        payload: {
          coords: targetPoi.coords,
          zoom: 17,
          name: targetPoi.name,
          category: targetPoi.category,
        },
      },
      feedbackText: `¡Claro que sí! He localizado ${targetPoi.name} en el mapa y enfocado la cámara para que te ubiques al instante.`,
    };
  }

  return null;
}

/**
 * Despachador omnicanal de comandos de intención hacia el mapa
 */
export function dispatchIntentCommand(
  parsed: ParsedBotIntent,
  dispatchContext?: (command: { actionType: MapActionType; payload?: any }) => void
) {
  if (!parsed || !parsed.mapCommand) return;

  const { actionType, payload } = parsed.mapCommand;

  // 1. Despacho a través de React Context si se suministra
  if (dispatchContext) {
    dispatchContext({ actionType, payload });
  }

  // 2. Emisión global omnicanal en window
  if (typeof window !== 'undefined') {
    const fullCommand: MapCommand = {
      actionType,
      payload,
      timestamp: Date.now(),
    };
    window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
    window.dispatchEvent(new CustomEvent(actionType, { detail: payload }));

    // Disparos complementarios de compatibilidad con componentes existentes
    if (actionType === 'SHOW_SENDA') {
      window.dispatchEvent(new CustomEvent('focus-senda', { detail: payload }));
      if (payload?.dayId) {
        window.dispatchEvent(new CustomEvent('focus-carnival-day', { detail: { dayId: payload.dayId } }));
      }
    } else if (actionType === 'DRAW_ROUTE') {
      window.dispatchEvent(new CustomEvent('route-to-poi', { detail: payload }));
    }
  }
}

export default parseBotIntent;
