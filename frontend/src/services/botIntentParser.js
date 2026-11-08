/**
 * Parser determinista de fechas e intenciones de la Senda del Carnaval para GuaneñaBot.
 * Detecta consultas sobre desfiles oficiales (del 2 al 7 de enero) y genera acciones estructuradas de enrutamiento para el mapa.
 */

/**
 * Examina el texto del usuario para identificar solicitudes sobre fechas o desfiles del Carnaval.
 * Analiza si pregunta por un día ('2', '3', '4', '5', '6', '7', 'carnavalito', 'canto a la tierra',
 * 'castañeda', 'negros', 'blancos', 'magno', 'cuy').
 * @param {string} text Consulta o mensaje del usuario
 * @returns {{ matched: boolean, dayKey: '2' | '3' | '4' | '5' | '6' | '7' | '28' | null, action: { type: 'DRAW_DAY_ROUTE', day: string } | null, description: string }}
 */
export function parseBotIntent(text = '') {
  if (!text || typeof text !== 'string') {
    return { matched: false, dayKey: null, action: null, description: '' };
  }

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remueve tildes para matching robusto

  // 1. Detección de Carnavalito (2 de Enero)
  if (/\b2\b|dos de enero|2 de enero|carnavalito|infantil/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '2',
      action: { type: 'DRAW_DAY_ROUTE', day: '2' },
      description: 'Carnavalito (2 de Enero) - Desfile infantil desde Parque Ambiental Rumipamba hasta Estadio Libertad',
    };
  }

  // 2. Detección de Canto a la Tierra (3 de Enero - Colectivos Coreográficos)
  if (/\b3\b|tres de enero|3 de enero|canto a la tierra|colectivos?/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '3',
      action: { type: 'DRAW_DAY_ROUTE', day: '3' },
      description: 'Canto a la Tierra (3 de Enero) - Desfile de Colectivos Coreográficos desde INEM / Champagnat hasta Estadio Libertad',
    };
  }

  // 3. Detección de Llegada de la Familia Castañeda (4 de Enero)
  if (/\b4\b|cuatro de enero|4 de enero|castaneda|familia/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '4',
      action: { type: 'DRAW_DAY_ROUTE', day: '4' },
      description: 'Llegada de la Familia Castañeda (4 de Enero) - Desde Capusigra / Champagnat hasta Fuente de la Transparencia',
    };
  }

  // 4. Detección de Día de Negros (5 de Enero)
  if (/\b5\b|cinco de enero|5 de enero|negros?|pintica|juego de identidad|tablados?/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '5',
      action: { type: 'DRAW_DAY_ROUTE', day: '5' },
      description: 'Día de Negros (5 de Enero) - Concentración y juego de identidad en Plaza de Nariño y Plaza del Carnaval',
    };
  }

  // 5. Detección de Desfile Magno / Día de Blancos (6 de Enero)
  if (/\b6\b|seis de enero|6 de enero|magno|blancos?|desfile magno|carrozas?|senda/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '6',
      action: { type: 'DRAW_DAY_ROUTE', day: '6' },
      description: 'Desfile Magno - Día de Blancos (6 de Enero) - Desde INEM / Capusigra hasta Fuente de la Transparencia',
    };
  }

  // 6. Detección de Festival del Cuy y la Cultura Campesina (7 de Enero)
  if (/\b7\b|siete de enero|7 de enero|cuy|gastronom|festival del cuy|catambuco|obonuco/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '7',
      action: { type: 'DRAW_DAY_ROUTE', day: '7' },
      description: 'Festival del Cuy (7 de Enero) - Senda gastronómica en los corregimientos de Catambuco y Obonuco',
    };
  }

  // 7. Detección de Arcoíris en el Asfalto (28 de Diciembre)
  if (/\b28\b|asfalto|arcoiris/i.test(normalized)) {
    return {
      matched: true,
      dayKey: '28',
      action: { type: 'DRAW_DAY_ROUTE', day: '28' },
      description: 'Arcoíris en el Asfalto (28 de Diciembre) - Arte efímero en la Calle 18 y el Colorado',
    };
  }

  return { matched: false, dayKey: null, action: null, description: '' };
}

/**
 * Despacha el evento personalizado `DRAW_DAY_ROUTE` y activa la Senda en el mapa si hay coincidencia.
 * @param {string} text Mensaje del usuario
 * @returns {boolean} true si se despachó una acción de ruta válida
 */
export function dispatchParadeIntent(text) {
  const result = parseBotIntent(text);
  if (result.matched && result.dayKey && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('DRAW_DAY_ROUTE', {
        detail: { day: result.dayKey, dayKey: result.dayKey, action: result.action },
      })
    );
    if (typeof window.activarSendaPorDia === 'function') {
      window.activarSendaPorDia(result.dayKey);
    }
    return true;
  }
  return false;
}

export default {
  parseBotIntent,
  dispatchParadeIntent,
};
