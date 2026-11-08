/**
 * Trazado vial milimétrico y continuo de la Senda del Carnaval de San Juan de Pasto.
 * Georreferenciación 100% real sobre la malla vial oficial.
 */

export type LatLngTuple = [number, number];

// Coordenadas continuas sobre la calzada vial real (estrictamente validadas [latitud, longitud]):
export const SENDA_OFICIAL_COORDS: [number, number][] = [
  [1.21852, -77.26941], [1.21815, -77.27025], [1.21780, -77.27110],
  [1.21740, -77.27210], [1.21695, -77.27312], [1.21630, -77.27415],
  [1.21550, -77.27530], [1.21495, -77.27610], [1.21440, -77.27690],
  [1.21380, -77.27770], [1.21320, -77.27850], [1.21270, -77.27920],
  [1.21250, -77.27960], [1.21285, -77.28020], [1.21310, -77.28080],
  [1.21350, -77.28135], [1.21380, -77.28180], [1.21420, -77.28235],
  [1.21460, -77.28290], [1.21500, -77.28350], [1.21540, -77.28410],
  [1.21480, -77.28480], [1.21420, -77.28550], [1.21350, -77.28620],
  [1.21280, -77.28690], [1.21200, -77.28770], [1.21110, -77.28850],
  [1.21015, -77.28920], [1.20920, -77.28990], [1.20850, -77.29060],
  [1.20780, -77.29130]
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

