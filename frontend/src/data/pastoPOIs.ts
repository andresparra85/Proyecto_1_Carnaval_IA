/**
 * Catálogo georreferenciado de Puntos de Interés (POI) reales en San Juan de Pasto
 * para la experiencia guiada por IA en el Carnaval de Negros y Blancos.
 */

export type LatLngTuple = [number, number];

export interface PointOfInterest {
  id: string;
  name: string;
  category: 'restaurante' | 'bano' | 'cai' | 'salud';
  coords: LatLngTuple;
  address: string;
  description: string;
  schedule?: string;
  phone?: string;
}

export const PASTO_POIS: PointOfInterest[] = [
  // Restaurantes Tradicionales y Abiertos
  {
    id: 'rest-1',
    name: 'Restaurante Rancho Grande',
    category: 'restaurante',
    coords: [1.2132, -77.2798],
    address: 'Calle 18 # 25-30 Centro',
    description: 'Platos típicos nariñenses, cuy y cocina tradicional.',
    schedule: '8:00 AM - 11:00 PM',
  },
  {
    id: 'rest-2',
    name: 'Café San Sebastián',
    category: 'restaurante',
    coords: [1.2141, -77.2821],
    address: 'Frente a Plaza de Nariño',
    description: 'Cafetería de especialidad nariñense y pastelería.',
    schedule: '7:00 AM - 10:00 PM',
  },
  {
    id: 'rest-3',
    name: 'Asadero y Picantería La Merced',
    category: 'restaurante',
    coords: [1.2152, -77.2838],
    address: 'Cerca a Plaza del Carnaval',
    description: 'Fritada pastusa, empanadas de añejo y almuerzos.',
    schedule: '9:00 AM - 11:30 PM',
  },
  {
    id: 'rest-4',
    name: 'El Galpón Criollo',
    category: 'restaurante',
    coords: [1.2175, -77.2715],
    address: 'Av. Santander con Cra 27',
    description: 'Almuerzos ejecutivos y parrillada tradicional.',
    schedule: '8:00 AM - 9:00 PM',
  },

  // Baños Públicos y Baterías Sanitarias de Emergencia
  {
    id: 'bano-1',
    name: 'Batería Sanitaria Plaza del Carnaval',
    category: 'bano',
    coords: [1.2153, -77.2843],
    address: 'Costado Sur Plaza del Carnaval',
    description: 'Módulo de baños públicos habilitados para el evento.',
    schedule: '24 Horas',
  },
  {
    id: 'bano-2',
    name: 'Batería Sanitaria Plaza de Nariño',
    category: 'bano',
    coords: [1.2139, -77.2816],
    address: 'Parque Nariño - Cra 25',
    description: 'Baños públicos municipales.',
    schedule: '6:00 AM - 10:00 PM',
  },
  {
    id: 'bano-3',
    name: 'Servicios Sanitarios Normal Superior',
    category: 'bano',
    coords: [1.2184, -77.2696],
    address: 'Calle 4 con Cra 27',
    description: 'Baterías móviles en zona de concentración de carrozas.',
    schedule: 'Durante eventos',
  },

  // Seguridad y CAIs Policía Nacional
  {
    id: 'cai-1',
    name: 'CAI Plaza del Carnaval',
    category: 'cai',
    coords: [1.2155, -77.2839],
    address: 'Plaza del Carnaval',
    description: 'Atención ciudadana, cuadrante de vigilancia y recepción de extraviados.',
  },
  {
    id: 'cai-2',
    name: 'CAI Parque Nariño / Centro',
    category: 'cai',
    coords: [1.2136, -77.2822],
    address: 'Calle 19 con Carrera 25',
    description: 'Puesto de mando y seguridad céntrica.',
  },
  {
    id: 'cai-3',
    name: 'CAI Bomboná',
    category: 'cai',
    coords: [1.2091, -77.2897],
    address: 'Sector Bomboná / Champagnat',
    description: 'Vigilancia en zona de llegada y desmonte.',
  },

  // Puestos de Salud y Primeros Auxilios (Cruz Roja / Defensa Civil)
  {
    id: 'salud-1',
    name: 'Puesto de Primeros Auxilios Cruz Roja',
    category: 'salud',
    coords: [1.2151, -77.2845],
    address: 'Plaza del Carnaval',
    description: 'Triage de emergencias médicas, rehidratación y curaciones.',
  },
  {
    id: 'salud-2',
    name: 'Punto de Atención Médica Parque Nariño',
    category: 'salud',
    coords: [1.2140, -77.2819],
    address: 'Plaza de Nariño',
    description: 'Ambulancia disponible y paramédicos.',
  },
  {
    id: 'salud-3',
    name: 'Hospital Civil de Pasto',
    category: 'salud',
    coords: [1.2105, -77.2750],
    address: 'Calle 11 # 21A',
    description: 'Centro hospitalario de urgencias más cercano a la Senda.',
  },
];

