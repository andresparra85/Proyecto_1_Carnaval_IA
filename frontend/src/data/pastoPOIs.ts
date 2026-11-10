/**
 * Catálogo georreferenciado de Puntos de Interés (POI) reales en San Juan de Pasto
 * para la experiencia guiada por IA en el Carnaval de Negros y Blancos.
 */

export type LatLngTuple = [number, number];

export interface PointOfInterest {
  id: string;
  name: string;
  category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'tarima';
  type?: 'banos' | 'restaurante' | 'salud' | 'seguridad' | 'tarima';
  coords: LatLngTuple;
  address: string;
  sector: string;
  description: string;
  schedule?: string;
  phone?: string;
}

export const PASTO_POIS: PointOfInterest[] = [
  // 1. Restaurantes Tradicionales y Gastronomía Típica (Cuy, Fritada, Empanadas, Hervidos)
  {
    id: 'rest-1',
    name: 'Restaurante Rancho Grande',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2132, -77.2798],
    address: 'Calle 18 # 25-30 Centro',
    sector: 'Plaza del Carnaval',
    description: 'Platos típicos nariñenses, el mejor cuy asado y cocina tradicional campesina.',
    schedule: '8:00 AM - 11:00 PM',
  },
  {
    id: 'rest-2',
    name: 'Café San Sebastián',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2141, -77.2821],
    address: 'Carrera 25 frente a Plaza de Nariño',
    sector: 'Plaza Nariño',
    description: 'Cafetería de especialidad nariñense, pastelería y hervidos tradicionales.',
    schedule: '7:00 AM - 10:00 PM',
  },
  {
    id: 'rest-3',
    name: 'Asadero y Picantería La Merced',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2152, -77.2838],
    address: 'Calle 19 cerca a Plaza del Carnaval',
    sector: 'Plaza del Carnaval',
    description: 'Fritada pastusa, empanadas de añejo y platos a la brasa.',
    schedule: '9:00 AM - 11:30 PM',
  },
  {
    id: 'rest-4',
    name: 'El Galpón Criollo',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2175, -77.2715],
    address: 'Av. Santander con Cra 27',
    sector: 'Av. Santander',
    description: 'Parrillada tradicional, almuerzos típicos y hervidos de maracuyá y mora.',
    schedule: '8:00 AM - 9:00 PM',
  },
  {
    id: 'rest-5',
    name: 'Empanadas y Picantería El Colorado',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2062, -77.2758],
    address: 'Sector Estadio Libertad',
    sector: 'Estadio Libertad',
    description: 'Empanadas de pipián, quimbolitos y meriendas carnavaleras.',
    schedule: '9:00 AM - 10:00 PM',
  },
  {
    id: 'rest-6',
    name: 'Asadero y Cuyería Mister Cuy',
    category: 'restaurante',
    type: 'restaurante',
    coords: [1.2085, -77.2890],
    address: 'Sector Champagnat / Bomboná',
    sector: 'Champagnat / Bomboná',
    description: 'Cuy crocante al carbón con papas coloradas y ají de maní.',
    schedule: '10:00 AM - 11:00 PM',
  },

  // 2. Baños Públicos y Baterías Sanitarias de Emergencia
  {
    id: 'bano-1',
    name: 'Batería Sanitaria Plaza del Carnaval',
    category: 'bano',
    type: 'banos',
    coords: [1.2145, -77.2845],
    address: 'Costado Sur Plaza del Carnaval',
    sector: 'Plaza del Carnaval',
    description: 'Módulo de baños públicos con accesibilidad habilitado para espectadores.',
    schedule: '24 Horas',
  },
  {
    id: 'bano-2',
    name: 'Batería Sanitaria Plaza de Nariño',
    category: 'bano',
    type: 'banos',
    coords: [1.2139, -77.2816],
    address: 'Parque Nariño - Cra 25',
    sector: 'Plaza Nariño',
    description: 'Servicios sanitarios municipales con personal de aseo continuo.',
    schedule: '6:00 AM - 10:00 PM',
  },
  {
    id: 'bano-3',
    name: 'Servicios Sanitarios Normal Superior',
    category: 'bano',
    type: 'banos',
    coords: [1.2184, -77.2696],
    address: 'Calle 4 con Cra 27 (Normal Superior)',
    sector: 'Av. Santander',
    description: 'Baterías móviles en la zona de concentración y partida de carrozas.',
    schedule: 'Durante eventos y desfiles',
  },
  {
    id: 'bano-4',
    name: 'Batería Sanitaria Estadio Libertad',
    category: 'bano',
    type: 'banos',
    coords: [1.2055, -77.2765],
    address: 'Costado Oriental Estadio Libertad',
    sector: 'Estadio Libertad',
    description: 'Puntos sanitarios de alto flujo durante el ingreso y desfiles.',
    schedule: '7:00 AM - 10:00 PM',
  },
  {
    id: 'bano-5',
    name: 'Batería Sanitaria Champagnat',
    category: 'bano',
    type: 'banos',
    coords: [1.2088, -77.2902],
    address: 'Sector Champagnat y Colegio Javeriano',
    sector: 'Champagnat / Bomboná',
    description: 'Baterías sanitarias en la zona de desmonte de senda.',
    schedule: '8:00 AM - 9:00 PM',
  },

  // 3. Seguridad y CAIs Policía Nacional
  {
    id: 'cai-1',
    name: 'CAI Plaza del Carnaval',
    category: 'cai',
    type: 'seguridad',
    coords: [1.2155, -77.2839],
    address: 'Plaza del Carnaval',
    sector: 'Plaza del Carnaval',
    description: 'Puesto de mando policial, recepción de personas extraviadas y vigilancia.',
  },
  {
    id: 'cai-2',
    name: 'CAI Parque Nariño / Centro',
    category: 'cai',
    type: 'seguridad',
    coords: [1.2136, -77.2822],
    address: 'Calle 19 con Carrera 25',
    sector: 'Plaza Nariño',
    description: 'Comando central de vigilancia policial en el centro histórico.',
  },
  {
    id: 'cai-3',
    name: 'CAI Bomboná',
    category: 'cai',
    type: 'seguridad',
    coords: [1.2091, -77.2897],
    address: 'Sector Bomboná / Champagnat',
    sector: 'Champagnat / Bomboná',
    description: 'Vigilancia en zona de llegada y desmonte de carrozas magnas.',
  },
  {
    id: 'cai-4',
    name: 'Puesto de Mando y CAI Móvil Normal',
    category: 'cai',
    type: 'seguridad',
    coords: [1.2188, -77.2690],
    address: 'Av. Santander Cra 27',
    sector: 'Av. Santander',
    description: 'Control de seguridad en el inicio de la Senda del Carnaval.',
  },
  {
    id: 'cai-5',
    name: 'CAI Estadio Libertad',
    category: 'cai',
    type: 'seguridad',
    coords: [1.2050, -77.2770],
    address: 'Glorieta Estadio Libertad',
    sector: 'Estadio Libertad',
    description: 'Control policial y seguridad vial en el sector sur.',
  },

  // 4. Puestos de Salud y Emergencias (Cruz Roja / Defensa Civil / Hospitales)
  {
    id: 'salud-1',
    name: 'Puesto de Primeros Auxilios Cruz Roja',
    category: 'salud',
    type: 'salud',
    coords: [1.2158, -77.2835],
    address: 'Plaza del Carnaval (Plazoleta Este)',
    sector: 'Plaza del Carnaval',
    description: 'Triage de emergencias médicas, rehidratación y atención paramédica.',
  },
  {
    id: 'salud-2',
    name: 'Punto de Atención Médica Parque Nariño',
    category: 'salud',
    type: 'salud',
    coords: [1.2170, -77.2812],
    address: 'Plaza de Nariño (Plazoleta Este)',
    sector: 'Plaza Nariño',
    description: 'Ambulancia medicalizada, brigadistas de la Defensa Civil y paramédicos.',
  },
  {
    id: 'salud-3',
    name: 'Hospital Civil de Pasto',
    category: 'salud',
    type: 'salud',
    coords: [1.2105, -77.2750],
    address: 'Calle 11 # 21A',
    sector: 'Champagnat / Bomboná',
    description: 'Centro hospitalario de urgencias de mayor nivel cercano a La Senda.',
  },
  {
    id: 'salud-4',
    name: 'Módulo de Triage Normal Superior',
    category: 'salud',
    type: 'salud',
    coords: [1.2186, -77.2701],
    address: 'Calle 4 con Cra 27',
    sector: 'Av. Santander',
    description: 'Atención prehospitalaria en el punto de salida de las comparsas.',
  },
  {
    id: 'salud-5',
    name: 'Puesto de Salud Estadio Libertad',
    category: 'salud',
    type: 'salud',
    coords: [1.2058, -77.2760],
    address: 'Acceso Occidental Estadio Libertad',
    sector: 'Estadio Libertad',
    description: 'Equipo de paramédicos para atención a turistas y espectadores.',
  },

  // 5. Tarimas y Eventos Culturales (Música campesina, rock, orquestas)
  {
    id: 'tarima-1',
    name: 'Tarima Principal Plaza del Carnaval',
    category: 'tarima',
    type: 'tarima',
    coords: [1.2147, -77.2841],
    address: 'Plaza del Carnaval y la Cultura',
    sector: 'Plaza del Carnaval',
    description: 'Tarima central con orquestas nacionales, tablados y premiación de comparsas.',
    schedule: '2:00 PM - 2:00 AM',
  },
  {
    id: 'tarima-2',
    name: 'Tarima de Música Campesina Plaza de Nariño',
    category: 'tarima',
    type: 'tarima',
    coords: [1.2168, -77.2805],
    address: 'Plaza de Nariño Centro',
    sector: 'Plaza Nariño',
    description: 'Festival de música campesina, tríos nariñenses y música andina.',
    schedule: '1:00 PM - 10:00 PM',
  },
  {
    id: 'tarima-3',
    name: 'Concha Acústica Agustín Agualongo',
    category: 'tarima',
    type: 'tarima',
    coords: [1.2185, -77.2762],
    address: 'Parque Infantil',
    sector: 'Parque Infantil',
    description: 'Escenario de artes escénicas, danzas folclóricas y recitales culturales.',
    schedule: '3:00 PM - 11:00 PM',
  },
  {
    id: 'tarima-4',
    name: 'Tarima de la Juventud y Rock',
    category: 'tarima',
    type: 'tarima',
    coords: [1.2151, -77.2848],
    address: 'Costado Carrera 20 Plaza del Carnaval',
    sector: 'Plaza del Carnaval',
    description: 'Conciertos de fusión andina, rock local y música urbana.',
    schedule: '4:00 PM - 12:00 AM',
  },
  {
    id: 'tarima-5',
    name: 'Tarima Popular Estadio Libertad',
    category: 'tarima',
    type: 'tarima',
    coords: [1.2052, -77.2768],
    address: 'Parqueadero Sur Estadio Libertad',
    sector: 'Estadio Libertad',
    description: 'Presentaciones musicales durante la concentración de carrozas.',
    schedule: '10:00 AM - 6:00 PM',
  },
];

