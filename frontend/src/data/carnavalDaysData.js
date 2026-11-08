/**
 * Catálogo oficial de waypoints y eventos del 2 al 7 de enero
 * para el Carnaval de Negros y Blancos de San Juan de Pasto.
 * Formato waypoints: [longitud, latitud] para consumo en OSRM.
 * Formato track: [latitud, longitud] verificado calle por calle para renderizado síncrono instantáneo.
 */

export const TRACK_SENDA_DIRECTO = [
  [1.2030, -77.2798], // Salida: Normal Superior / Champagnat
  [1.2052, -77.2796], // Cra 27 con Cll 4
  [1.2075, -77.2793], // Cra 27 con Cll 8
  [1.2098, -77.2790], // Cra 27 con Cll 12
  [1.2120, -77.2786], // Cra 27 con Cll 14
  [1.2138, -77.2782], // Plaza del Carnaval (Cra 27 con Cll 16)
  [1.2146, -77.2780],
  [1.2152, -77.2787], // Giro a Cll 19
  [1.2159, -77.2797], // Cll 19 con Cra 26
  [1.2165, -77.2806], // Plaza de Nariño
  [1.2172, -77.2816], // Cll 19 con Cra 24
  [1.2178, -77.2825], // Cll 19 con Cra 23
  [1.2185, -77.2834], // Cll 19 hacia Av Santander
  [1.2195, -77.2842], // Av Santander
  [1.2212, -77.2848], // Cra 22 con Cll 22
  [1.2232, -77.2851], // Cra 22 Las Cuadras
  [1.2250, -77.2853],
  [1.2265, -77.2856]  // Llegada: Fuente de la Transparencia
];

export const TRACK_SENDA_OFICIAL_CALLES = [
  [1.2030, -77.2798], // Salida: Glorieta Normal Superior / Champagnat
  [1.2045, -77.2797],
  [1.2060, -77.2795],
  [1.2075, -77.2793], // Cra 27 con Cll 8
  [1.2090, -77.2791],
  [1.2105, -77.2789], // Cra 27 con Cll 12
  [1.2120, -77.2786], // Cra 27 con Cll 14
  [1.2138, -77.2782], // Cra 27 con Cll 16 (Entrada Plaza del Carnaval)
  [1.2146, -77.2780], // Plaza del Carnaval y la Cultura
  [1.2152, -77.2787], // Giro Calle 19
  [1.2159, -77.2797], // Cll 19 con Cra 26
  [1.2165, -77.2806], // Cll 19 frente a Plaza de Nariño
  [1.2172, -77.2816], // Cll 19 con Cra 24
  [1.2178, -77.2825], // Cll 19 con Cra 23
  [1.2185, -77.2834], // Cll 19 hacia Av Santander
  [1.2195, -77.2842], // Enlace Av Santander
  [1.2212, -77.2848], // Cra 22 con Cll 22
  [1.2232, -77.2851], // Cra 22 frente al Hospital / Las Cuadras
  [1.2250, -77.2853], // Cra 22 hacia glorieta
  [1.2265, -77.2856]  // Llegada: Fuente de la Transparencia
];

export const TRACK_CARNAVALITO_CALLES = [
  [1.2225, -77.2795], // Parque Rumipamba
  [1.2180, -77.2788], // Conexión Carrera 27
  [1.2138, -77.2782], // Plaza del Carnaval
  [1.2085, -77.2760], // Bajada hacia Estadio
  [1.2025, -77.2715]  // Estadio Libertad
];

export const CARNAVAL_DAYS_CONFIG = {
  '2': {
    name: 'Carnavalito (2 de Enero)',
    startName: 'Parque Ambiental Rumipamba',
    endName: 'Estadio Departamental Libertad',
    track: TRACK_CARNAVALITO_CALLES,
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
    track: TRACK_SENDA_OFICIAL_CALLES.slice().reverse(),
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
    track: TRACK_SENDA_OFICIAL_CALLES,
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
    track: TRACK_SENDA_OFICIAL_CALLES,
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