/**
 * Encuentra POIs filtrados por categoría
 */
export function getPOIsByCategory(category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'todos') {
  if (category === 'todos') return PASTO_POIS;
  return PASTO_POIS.filter((p) => p.category === category);
}

/**
 * Busca un POI por consulta de texto libre
 */
export function searchPastoPOI(query: string): PointOfInterest | null {
  const q = query.toLowerCase();
  
  if (q.includes('baño') || q.includes('bano') || q.includes('sanitario') || q.includes('orinar') || q.includes('servicio')) {
    if (q.includes('nariño') || q.includes('narino') || q.includes('centro')) {
      return PASTO_POIS.find((p) => p.id === 'bano-2') || null;
    }
    if (q.includes('normal') || q.includes('salida')) {
      return PASTO_POIS.find((p) => p.id === 'bano-3') || null;
    }
    return PASTO_POIS.find((p) => p.id === 'bano-1') || null; // Plaza del Carnaval por defecto
  }

  if (q.includes('policía') || q.includes('policia') || q.includes('cai') || q.includes('seguridad') || q.includes('robo') || q.includes('extraviado')) {
    if (q.includes('nariño') || q.includes('narino') || q.includes('centro')) {
      return PASTO_POIS.find((p) => p.id === 'cai-2') || null;
    }
    if (q.includes('bomboná') || q.includes('bombona') || q.includes('champagnat') || q.includes('llegada')) {
      return PASTO_POIS.find((p) => p.id === 'cai-3') || null;
    }
    return PASTO_POIS.find((p) => p.id === 'cai-1') || null;
  }

  if (q.includes('salud') || q.includes('médic') || q.includes('medic') || q.includes('urgencia') || q.includes('hospital') || q.includes('cruz roja') || q.includes('primeros auxilios')) {
    if (q.includes('hospital') || q.includes('civil')) {
      return PASTO_POIS.find((p) => p.id === 'salud-3') || null;
    }
    if (q.includes('nariño') || q.includes('narino')) {
      return PASTO_POIS.find((p) => p.id === 'salud-2') || null;
    }
    return PASTO_POIS.find((p) => p.id === 'salud-1') || null;
  }

  if (q.includes('cuy') || q.includes('comer') || q.includes('restaurante') || q.includes('comida') || q.includes('frito') || q.includes('empanada') || q.includes('almuerzo')) {
    if (q.includes('café') || q.includes('cafe') || q.includes('desayuno')) {
      return PASTO_POIS.find((p) => p.id === 'rest-2') || null;
    }
    if (q.includes('fritada') || q.includes('frito') || q.includes('merced')) {
      return PASTO_POIS.find((p) => p.id === 'rest-3') || null;
    }
    if (q.includes('galpón') || q.includes('galpon') || q.includes('santander')) {
      return PASTO_POIS.find((p) => p.id === 'rest-4') || null;
    }
    return PASTO_POIS.find((p) => p.id === 'rest-1') || null; // Rancho Grande
  }

  return PASTO_POIS.find((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) || null;
}

export type GuanenaMapAction =
  | { type: 'FOCUS_CATEGORY'; category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'todos' }
  | { type: 'SHOW_SENDA'; dayId?: string }
  | { type: 'NAVIGATE_TO'; targetCoords: LatLngTuple; targetName: string; startCoords?: LatLngTuple };

/**
 * Despacha acciones directas de GuaneñaBot al mapa interactivo
 */
export function dispatchGuanenaAction(action: GuanenaMapAction) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('guanena-action', { detail: action }));
  window.dispatchEvent(new CustomEvent(action.type, { detail: action }));

  if (action.type === 'FOCUS_CATEGORY') {
    window.dispatchEvent(new CustomEvent('show-poi-category', { detail: { category: action.category } }));
  } else if (action.type === 'SHOW_SENDA') {
    window.dispatchEvent(new CustomEvent('focus-senda', { detail: action }));
  } else if (action.type === 'NAVIGATE_TO') {
    window.dispatchEvent(new CustomEvent('route-to-poi', { detail: action }));
  }
}

export default PASTO_POIS;

