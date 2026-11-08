/**
 * Hitos secuenciales de paso obligatorio para forzar a OSRM
 * a generar el trazado exacto sobre el corredor del Carnaval de Pasto.
 * Formato OSRM: [longitud, latitud]
 */

// 1. Senda Oficial Sur a Norte (4 y 6 de Enero: Champagnat a Fuente de la Transparencia)
export const WAYPOINTS_SENDA_MAGNA = [
  [-77.2798, 1.2030], // 1. Partida: Senda Sur / Normal Superior Champagnat
  [-77.2790, 1.2098], // 2. Carrera 27 con Calle 12
  [-77.2782, 1.2138], // 3. Plaza del Carnaval y la Cultura (Cra 27 con Cll 16)
  [-77.2797, 1.2159], // 4. Conexión Carrera 26 con Calle 19
  [-77.2806, 1.2165], // 5. Calle 19 frente a Plaza de Nariño
  [-77.2834, 1.2185], // 6. Calle 19 con Carrera 23 (hacia Av. Santander)
  [-77.2848, 1.2212], // 7. Avenida Santander / Carrera 22
  [-77.2856, 1.2265], // 8. Llegada: Fuente de la Transparencia / Av. Estudiantes
];

// 2. Canto a la Tierra (3 de Enero - Recorrido Inverso: Norte a Sur)
export const WAYPOINTS_CANTO_TIERRA = [...WAYPOINTS_SENDA_MAGNA].reverse();

// 3. Arcoíris en el Asfalto (28 de Diciembre - Calle 18 y el Colorado)
export const WAYPOINTS_ARCOIRIS = [
  [-77.2760, 1.2142], // Calle 18 con Cra 29 (Sector Colorado)
  [-77.2775, 1.2150], // Calle 18 con Cra 27
  [-77.2792, 1.2160], // Calle 18 con Cra 25
  [-77.2805, 1.2168], // Plaza de Nariño
];

export const CARNAVAL_KEY_WAYPOINTS = {
  '28': WAYPOINTS_ARCOIRIS,
  '3': WAYPOINTS_CANTO_TIERRA,
  '4': WAYPOINTS_SENDA_MAGNA,
  '6': WAYPOINTS_SENDA_MAGNA,
};

export default {
  WAYPOINTS_SENDA_MAGNA,
  WAYPOINTS_CANTO_TIERRA,
  WAYPOINTS_ARCOIRIS,
  CARNAVAL_KEY_WAYPOINTS,
};
