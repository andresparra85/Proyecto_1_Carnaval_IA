/**
 * Catálogo oficial de waypoints y eventos del 2 al 7 de enero
 * para el Carnaval de Negros y Blancos de San Juan de Pasto.
 * Formato waypoints: [longitud, latitud] para consumo en OSRM.
 */

export const CARNAVAL_DAYS_CONFIG = {
  '2': {
    name: 'Carnavalito (2 de Enero)',
    startName: 'Parque Ambiental Rumipamba',
    endName: 'Estadio Departamental Libertad',
    waypoints: [
      [-77.2795, 1.2225], // Parque Rumipamba
      [-77.2788, 1.2180], // Conexión Carrera 27
      [-77.2782, 1.2138], // Plaza del Carnaval
      [-77.2760, 1.2085], // Bajada hacia Estadio
      [-77.2715, 1.2025]  // Estadio Libertad
    ]
  },
  '3': {
    name: 'Canto a la Tierra (3 de Enero)',
    startName: 'I.E.M. INEM / Normal Superior',
    endName: 'Estadio Departamental Libertad',
    waypoints: [
      [-77.2800, 1.2030], // Salida INEM / Champagnat
      [-77.2790, 1.2098], // Cra 27 con Cll 12
      [-77.2782, 1.2138], // Plaza del Carnaval
      [-77.2750, 1.2070], // Conexión hacia San Vicente
      [-77.2715, 1.2025]  // Estadio Libertad
    ]
  },
  '4': {
    name: 'Llegada de la Familia Castañeda (4 de Enero)',
    startName: 'Capusigra / Champagnat',
    endName: 'Fuente de la Transparencia / Av. Estudiantes',
    waypoints: [
      [-77.2798, 1.2045], // Capusigra / Champagnat
      [-77.2790, 1.2098], // Cra 27 con Cll 12
      [-77.2782, 1.2138], // Plaza del Carnaval
      [-77.2797, 1.2159], // Giro Cll 19
      [-77.2806, 1.2165], // Plaza de Nariño
      [-77.2848, 1.2212], // Av. Santander / Cra 22
      [-77.2856, 1.2265]  // Fuente de la Transparencia
    ]
  },
  '5': {
    name: 'Día de Negros (5 de Enero)',
    type: 'PLAZAS',
    description: 'Día de juego de identidad. Concentración en plazas principales.',
    points: [
      { name: 'Plaza de Nariño', coords: [1.2168, -77.2805] },
      { name: 'Plaza del Carnaval', coords: [1.2140, -77.2780] }
    ]
  },
  '6': {
    name: 'Desfile Magno - Día de Blancos (6 de Enero)',
    startName: 'I.E.M. INEM / Capusigra',
    endName: 'Fuente de la Transparencia',
    waypoints: [
      [-77.2800, 1.2030], // INEM / Champagnat
      [-77.2790, 1.2098], // Cra 27 con Cll 12
      [-77.2782, 1.2138], // Plaza del Carnaval
      [-77.2797, 1.2159], // Giro hacia Cll 19
      [-77.2806, 1.2165], // Frente a Plaza de Nariño
      [-77.2834, 1.2185], // Cll 19 bajando
      [-77.2848, 1.2212], // Av. Santander
      [-77.2856, 1.2265]  // Fuente de la Transparencia
    ]
  },
  '7': {
    name: 'Festival del Cuy (7 de Enero)',
    type: 'CORREGIMIENTOS',
    description: 'Senda gastronómica en los corregimientos de Pasto.',
    points: [
      { name: 'Catambuco', coords: [1.1680, -77.2850] },
      { name: 'Obonuco', coords: [1.1960, -77.3050] }
    ]
  }
};

export default CARNAVAL_DAYS_CONFIG;