/**
 * Calcula distancia aproximada en kilómetros entre dos coordenadas
 */
export function calculateDistanceKm(c1: LatLngTuple, c2: LatLngTuple): number {
  const [lat1, lon1] = c1;
  const [lat2, lon2] = c2;
  const R = 6371; // Radio terrestre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Encuentra POIs filtrados por categoría
 */
export function getPOIsByCategory(category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'tarima' | 'todos') {
  if (category === 'todos') return PASTO_POIS;
  return PASTO_POIS.filter((p) => p.category === category || (category === 'bano' && p.type === 'banos'));
}

export interface IntentMatchResult {
  poi: PointOfInterest;
  category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'tarima';
  type: 'banos' | 'restaurante' | 'salud' | 'seguridad' | 'tarima';
  matchedIntent: boolean;
  reply: string;
}

/**
 * Evalúa la intención espacial del usuario y selecciona el POI más adecuado a lo largo de La Senda
 */
export function findBestPOIForQuery(query: string, userCoords?: LatLngTuple): IntentMatchResult | null {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let matchedCategory: 'restaurante' | 'bano' | 'cai' | 'salud' | 'tarima' | null = null;
  let matchedType: 'banos' | 'restaurante' | 'salud' | 'seguridad' | 'tarima' = 'restaurante';

  // 1. Detección de intención espacial
  if (
    q.includes('bano') ||
    q.includes('sanitario') ||
    q.includes('orinar') ||
    q.includes('pipi') ||
    q.includes('servicio higienico') ||
    q.includes('necesidad') ||
    q.includes('bateria sanitaria')
  ) {
    matchedCategory = 'bano';
    matchedType = 'banos';
  } else if (
    q.includes('cuy') ||
    q.includes('comer') ||
    q.includes('restaurante') ||
    q.includes('comida') ||
    q.includes('fritada') ||
    q.includes('empanada') ||
    q.includes('almuerzo') ||
    q.includes('hervido') ||
    q.includes('quimbolito') ||
    q.includes('gastronomia')
  ) {
    matchedCategory = 'restaurante';
    matchedType = 'restaurante';
  } else if (
    q.includes('policia') ||
    q.includes('cai') ||
    q.includes('seguridad') ||
    q.includes('robo') ||
    q.includes('extraviado') ||
    q.includes('vigilancia') ||
    q.includes('ladron') ||
    q.includes('perdido')
  ) {
    matchedCategory = 'cai';
    matchedType = 'seguridad';
  } else if (
    q.includes('salud') ||
    q.includes('medic') ||
    q.includes('cruz roja') ||
    q.includes('urgencia') ||
    q.includes('hospital') ||
    q.includes('ambulancia') ||
    q.includes('primeros auxilios') ||
    q.includes('herido') ||
    q.includes('desmayo') ||
    q.includes('emergencia')
  ) {
    matchedCategory = 'salud';
    matchedType = 'salud';
  } else if (
    q.includes('tarima') ||
    q.includes('concierto') ||
    q.includes('musica') ||
    q.includes('orquesta') ||
    q.includes('agrupacion') ||
    q.includes('artista') ||
    q.includes('tablado') ||
    q.includes('show') ||
    q.includes('evento cultural')
  ) {
    matchedCategory = 'tarima';
    matchedType = 'tarima';
  }

  if (!matchedCategory) return null;

  // 2. Filtrar candidatos de la categoría
  const candidates = PASTO_POIS.filter((p) => p.category === matchedCategory);
  if (candidates.length === 0) return null;

  // 3. Buscar si el usuario mencionó un sector específico en su consulta
  let selectedPoi: PointOfInterest | null = null;
  if (q.includes('narino') || q.includes('parque narino') || q.includes('centro')) {
    selectedPoi = candidates.find((p) => p.sector === 'Plaza Nariño') || null;
  } else if (q.includes('carnaval') || q.includes('plaza carnaval')) {
    selectedPoi = candidates.find((p) => p.sector === 'Plaza del Carnaval') || null;
  } else if (q.includes('santander') || q.includes('normal') || q.includes('salida') || q.includes('cra 27')) {
    selectedPoi = candidates.find((p) => p.sector === 'Av. Santander') || null;
  } else if (q.includes('estadio') || q.includes('libertad')) {
    selectedPoi = candidates.find((p) => p.sector === 'Estadio Libertad') || null;
  } else if (q.includes('champagnat') || q.includes('bombona') || q.includes('llegada')) {
    selectedPoi = candidates.find((p) => p.sector === 'Champagnat / Bomboná') || null;
  }

  // 4. Si no especificó sector pero tenemos coordenadas del usuario, elegir el más cercano
  if (!selectedPoi && userCoords && Array.isArray(userCoords) && userCoords.length === 2) {
    let minDistance = Infinity;
    candidates.forEach((cand) => {
      const dist = calculateDistanceKm(userCoords, cand.coords);
      if (dist < minDistance) {
        minDistance = dist;
        selectedPoi = cand;
      }
    });
  }

  // 5. Fallback al primer candidato de la categoría
  if (!selectedPoi) {
    selectedPoi = candidates[0];
  }

  // 6. Generar respuesta con tono tradicional pastuso/nariñense
  let reply = '';
  switch (matchedCategory) {
    case 'bano':
      reply = `¡A la voz de una, paisano! 🚻 Te acabo de trazar la ruta en el mapa hacia la **${selectedPoi.name}** en **${selectedPoi.sector}**. Te queda a unos minutos caminando. ¡Sigue la línea dorada!`;
      break;
    case 'restaurante':
      reply = `¡Qué delicia, paisano! 🍽️ Te acabo de trazar la ruta en el mapa hacia **${selectedPoi.name}** en **${selectedPoi.sector}**. Allí encontrás un cuy asado bien crocante y comida típica. ¡Sigue la línea dorada!`;
      break;
    case 'cai':
      reply = `¡Firme mi paisano! 👮 Te acabo de trazar la ruta en el mapa hacia el **${selectedPoi.name}** en **${selectedPoi.sector}**. Los agentes están atentos para brindarte seguridad. ¡Sigue la línea dorada!`;
      break;
    case 'salud':
      reply = `¡Atención inmediata, paisano! 🚨 Te acabo de trazar la ruta de asistencia en el mapa hacia el **${selectedPoi.name}** en **${selectedPoi.sector}**. Te queda muy cerca caminando. ¡Sigue la línea dorada!`;
      break;
    case 'tarima':
      reply = `¡A gozar la fiesta, carajo! 🎪 Te acabo de trazar la ruta en el mapa hacia la **${selectedPoi.name}** en **${selectedPoi.sector}**. ¡Sigue la línea dorada para disfrutar del tablado!`;
      break;
  }

  return {
    poi: selectedPoi,
    category: matchedCategory,
    type: matchedType,
    matchedIntent: true,
    reply,
  };
}

/**
 * Busca un POI por consulta de texto libre
 */
export function searchPastoPOI(query: string): PointOfInterest | null {
  const result = findBestPOIForQuery(query);
  if (result) return result.poi;
  const q = query.toLowerCase();
  return PASTO_POIS.find((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) || null;
}

export type GuanenaMapAction =
  | { type: 'FOCUS_CATEGORY'; category: 'restaurante' | 'bano' | 'cai' | 'salud' | 'tarima' | 'todos' }
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
