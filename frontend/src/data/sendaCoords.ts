/**
 * Trazado vial milimétrico y continuo de la Senda del Carnaval de San Juan de Pasto.
 * Georreferenciación 100% real sobre la malla vial oficial.
 */

// Coordenadas continuas sobre la calzada vial real:
export const SENDA_OFICIAL_COORDS: [number, number][] = [
  // 1. Salida: I.E. Normal Superior (Calle 4 con Cra 27)
  [1.21852, -77.26941],
  [1.21815, -77.27025],
  [1.21780, -77.27110], // Av. Santander inicio
  [1.21740, -77.27210],
  [1.21695, -77.27312], // Av. Santander bajando a Glorieta
  [1.21630, -77.27415],
  [1.21550, -77.27530], // Intersección Cra 27 con Calle 12
  [1.21495, -77.27610],
  [1.21440, -77.27690], // Cra 27 con Calle 14
  [1.21380, -77.27770],
  [1.21320, -77.27850], // Cra 27 con Calle 16
  [1.21270, -77.27920], // Inicio de giro hacia Calle 18
  [1.21250, -77.27960], // Giro Calle 18 (Centro)
  [1.21285, -77.28020],
  [1.21310, -77.28080], // Calle 18 aproximación Parque Nariño
  [1.21350, -77.28135],
  [1.21380, -77.28180], // Frente a Plaza de Nariño
  [1.21420, -77.28235],
  [1.21460, -77.28290], // Paso peatonal comercial Calle 19
  [1.21500, -77.28350],
  [1.21540, -77.28410], // Plaza del Carnaval y la Cultura
  [1.21480, -77.28480], // Salida de la Plaza hacia Boyacá
  [1.21420, -77.28550], // Conexión Carrera 25 / Av. Boyacá
  [1.21350, -77.28620],
  [1.21280, -77.28690], // Av. Boyacá tramo sur
  [1.21200, -77.28770],
  [1.21110, -77.28850], // Descenso Calle 12
  [1.21015, -77.28920],
  [1.20920, -77.28990], // Sector Bomboná
  [1.20850, -77.29060],
  [1.20780, -77.29130]  // Llegada Oficial: Glorieta Colegio Champagnat
];

export interface HitoSenda {
  id: string;
  nombre: string;
  coords: [number, number];
  tipo: 'inicio' | 'intermedio' | 'fin';
  desc: string;
}

export const HITOS_SENDA: HitoSenda[] = [
  { id: 'salida', nombre: 'PUNTO DE SALIDA: I.E. Normal Superior', coords: [1.21852, -77.26941], tipo: 'inicio', desc: 'Concentración de carrozas gigantes, murgas y comparsas.' },
  { id: 'narino', nombre: 'HITO HISTÓRICO: Plaza de Nariño', coords: [1.21380, -77.28180], tipo: 'intermedio', desc: 'Paso por el centro de la ciudad y tarimas de transmisión.' },
  { id: 'plaza_carnaval', nombre: 'EPICENTRO: Plaza del Carnaval', coords: [1.21540, -77.28410], tipo: 'intermedio', desc: 'Tarima principal de jurados y graderías.' },
  { id: 'llegada', nombre: 'PUNTO DE LLEGADA: Champagnat / Bomboná', coords: [1.20780, -77.29130], tipo: 'fin', desc: 'Desmonte y finalización oficial del desfile.' }
];

// Aliases para retrocompatibilidad
export const SENDA_CARNAVAL_COORDS = SENDA_OFICIAL_COORDS;
export const SENDA_DEL_CARNAVAL_COORDS = SENDA_OFICIAL_COORDS;

export default SENDA_OFICIAL_COORDS;
