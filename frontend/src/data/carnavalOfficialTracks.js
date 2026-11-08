/**
 * Coordenadas oficiales exactas esquina por esquina de San Juan de Pasto
 * para cada fecha oficial del Carnaval de Negros y Blancos.
 */

// 1. Senda Oficial Sur a Norte (4 de Enero Familia Castañeda y 6 de Enero Desfile Magno)
export const TRACK_SENDA_MAGNA = [
  [1.2030, -77.2798], // Salida: Glorieta Normal Superior / Champagnat
  [1.2052, -77.2796], // Carrera 27 con Calle 4
  [1.2075, -77.2793], // Carrera 27 con Calle 8
  [1.2098, -77.2790], // Carrera 27 con Calle 12
  [1.2120, -77.2786], // Carrera 27 con Calle 14
  [1.2138, -77.2782], // Carrera 27 con Calle 16 (Entrada Plaza del Carnaval)
  [1.2146, -77.2780], // Plaza del Carnaval y la Cultura
  [1.2152, -77.2787], // Giro hacia Calle 19
  [1.2159, -77.2797], // Calle 19 con Carrera 26
  [1.2165, -77.2806], // Calle 19 frente a Plaza de Nariño (Costado Sur)
  [1.2172, -77.2816], // Calle 19 con Carrera 24
  [1.2178, -77.2825], // Calle 19 con Carrera 23
  [1.2185, -77.2834], // Calle 19 bajando hacia Avenida Santander
  [1.2195, -77.2842], // Conexión Calle 19 con Avenida Santander
  [1.2212, -77.2848], // Avenida Santander / Carrera 22 con Calle 22
  [1.2232, -77.2851], // Carrera 22 frente al Hospital Departamental / Las Cuadras
  [1.2250, -77.2853], // Carrera 22 hacia glorieta
  [1.2265, -77.2856]  // Llegada: Fuente de la Transparencia / Av. de los Estudiantes
];

// 2. Canto a la Tierra (3 de Enero - Recorrido Inverso)
export const TRACK_CANTO_A_LA_TIERRA = [...TRACK_SENDA_MAGNA].reverse();

// 3. Arcoíris en el Asfalto (28 de Diciembre - Calle 18 y el Colorado)
export const TRACK_ARCOIRIS_ASFALTO = [
  [1.2142, -77.2760], // Calle 18 con Cra 29 (Sector Colorado)
  [1.2150, -77.2775], // Calle 18 con Cra 27
  [1.2160, -77.2792], // Calle 18 con Cra 25
  [1.2168, -77.2805]  // Plaza de Nariño
];

export const CARNAVAL_DAYS_MAP = {
  '28': {
    name: 'Arcoíris en el Asfalto (28 Dic)',
    track: TRACK_ARCOIRIS_ASFALTO,
    startName: 'Calle del Colorado',
    endName: 'Plaza de Nariño'
  },
  '3': {
    name: 'Canto a la Tierra (3 Ene)',
    track: TRACK_CANTO_A_LA_TIERRA,
    startName: 'Fuente de la Transparencia',
    endName: 'Normal Superior'
  },
  '4': {
    name: 'Llegada de la Familia Castañeda (4 Ene)',
    track: TRACK_SENDA_MAGNA,
    startName: 'Normal Superior',
    endName: 'Fuente de la Transparencia'
  },
  '6': {
    name: 'Desfile Magno - Día de Blancos (6 Ene)',
    track: TRACK_SENDA_MAGNA,
    startName: 'Normal Superior',
    endName: 'Fuente de la Transparencia'
  }
};

export default {
  TRACK_SENDA_MAGNA,
  TRACK_CANTO_A_LA_TIERRA,
  TRACK_ARCOIRIS_ASFALTO,
  CARNAVAL_DAYS_MAP
};
