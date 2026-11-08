/**
 * Cliente de servicio API para el Asistente Virtual GuaneñaBot
 * Conecta el chat con el endpoint de IA del backend (/api/v1/chat/guanena)
 * y despacha acciones sobre el mapa interactivo de CarnavalIA.
 */
import axios from 'axios';

const BASE_URL = (
  (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
  'http://localhost:8000'
).replace(/\/+$/, '');

const GUANENA_ENDPOINT = `${BASE_URL.endsWith('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`}/chat/guanena`;

/**
 * Envía un mensaje a GuaneñaBot junto con la georreferenciación del usuario.
 * @param {string} message - Texto o consulta del usuario
 * @param {number} userLat - Latitud GPS del usuario
 * @param {number} userLng - Longitud GPS del usuario
 * @returns {Promise<{ reply: string, map_action: any }>}
 */
export async function sendGuanenaMessage(message, userLat, userLng) {
  const payload = {
    message: message || '',
    user_lat: typeof userLat === 'number' ? userLat : 1.2168,
    user_lng: typeof userLng === 'number' ? userLng : -77.2805,
  };

  try {
    const response = await axios.post(GUANENA_ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000,
    });

    const data = response?.data;
    if (data && typeof data === 'object') {
      let rawReply = data.reply || data.message || 'Consulta procesada en el mapa.';
      rawReply = rawReply.replace(/¡?Que viva Pasto,?\s*carajo!?[^.\n]*[.\n]*/gi, '').trim();
      return {
        reply: rawReply || 'Consulta procesada en el mapa.',
        map_action: data.map_action || null,
      };
    }

    return {
      reply: 'Consulta procesada en el mapa.',
      map_action: null,
    };
  } catch (error) {
    console.warn('Aviso: Backend de GuaneñaBot no disponible en', GUANENA_ENDPOINT, error?.message);

    // Fallback conversacional ultra concreto (máximo 2 líneas, sin relleno ni introducciones largas)
    const lower = (message || '').toLowerCase();
    let mapAction = null;
    let reply = 'Consulta procesada. Revisa los marcadores y trazados en el mapa.';

    if (lower.includes('4 de enero') || lower.includes('familia castañeda') || lower.includes('castaneda') || lower.includes('donde empieza') || lower.includes('dónde empieza')) {
      reply = 'El 4 de enero es la Llegada de la Familia Castañeda. Recorrido trazado en el mapa de Sur (Champagnat) a Norte (Av. Estudiantes).';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2030, -77.2798],
        target_name: 'Partida: Champagnat / Parque Bolívar',
        day_id: '4',
      };
    } else if (lower.includes('6 de enero') || lower.includes('desfile magno') || lower.includes('blancos') || lower.includes('carroza')) {
      reply = 'El 6 de enero es el Desfile Magno de Blancos con Carrozas Gigantes. Ruta oficial trazada en el mapa.';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2030, -77.2798],
        target_name: 'Partida Oficial Champagnat',
        day_id: '6',
      };
    } else if (lower.includes('3 de enero') || lower.includes('canto a la tierra') || lower.includes('colectivo')) {
      reply = 'El 3 de enero es Canto a la Tierra con colectivos coreográficos. Recorrido trazado en el mapa hacia el Estadio Libertad.';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2030, -77.2798],
        target_name: 'Partida: Champagnat / Colectivos',
        day_id: '3',
      };
    } else if (lower.includes('2 de enero') || lower.includes('carnavalito')) {
      reply = 'El 2 de enero es el Carnavalito. Desfile infantil trazado desde Rumipamba hasta el Estadio Libertad.';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2225, -77.2795],
        target_name: 'Partida: Parque Rumipamba',
        day_id: '2',
      };
    } else if (lower.includes('5 de enero') || lower.includes('negros') || lower.includes('pintica')) {
      reply = 'El 5 de enero es el Día de Negros. Plazas y tablados principales activos en el mapa.';
      mapAction = {
        action_type: 'DRAW_DAY_ROUTE',
        day_id: '5',
      };
    } else if (lower.includes('baño') || lower.includes('sanitario')) {
      reply = 'Baterías sanitarias activas en Plaza del Carnaval y Plaza de Nariño. Marcadores ubicados en el mapa.';
      mapAction = {
        action_type: 'DRAW_ROUTE',
        target_coords: [1.2138, -77.2782],
        target_name: 'Baterías Sanitarias Plaza del Carnaval',
      };
    } else if (lower.includes('cuy') || lower.includes('comer') || lower.includes('restaurante') || lower.includes('comida') || lower.includes('almuerzo')) {
      reply = 'Encuentras cuy típico en el sector de Bombona y en el Parque Bolívar. Marcadores ubicados en el mapa.';
      mapAction = {
        action_type: 'DRAW_ROUTE',
        target_coords: [1.2132, -77.2798],
        target_name: 'Restaurante Tradicional Pastuso',
      };
    } else if (lower.includes('senda') || lower.includes('recorrido') || lower.includes('ruta') || lower.includes('desfile')) {
      reply = 'Ruta oficial de la Senda del Carnaval trazada de Sur a Norte (Champagnat a Fuente de la Transparencia).';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2030, -77.2798],
        target_name: 'Salida Champagnat',
        day_id: '6',
      };
    }

    return {
      reply,
      map_action: mapAction,
    };
  }
}

export default {
  sendGuanenaMessage,
};
