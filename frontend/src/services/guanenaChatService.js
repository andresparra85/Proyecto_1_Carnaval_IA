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
      return {
        reply: data.reply || data.message || '¡Que viva Pasto, carajo! 🎭 ¿En qué más te puedo colaborar?',
        map_action: data.map_action || null,
      };
    }

    return {
      reply: '¡Que viva Pasto, carajo! 🎭 Recibí tu mensaje, paisano.',
      map_action: null,
    };
  } catch (error) {
    console.warn('Aviso: Backend de GuaneñaBot no disponible en', GUANENA_ENDPOINT, error?.message);

    // Fallback conversacional nariñense en caso de que el backend local esté apagado
    const lower = (message || '').toLowerCase();
    let mapAction = null;
    let reply = '¡Que viva Pasto, carajo! 🎭 Estoy lista para guiarte por toda la Senda del Carnaval.';

    if (lower.includes('4 de enero') || lower.includes('familia castañeda') || lower.includes('donde empieza') || lower.includes('dónde empieza')) {
      reply = '¡A la voz de una, paisano! 👨‍👩‍👦 El desfile de la Familia Castañeda del 4 de Enero inicia en la Av. Champagnat con Parque Bolívar y culmina en la Fuente de la Transparencia.\n¡Te he trazado la ruta peatonal vial exacta hacia el punto de partida en Champagnat!';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2052, -77.2796],
        target_name: 'Partida: Champagnat / Parque Bolívar',
        day_id: '04-ene',
      };
    } else if (lower.includes('6 de enero') || lower.includes('desfile magno')) {
      reply = '¡Que viva Pasto, carajo! 👑 El Desfile Magno del 6 de Enero concentra las monumentales carrozas en la Av. Champagnat.\n¡Ruta peatonal trazada directamente al punto de salida para que no te perdás nada!';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2052, -77.2796],
        target_name: 'Partida Oficial Champagnat',
        day_id: '06-ene',
      };
    } else if (lower.includes('3 de enero') || lower.includes('canto a la tierra')) {
      reply = '¡Que viva la tierra, carajo! 🌿 El Desfile de Colectivos Coreográficos del 3 de Enero sale desde Champagnat rumbo a la Plaza del Carnaval.\n¡Ruta hacia la concentración inicial trazada en el mapa!';
      mapAction = {
        action_type: 'ROUTE_TO_EVENT_START',
        target_coords: [1.2052, -77.2796],
        target_name: 'Partida: Champagnat / Colectivos',
        day_id: '03-ene',
      };
    } else if (lower.includes('baño') || lower.includes('sanitario')) {
      reply = '¡De una, paisano! 🚻 Las baterías sanitarias principales están habilitadas en la Plaza del Carnaval y en la Plaza de Nariño.\n¡Te he marcado la ruta a pie hacia los baños de la Plaza del Carnaval!';
      mapAction = {
        action_type: 'DRAW_ROUTE',
        target_coords: [1.2138, -77.2782],
        target_name: 'Baterías Sanitarias Plaza del Carnaval',
      };
    } else if (lower.includes('cuy') || lower.includes('comer') || lower.includes('restaurante')) {
      reply = '¡A comer sabroso en Pasto! 🍽️ Andá al sector del Centro y Plaza del Carnaval a probar cuy asado y empanadas de añejo.\n¡Ruta gastronómica peatonal trazada en el mapa!';
      mapAction = {
        action_type: 'DRAW_ROUTE',
        target_coords: [1.2132, -77.2798],
        target_name: 'Restaurante Tradicional Pastuso',
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
