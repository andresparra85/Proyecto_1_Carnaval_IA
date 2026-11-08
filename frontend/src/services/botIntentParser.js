/**
 * Parser determinista de fechas e intenciones de la Senda del Carnaval para GuaneñaBot.
 * Detecta consultas sobre desfiles oficiales y genera acciones estructuradas de enrutamiento para el mapa.
 */

/**
 * Examina el texto del usuario para identificar solicitudes sobre fechas o desfiles del Carnaval.
 * @param {string} text Consulta o mensaje del usuario
 * @returns {{ matched: boolean, dayKey: '28' | '3' | '4' | '6' | null, action: { type: 'DRAW_DAY_ROUTE', day: string } | null, description: string }}
 */
export function parseBotIntent(text = '') {
  if (!text || typeof text !== 'string') {
    return { matched: false, dayKey: null, action: null, description: '' };
  }

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remueve tildes para matching robusto

  // 1. Detección de Arcoíris en el Asfalto (28 de Diciembre)
  if (/\b28\b|asfalto|arcoiris/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '28',
      action: { type: 'DRAW_DAY_ROUTE', day: '28' },
      description: 'Arcoíris en el Asfalto (28 de Diciembre) - Arte efímero en la Calle 18 y el Colorado',
    };
  }

  // 2. Detección de Canto a la Tierra (3 de Enero - Colectivos Coreográficos)
  if (/\b3\b|canto a la tierra|colectivos?/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '3',
      action: { type: 'DRAW_DAY_ROUTE', day: '3' },
      description: 'Canto a la Tierra (3 de Enero) - Desfile de Colectivos Coreográficos (Fuente de la Transparencia hacia Estadio Libertad/Normal)',
    };
  }

  // 3. Detección de Llegada de la Familia Castañeda (4 de Enero)
  if (/\b4\b|castaneda/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '4',
      action: { type: 'DRAW_DAY_ROUTE', day: '4' },
      description: 'Llegada de la Familia Castañeda (4 de Enero) - Apertura oficial del Carnaval por la Senda Magna',
    };
  }

  // 4. Detección de Desfile Magno / Día de Blancos / Senda General (6 de Enero)
  if (/\b6\b|magno|blancos?|carrozas?|senda/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '6',
      action: { type: 'DRAW_DAY_ROUTE', day: '6' },
      description: 'Desfile Magno - Día de Blancos (6 de Enero) - Monumentales carrozas por toda la Senda Magna',
    };
  }

  return { matched: false, dayKey: null, action: null, description: '' };
}

/**
 * Despacha el evento personalizado `DRAW_DAY_ROUTE` en el objeto window si hay coincidencia.
 * @param {string} text Mensaje del usuario
 * @returns {boolean} true si se despachó una acción de ruta válida
 */
export function dispatchParadeIntent(text) {
  const result = parseBotIntent(text);
  if (result.matched && result.action && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('DRAW_DAY_ROUTE', {
        detail: { day: result.dayKey, action: result.action },
      })
    );
    return true;
  }
  return false;
}

export default {
  parseBotIntent,
  dispatchParadeIntent,
};
