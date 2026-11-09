/**
 * CarnavalIA - Gemini 2.5 Flash Carnaval API Service Client
 * Connects frontend components to the backend endpoint (/api/v1/carnaval/chat)
 * for AI conversational guidance and GIS route waypoint extraction.
 */

export interface ChatHistoryTurn {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface CarnavalChatResponse {
  reply: string;
  should_draw_route: boolean;
  waypoints: [number, number][]; // [lat, lng] pairs
  suggested_questions: string[];
}

// Canonical fallback waypoints for Pasto's official Senda del Carnaval
export const OFFICIAL_SENDA_WAYPOINTS: [number, number][] = [
  [1.2030, -77.2798], // Salida: I.E.M. Champagnat
  [1.2075, -77.2792], // Av. Las Américas
  [1.2110, -77.2785], // Entrada Carrera 27
  [1.2138, -77.2782], // Plaza del Carnaval y la Cultura
  [1.2155, -77.2795], // Conexión Calle 19
  [1.2168, -77.2805], // Plaza de Nariño
  [1.2210, -77.2825], // Av. Santander / Carrera 27 Norte
  [1.2260, -77.2855], // Llegada: Fuente de la Transparencia
];

const resolveBaseUrl = (): string => {
  try {
    const envUrl = (
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
      'http://localhost:8000'
    ).trim().replace(/\/+$/, '');

    // Strip trailing /api/v1 to avoid duplication
    return envUrl.endsWith('/api/v1') ? envUrl.replace(/\/api\/v1$/, '') : envUrl;
  } catch {
    return 'http://localhost:8000';
  }
};

/**
 * Sends a message and chat history to GuaneñaBot powered by Gemini 2.5 Flash.
 * @param message Natural language query from the user
 * @param history Conversation history turns
 * @returns Promise with reply, should_draw_route flag, waypoints, and suggested questions
 */
export async function sendMessageToGuanena(
  message: string,
  history: ChatHistoryTurn[] = []
): Promise<CarnavalChatResponse> {
  const trimmedMessage = (message || '').trim();
  if (!trimmedMessage) {
    return {
      reply: '¡Hola paisano! ¿En qué te puedo colaborar sobre la fiesta magna de Pasto?',
      should_draw_route: false,
      waypoints: [],
      suggested_questions: [
        '¿Cuál es el recorrido de la Senda?',
        '¿Qué desfile hay hoy?',
        '¿Dónde comer un buen cuy en Pasto?',
      ],
    };
  }

  const baseUrl = resolveBaseUrl();
  const endpoint = `${baseUrl}/api/v1/carnaval/chat`;

  const payload = {
    message: trimmedMessage,
    history: Array.isArray(history)
      ? history.map((turn) => ({
          role: turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user',
          content: turn.content || '',
        }))
      : [],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawWaypoints = Array.isArray(data.waypoints) ? data.waypoints : [];
      
      // Clean and ensure coordinates are valid [latitude, longitude] pairs
      const validWaypoints: [number, number][] = rawWaypoints
        .filter((pair: any) => Array.isArray(pair) && pair.length >= 2 && !isNaN(Number(pair[0])) && !isNaN(Number(pair[1])))
        .map((pair: any) => [Number(pair[0]), Number(pair[1])] as [number, number]);

      return {
        reply: data.reply || '¡Qué viva Pasto, carajo! Consulta procesada con éxito.',
        should_draw_route: Boolean(data.should_draw_route) && validWaypoints.length >= 2,
        waypoints: validWaypoints,
        suggested_questions: Array.isArray(data.suggested_questions) && data.suggested_questions.length > 0
          ? data.suggested_questions
          : [
              '¿Cuál es el recorrido de la Senda?',
              '¿Dónde queda la Plaza del Carnaval?',
              '¿Cómo llego a la Plaza de Nariño?',
            ],
      };
    }
  } catch (error: any) {
    console.warn(`[carnavalApi] Notice while contacting ${endpoint}:`, error?.message || error);
  }

  // Graceful deterministic offline fallback matching the Carnaval knowledge base
  const lower = trimmedMessage.toLowerCase();
  const isSendaQuery = lower.includes('senda') || lower.includes('recorrido') || lower.includes('ruta') || lower.includes('castañeda') || lower.includes('desfile');
  const isHospitalQuery = lower.includes('hospital') || lower.includes('salud') || lower.includes('medico') || lower.includes('médico') || lower.includes('urgencia');
  const isPlazaCarnaval = lower.includes('plaza del carnaval') || lower.includes('plaza carnaval');

  let reply = '¡Qué viva Pasto, carajo! 🎭 GuaneñaBot a tu servicio para vivir el Carnaval de Negros y Blancos.';
  let shouldDraw = false;
  let waypoints: [number, number][] = [];

  if (isSendaQuery) {
    reply = '¡Qué viva Pasto, carajo! 🎭 La Senda Oficial recorre 7 km desde la Normal / Champagnat por la Carrera 27, cruza la Plaza del Carnaval, la Calle 19, la Plaza de Nariño y culmina en la Fuente de la Transparencia.';
    shouldDraw = true;
    waypoints = OFFICIAL_SENDA_WAYPOINTS;
  } else if (isHospitalQuery) {
    reply = 'Ruta peatonal trazada hacia el centro de salud más cercano sobre el mapa.';
    shouldDraw = true;
    waypoints = [
      [1.2168, -77.2805],
      [1.2155, -77.2795],
      [1.2138, -77.2782],
      [1.2118, -77.2755],
    ];
  } else if (isPlazaCarnaval) {
    reply = 'La Plaza del Carnaval y la Cultura es el epicentro de la fiesta, las tarimas principales y la calificación de carrozas.';
    shouldDraw = true;
    waypoints = [
      [1.2168, -77.2805],
      [1.2155, -77.2795],
      [1.2138, -77.2782],
    ];
  }

  return {
    reply,
    should_draw_route: shouldDraw,
    waypoints,
    suggested_questions: [
      '¿Cuál es el recorrido de la Senda?',
      '¿Qué se celebra el 6 de Enero?',
      '¿Cómo llego a la Plaza del Carnaval?',
    ],
  };
}

export default {
  sendMessageToGuanena,
  OFFICIAL_SENDA_WAYPOINTS,
};
