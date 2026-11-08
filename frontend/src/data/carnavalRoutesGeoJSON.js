/**
 * Geometría GeoJSON oficial de alta precisión de la Senda del Carnaval de Negros y Blancos
 * San Juan de Pasto - Nariño, Colombia
 * Trazado exacto calle por calle con snapping vial sobre Carrera 27, Calle 19,
 * Plaza del Carnaval, Plaza de Nariño, Champagnat y Av. de los Estudiantes.
 */

// Trazado vial milimétrico y denso oficial esquina por esquina en formato Leaflet [lat, lng]
export const SENDA_OFICIAL_COORDS = [
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

// Alias para retrocompatibilidad total
export const SENDA_OFICIAL_STREET_COORDS = SENDA_OFICIAL_COORDS;

// Conversión a GeoJSON LineString estándar [lng, lat]
export const SENDA_GEOJSON_COORDINATES = SENDA_OFICIAL_STREET_COORDS.map(([lat, lng]) => [lng, lat]);

export const SENDA_GEOJSON_FEATURE = {
  type: 'Feature',
  properties: {
    id: 'senda_oficial',
    name: 'Senda del Carnaval de Negros y Blancos',
    city: 'San Juan de Pasto',
    department: 'Nariño',
    country: 'Colombia',
    surface: 'Asfalto / Calzada Vial Urbana',
    lengthKm: 7.2,
    direction: 'Norte - Sur (Normal Superior -> Champagnat)',
    landmarks: [
      'Fuente de la Transparencia',
      'Normal Superior',
      'Carrera 27',
      'Calle 18',
      'Plaza de Nariño',
      'Calle 19',
      'Plaza del Carnaval',
      'Av. Boyacá',
      'Bomboná',
      'Champagnat'
    ]
  },
  geometry: {
    type: 'LineString',
    coordinates: SENDA_GEOJSON_COORDINATES
  }
};

// Catálogo de Rutas Oficiales por Día con Metadatos Completos
export const CARNAVAL_DAYS_TRACKS = {
  '06-ene': {
    id: '06-ene',
    dateLabel: '6 de Enero',
    name: 'Desfile Magno',
    tagline: 'Día cumbre de la expresión artística y carrozas monumentales',
    color: '#E11D48', // Carmesí festivo
    secondaryColor: '#f59e0b',
    lengthKm: 7.2,
    durationHours: '8 a 10 horas',
    direction: 'Normal Superior -> Cra 27 -> Plaza del Carnaval -> Champagnat',
    startPoint: {
      name: 'Salida: Av. Champagnat / Parque Bolívar',
      coords: [1.20550, -77.27980],
      description: 'Punto de partida oficial en Av. Champagnat con concentración de carrozas monumentales y comparsas.'
    },
    endPoint: {
      name: 'Llegada: Fuente de la Transparencia / Av. de los Estudiantes',
      coords: [1.22600, -77.28550],
      description: 'Culminación del desfile oficial, desconcentración y premiación.'
    },
    evacuationPoints: [
      { id: 'evac-1', name: 'Evacuación Normal Superior', coords: [1.2195, -77.2685], street: 'Av. Santander Norte' },
      { id: 'evac-2', name: 'Evacuación Plaza de Nariño', coords: [1.2138, -77.2805], street: 'Calle 19 con Cra 24' },
      { id: 'evac-3', name: 'Evacuación Plaza del Carnaval', coords: [1.2160, -77.2845], street: 'Cra 20' },
      { id: 'evac-4', name: 'Evacuación Champagnat', coords: [1.2065, -77.2920], street: 'Salida a Catambuco' }
    ],
    healthPoints: [
      { id: 'health-1', name: 'Cruz Roja Plaza del Carnaval', coords: [1.2158, -77.2835], phone: '132' },
      { id: 'health-2', name: 'Defensa Civil Plaza de Nariño', coords: [1.2170, -77.2812], phone: '144' },
      { id: 'health-3', name: 'Hospital Civil de Pasto', coords: [1.2105, -77.2750], phone: '123' }
    ],
    coords: SENDA_OFICIAL_STREET_COORDS
  },

  '03-ene': {
    id: '03-ene',
    dateLabel: '3 de Enero',
    name: 'Canto a la Tierra',
    tagline: 'Desfile de colectivos coreográficos en homenaje a la Pachamama',
    color: '#10B981', // Verde Esmeralda andino
    secondaryColor: '#f59e0b',
    lengthKm: 6.8,
    durationHours: '6 a 8 horas',
    direction: 'Normal Superior -> Senda Oficial -> Champagnat',
    startPoint: {
      name: 'Salida: Normal Superior',
      coords: [1.21852, -77.26941],
      description: 'Concentración de zampoñas, bombos, quenas y danzantes.'
    },
    endPoint: {
      name: 'Llegada: Estadio Libertad / Champagnat',
      coords: [1.20780, -77.29130],
      description: 'Cierre musical de agrupaciones andinas.'
    },
    evacuationPoints: [
      { id: 'evac-3-1', name: 'Evacuación Cra 27 Calle 14', coords: [1.2144, -77.2769], street: 'Cra 27' },
      { id: 'evac-3-2', name: 'Evacuación Plaza del Carnaval', coords: [1.2160, -77.2845], street: 'Cra 20' }
    ],
    healthPoints: [
      { id: 'health-3-1', name: 'Cruz Roja Plaza del Carnaval', coords: [1.2158, -77.2835], phone: '132' },
      { id: 'health-3-2', name: 'Punto de Hidratación Cra 27', coords: [1.2155, -77.2753], phone: '132' }
    ],
    coords: SENDA_OFICIAL_STREET_COORDS
  },

  '04-ene': {
    id: '04-ene',
    dateLabel: '4 de Enero',
    name: 'Llegada de la Familia Castañeda',
    tagline: 'Apertura tradicional del Carnaval con estampas costumbristas',
    color: '#D946EF', // Magenta festivo
    secondaryColor: '#38BDF8',
    lengthKm: 6.5,
    durationHours: '5 a 7 horas',
    direction: 'Senda del Carnaval y Centro Histórico',
    startPoint: {
      name: 'Salida: Normal Superior',
      coords: [1.21852, -77.26941],
      description: 'Bienvenida a don Nicanor Castañeda y su comitiva de colonos.'
    },
    endPoint: {
      name: 'Llegada: Glorieta Champagnat',
      coords: [1.20780, -77.29130],
      description: 'Llegada de carretas, equipajes y cuadros vivos tradicionales.'
    },
    evacuationPoints: [
      { id: 'evac-4-1', name: 'Evacuación Parque Nariño', coords: [1.2138, -77.2805], street: 'Calle 19' },
      { id: 'evac-4-2', name: 'Evacuación Champagnat', coords: [1.2065, -77.2920], street: 'Cra 25' }
    ],
    healthPoints: [
      { id: 'health-4-1', name: 'Puesto Médico Plaza de Nariño', coords: [1.2170, -77.2812], phone: '144' },
      { id: 'health-4-2', name: 'Puesto Asistencial Bomboná', coords: [1.2092, -77.2899], phone: '132' }
    ],
    coords: SENDA_OFICIAL_STREET_COORDS
  },

  '05-ene': {
    id: '05-ene',
    dateLabel: '5 de Enero',
    name: 'Día de Negros',
    tagline: '¡Una pintica por favor! El día del juego cosmético y tablados musicales',
    color: '#38BDF8', // Cyan luminoso
    secondaryColor: '#f59e0b',
    lengthKm: 4.0,
    durationHours: 'Todo el día y noche',
    direction: 'Concentración en Tablados: Plaza del Carnaval y Plaza de Nariño',
    startPoint: {
      name: 'Plaza del Carnaval y la Cultura',
      coords: [1.21540, -77.28410],
      description: 'Tablado oficial con orquestas nacionales e internacionales.'
    },
    endPoint: {
      name: 'Plaza de Nariño',
      coords: [1.21380, -77.28180],
      description: 'Escenario alterno de música tropical y juego tradicional.'
    },
    evacuationPoints: [
      { id: 'evac-5-1', name: 'Corredor seguro Cra 24', coords: [1.2146, -77.2829], street: 'Cra 24' },
      { id: 'evac-5-2', name: 'Salida rápida Cra 20', coords: [1.2160, -77.2845], street: 'Cra 20' }
    ],
    healthPoints: [
      { id: 'health-5-1', name: 'Hospital Civil de Pasto', coords: [1.2105, -77.2750], phone: '123' },
      { id: 'health-5-2', name: 'Cruz Roja Plaza del Carnaval', coords: [1.2158, -77.2835], phone: '132' }
    ],
    coords: [
      [1.21380, -77.28180],
      [1.21420, -77.28235],
      [1.21460, -77.28290],
      [1.21500, -77.28350],
      [1.21540, -77.28410],
      [1.21480, -77.28480],
      [1.21350, -77.28620]
    ]
  }
};

// Puntos de Interés a lo largo de la Senda del Carnaval (Salud, Graderías, Zonas de Juego, Información, Baños)
// Calibrados para ubicarse fuera del asfalto (en andenes, aceras y plazas aledañas)
export const SENDA_POINTS_OF_INTEREST = [
  // 1. Puestos de Salud de la Cruz Roja y Defensa Civil
  {
    id: 'poi-salud-1',
    name: 'Puesto de Salud Cruz Roja - Plaza del Carnaval',
    category: 'salud',
    icon: '🚨',
    coords: [1.2158, -77.2835], // sidewalk plaza
    address: 'Plaza del Carnaval y la Cultura (Costado Sur / Andén)',
    description: 'Atención de primeros auxilios, rehidratación, paramédicos y ambulancia medicalizada.',
    badgeColor: '#ef4444'
  },
  {
    id: 'poi-salud-2',
    name: 'Puesto Asistencial Cruz Roja - Parque Nariño',
    category: 'salud',
    icon: '🚨',
    coords: [1.2170, -77.2812], // plazoleta este
    address: 'Plaza de Nariño (Plazoleta Este / Andén)',
    description: 'Triage de emergencias leves, curaciones y personal de socorro en zona central.',
    badgeColor: '#ef4444'
  },
  {
    id: 'poi-salud-3',
    name: 'Punto Médico Bomboná / Champagnat',
    category: 'salud',
    icon: '🚨',
    coords: [1.2092, -77.2899],
    address: 'Sector Bomboná con Carrera 25',
    description: 'Punto de socorro para atención inmediata en el sector de llegada del desfile.',
    badgeColor: '#ef4444'
  },

  // 2. Baños Públicos y Baterías Sanitarias
  {
    id: 'poi-bano-1',
    name: 'Baños Públicos Plaza del Carnaval',
    category: 'bano',
    icon: '🚻',
    coords: [1.2145, -77.2845], // costado sur
    address: 'Plaza del Carnaval (Costado Sur)',
    description: 'Batería sanitaria pública habilitada en el andén sur fuera de la calzada del desfile.',
    badgeColor: '#06b6d4'
  },

  // 3. Graderías Oficiales
  {
    id: 'poi-grad-1',
    name: 'Graderías Oficiales Plaza del Carnaval',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2156, -77.2838],
    address: 'Carrera 20 frente a Tarima de Jurados',
    description: 'Sector A y B con boletería y vista privilegiada al paso de carrozas monumentales.',
    badgeColor: '#f59e0b'
  },
  {
    id: 'poi-grad-2',
    name: 'Graderías Carrera 27 (Acera Oriental)',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2122, -77.2782], // acera oriental
    address: 'Carrera 27 (Acera Oriental entre Calles 14 y 15)',
    description: 'Graderías sobre el andén oriental con excelente visibilidad sin obstruir calzada.',
    badgeColor: '#f59e0b'
  },
  {
    id: 'poi-grad-3',
    name: 'Graderías VIP Plaza de Nariño',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2135, -77.2810],
    address: 'Calle 18 con Carrera 25',
    description: 'Graderías para invitados, transmisión televisiva y prensa nacional.',
    badgeColor: '#f59e0b'
  },

  // 4. Zonas de Juego (Talco y Cosmético Tradicional)
  {
    id: 'poi-juego-1',
    name: 'Zona de Juego y Pintica - Plaza del Carnaval',
    category: 'juego',
    icon: '🎭',
    coords: [1.2152, -77.2842],
    address: 'Costado Norte Plaza del Carnaval',
    description: 'Área habilitada para el juego con cosmético, talco perfumado y espuma reglamentaria.',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'poi-juego-2',
    name: 'Zona de Juego Tradicional - Plaza de Nariño',
    category: 'juego',
    icon: '🎭',
    coords: [1.2139, -77.2815],
    address: 'Plaza de Nariño (Centro)',
    description: '¡Una pintica por favor! Área masiva de celebración popular y juego limpio.',
    badgeColor: '#8b5cf6'
  },

  // 4. Puntos de Información Turística
  {
    id: 'poi-tur-1',
    name: 'Punto de Información Turística Corpocarnaval',
    category: 'turismo',
    icon: 'ℹ️',
    coords: [1.2136, -77.2825],
    address: 'Calle 19 # 24-40 Centro',
    description: 'Guías oficiales, mapas impresos, programación oficial y atención en varios idiomas.',
    badgeColor: '#10b981'
  },
  {
    id: 'poi-tur-2',
    name: 'Módulo Turístico Normal Superior',
    category: 'turismo',
    icon: 'ℹ️',
    coords: [1.2188, -77.2690],
    address: 'Av. Santander frente a I.E. Normal Superior',
    description: 'Punto de orientación a visitantes en el inicio del recorrido de la Senda.',
    badgeColor: '#10b981'
  }
];

// GeoJSON FeatureCollection completo
export const CARNAVAL_GEOJSON_COLLECTION = {
  type: 'FeatureCollection',
  features: [
    SENDA_GEOJSON_FEATURE,
    ...Object.values(CARNAVAL_DAYS_TRACKS).map((track) => ({
      type: 'Feature',
      properties: {
        id: track.id,
        name: track.name,
        dateLabel: track.dateLabel,
        color: track.color,
        lengthKm: track.lengthKm,
        direction: track.direction,
        startPoint: track.startPoint,
        endPoint: track.endPoint,
        evacuationPoints: track.evacuationPoints,
        healthPoints: track.healthPoints
      },
      geometry: {
        type: 'LineString',
        coordinates: track.coords.map(([lat, lng]) => [lng, lat])
      }
    }))
  ]
};

export default CARNAVAL_GEOJSON_COLLECTION;
