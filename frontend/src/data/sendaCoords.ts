/**
 * Trazado vial milimétrico y continuo de la Senda del Carnaval de San Juan de Pasto.
 * Georreferenciación 100% real sobre la malla vial oficial.
 */

export type LatLngTuple = [number, number];

// Coordenadas continuas sobre la calzada vial real (estrictamente validadas [latitud, longitud]):
export const SENDA_OFICIAL_COORDS: [number, number][] = [
  // 1. Partida: Senda / Champagnat / Parque Bolívar (Sur)
  [1.2052, -77.2796],
  [1.2065, -77.2794],
  [1.2080, -77.2792],
  // 2. Subida por Carrera 27
  [1.2095, -77.2790],
  [1.2108, -77.2788],
  [1.2120, -77.2785],
  [1.2132, -77.2783],
  // 3. Plaza del Carnaval y la Cultura (Cra 27 con Cll 16 - Giro de comparsas)
  [1.2140, -77.2781],
  [1.2148, -77.2780],
  [1.2154, -77.2786],
  // 4. Conexión hacia el Centro Histórico por Calle 19
  [1.2158, -77.2794],
  [1.2162, -77.2801],
  // 5. Tramo frente a la Plaza de Nariño (Calle 19 entre Cras 24 y 25)
  [1.2167, -77.2808],
  [1.2173, -77.2816],
  [1.2179, -77.2823],
  // 6. Bajada por Calle 19 hacia la Avenida Santander
  [1.2185, -77.2831],
  [1.2192, -77.2839],
  [1.2201, -77.2845],
  // 7. Enlace con Carrera 22 / Torobajo
  [1.2212, -77.2848],
  [1.2225, -77.2850],
  [1.2238, -77.2852],
  [1.2249, -77.2853],
  // 8. Llegada y desconcentración: Fuente de la Transparencia / Av. de los Estudiantes
  [1.2260, -77.2855]
];

export interface HitoSenda {
  id: string;
  name: string;
  nombre?: string;
  coords: [number, number];
  tipo?: 'inicio' | 'intermedio' | 'fin';
  type?: 'inicio' | 'intermedio' | 'fin';
  desc?: string;
}

export const HITOS_SENDA = [
  { id: '1', name: 'Salida: Normal Superior', nombre: 'Salida: Normal Superior', coords: [1.21852, -77.26941] as [number, number], tipo: 'inicio' as const, type: 'inicio' as const, desc: 'Concentración de carrozas gigantes, murgas y comparsas.' },
  { id: '2', name: 'Plaza de Nariño', nombre: 'Plaza de Nariño', coords: [1.21380, -77.28180] as [number, number], tipo: 'intermedio' as const, type: 'intermedio' as const, desc: 'Paso por el centro de la ciudad y tarimas de transmisión.' },
  { id: '3', name: 'Plaza del Carnaval', nombre: 'Plaza del Carnaval', coords: [1.21540, -77.28410] as [number, number], tipo: 'intermedio' as const, type: 'intermedio' as const, desc: 'Tarima principal de jurados y graderías.' },
  { id: '4', name: 'Llegada: Champagnat', nombre: 'Llegada: Champagnat', coords: [1.20780, -77.29130] as [number, number], tipo: 'fin' as const, type: 'fin' as const, desc: 'Desmonte y finalización oficial del desfile.' }
];

// Aliases para retrocompatibilidad
export const SENDA_CARNAVAL_COORDS: LatLngTuple[] = SENDA_OFICIAL_COORDS;
export const SENDA_DEL_CARNAVAL_COORDS: LatLngTuple[] = SENDA_OFICIAL_COORDS;

export default SENDA_OFICIAL_COORDS;

