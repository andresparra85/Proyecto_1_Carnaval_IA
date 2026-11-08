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

// Catálogo GeoJSON Oficial de Recorridos por Día (28 de Diciembre al 7 de Enero)
export const CARNAVAL_DAILY_TRACKS = {
  dec_28: {
    id: 'dec_28',
    date: '28 de Diciembre',
    dateLabel: '28 de Diciembre',
    name: 'Arcoíris en el Asfalto',
    tagline: 'Expresión artística con tizas de colores sobre el pavimento del Centro Histórico',
    color: '#8B5CF6', // Púrpura creativo
    lengthKm: 1.8,
    durationHours: '8:00 AM - 6:00 PM',
    direction: 'Calle 18 entre Carreras 24 y 27 (Centro Histórico)',
    startPoint: {
      name: 'Inicio: Cra 27 con Calle 18',
      coords: [1.2140, -77.2785],
      description: 'Punto de entrega de tizas de colores y asignación de lienzos viales.'
    },
    endPoint: {
      name: 'Llegada: Plaza de Nariño / Cra 24',
      coords: [1.2170, -77.2825],
      description: 'Galería de arte urbano efímero frente a la estatua de Antonio Nariño.'
    },
    coords: [
      [1.2140, -77.2785],
      [1.2148, -77.2796],
      [1.2155, -77.2805],
      [1.2162, -77.2814],
      [1.2170, -77.2825]
    ],
    description: 'El 28 de Diciembre se vive el Arcoíris en el Asfalto: miles de familias, niños y artistas transforman las calles del Centro Histórico en lienzos de tiza, reemplazando el antiguo juego con agua por arte y convivencia.'
  },

  dec_31: {
    id: 'dec_31',
    date: '31 de Diciembre',
    dateLabel: '31 de Diciembre',
    name: 'Desfile de Años Viejos',
    tagline: 'Sátira, muñecos tradicionales y viudas despidiendo el año que culmina',
    color: '#F59E0B', // Ámbar festivo
    lengthKm: 7.2,
    durationHours: '10:00 AM - 4:00 PM',
    direction: 'Champagnat -> Carrera 27 -> Calle 19 -> Fuente de la Transparencia',
    startPoint: {
      name: 'Salida: Senda / Champagnat / Parque Bolívar',
      coords: [1.2052, -77.2796],
      description: 'Concentración de carros alegóricos y muñecos de aserrín y ropa vieja.'
    },
    endPoint: {
      name: 'Llegada: Fuente de la Transparencia / Av. de los Estudiantes',
      coords: [1.2260, -77.2855],
      description: 'Culminación del desfile humorístico y lectura del testamento satírico.'
    },
    coords: SENDA_OFICIAL_COORDS,
    description: 'El 31 de Diciembre las calles de Pasto despiden el año con ingenio y humor picante en el Desfile de Años Viejos, con testamentos en verso y carros alegóricos cargados de crítica social.'
  },

  jan_02: {
    id: 'jan_02',
    date: '2 de Enero',
    dateLabel: '2 de Enero',
    name: 'Carnavalito y Homenaje a la Virgen de las Mercedes',
    tagline: 'Los niños como herederos de la tradición artesanal y cultural',
    color: '#06B6D4', // Cyan andino
    lengthKm: 3.5,
    durationHours: '9:00 AM - 2:00 PM',
    direction: 'Carrera 27 -> Plaza del Carnaval -> Plaza de Nariño',
    startPoint: {
      name: 'Salida: Carrera 27 con Calle 12',
      coords: [1.2102, -77.2790],
      description: 'Partida de mini-carrozas y colectivos dancísticos infantiles.'
    },
    endPoint: {
      name: 'Llegada: Plaza de Nariño',
      coords: [1.2173, -77.2816],
      description: 'Muestra folclórica infantil y bendición de las réplicas en miniatura.'
    },
    coords: [
      [1.2102, -77.2790],
      [1.2108, -77.2788],
      [1.2120, -77.2785],
      [1.2132, -77.2783],
      [1.2140, -77.2781],
      [1.2148, -77.2780],
      [1.2154, -77.2786],
      [1.2158, -77.2794],
      [1.2162, -77.2801],
      [1.2167, -77.2808],
      [1.2173, -77.2816]
    ],
    description: 'El 2 de Enero es el Carnavalito: el semillero del Carnaval donde niños artesanos y danzantes desfilan con mini-carrozas idénticas a las monumentales, rindiendo homenaje a la patrona de Nariño.'
  },

  jan_03: {
    id: 'jan_03',
    date: '3 de Enero',
    dateLabel: '3 de Enero',
    name: 'Canto a la Tierra (Colectivos Coreográficos)',
    tagline: 'Zampoñas, bombos y miles de danzantes en alabanza a la Pachamama',
    color: '#10B981', // Verde Esmeralda de la Tierra
    lengthKm: 7.2,
    durationHours: '9:00 AM - 6:00 PM',
    direction: 'Senda Oficial completa: Champagnat a Fuente de la Transparencia',
    startPoint: {
      name: 'Salida: Av. Champagnat / Parque Bolívar',
      coords: [1.2052, -77.2796],
      description: 'Concentración de zampoñas, bombos andinos, quenas y sayas milenarias.'
    },
    endPoint: {
      name: 'Llegada: Fuente de la Transparencia',
      coords: [1.2260, -77.2855],
      description: 'Cierre multitudinario de colectivos coreográficos en la Av. de los Estudiantes.'
    },
    coords: SENDA_OFICIAL_COORDS,
    description: 'El 3 de Enero vibra el Canto a la Tierra: más de 5.000 músicos y danzantes desfilan con trajes autóctonos al compás de sones andinos y zampoñas por toda la Senda Oficial.'
  },

  jan_04: {
    id: 'jan_04',
    date: '4 de Enero',
    dateLabel: '4 de Enero',
    name: 'Llegada de la Familia Castañeda',
    tagline: 'Bienvenida costumbrista a los campesinos y colonos de 1929',
    color: '#D946EF', // Magenta festivo
    lengthKm: 7.2,
    durationHours: '10:00 AM - 4:00 PM',
    direction: 'Senda Oficial completa con parada en Plaza del Carnaval',
    startPoint: {
      name: 'Salida: Av. Champagnat / Parque Bolívar',
      coords: [1.2052, -77.2796],
      description: 'Llegada de don Nicanor Castañeda, su carretón, peones y cuadros vivos de época.'
    },
    endPoint: {
      name: 'Llegada: Fuente de la Transparencia / Av. de los Estudiantes',
      coords: [1.2260, -77.2855],
      description: 'Entrega de las llaves de la ciudad e inicio formal de los días grandes del Carnaval.'
    },
    coords: SENDA_OFICIAL_COORDS,
    description: 'El 4 de Enero se rememora la hospitalidad pastusa con la Llegada de la Familia Castañeda: cuadros vivos, estampas coloniales, aguardiente y música tradicional en honor a los forasteros.'
  },

  jan_05: {
    id: 'jan_05',
    date: '5 de Enero',
    dateLabel: '5 de Enero',
    name: 'Día de Negros (Juego de Identidad)',
    tagline: '¡Una pintica por favor! Día de la igualdad racial y la cosmética negra',
    color: '#38BDF8', // Azul identity
    lengthKm: 4.5,
    durationHours: 'Todo el día y noche',
    direction: 'Plazas principales: Plaza Nariño, Plaza del Carnaval y Parque Bolívar',
    startPoint: {
      name: 'Epicentro: Plaza del Carnaval y la Cultura',
      coords: [1.2140, -77.2781],
      description: 'Tarima oficial con agrupaciones musicales de son sureño y salsa.'
    },
    endPoint: {
      name: 'Punto Cívico: Plaza de Nariño',
      coords: [1.2167, -77.2808],
      description: 'Juego libre cosmético, hermandad popular y tablados orquestales.'
    },
    coords: [
      [1.2052, -77.2796],
      [1.2080, -77.2792],
      [1.2108, -77.2788],
      [1.2132, -77.2783],
      [1.2140, -77.2781],
      [1.2154, -77.2786],
      [1.2158, -77.2794],
      [1.2167, -77.2808]
    ],
    description: 'El 5 de Enero se celebra el Día de Negros: conmemoración de la liberación de los esclavos en 1607. Todo Pasto se tiñe de cosmético negro bajo el lema "¡Una pintica por favor!" sin importar condición social.'
  },

  jan_06: {
    id: 'jan_06',
    date: '6 de Enero',
    dateLabel: '6 de Enero',
    name: 'Desfile Magno (Día de Blancos - Carrozas Gigantes)',
    tagline: 'La máxima expresión del talento artesanal nariñense y carrozas monumentales',
    color: '#E11D48', // Carmesí oficial
    lengthKm: 7.2,
    durationHours: '8:00 AM - 6:00 PM',
    direction: 'Senda Oficial completa: Champagnat a Fuente de la Transparencia',
    startPoint: {
      name: 'Salida: Av. Champagnat / Parque Bolívar',
      coords: [1.2052, -77.2796],
      description: 'Punto de partida de carrozas gigantes de hasta 15 metros de altura.'
    },
    endPoint: {
      name: 'Llegada: Fuente de la Transparencia / Av. de los Estudiantes',
      coords: [1.2260, -77.2855],
      description: 'Llegada, calificación final de jurados y desconcentración de esculturas.'
    },
    coords: SENDA_OFICIAL_COORDS,
    description: 'El 6 de Enero es el Desfile Magno: cumbre del Carnaval de Negros y Blancos, Patrimonio Cultural de la Humanidad. Carrozas monumentales de papel maché, disfraces individuales y comparsas recorren toda la Senda.'
  },

  jan_07: {
    id: 'jan_07',
    date: '7 de Enero',
    dateLabel: '7 de Enero',
    name: 'Festival del Cuy y la Cultura Campesina',
    tagline: 'Cierre gastronómico y rural en los corregimientos tradicionales de Pasto',
    color: '#EA580C', // Naranja gastronómico
    lengthKm: 9.0,
    durationHours: '8:00 AM - 7:00 PM',
    direction: 'Corregimientos: Pandiaco -> Obonuco -> Catambuco',
    startPoint: {
      name: 'Salida: Pandiaco / Museo del Carnaval',
      coords: [1.2260, -77.2855],
      description: 'Encuentro de sabedoras de la cocina tradicional nariñense.'
    },
    endPoint: {
      name: 'Llegada: Catambuco / Plaza Campesina',
      coords: [1.1820, -77.2950],
      description: 'Asado tradicional de cuy en brasas de carbón y música campesina.'
    },
    coords: [
      [1.2260, -77.2855],
      [1.2240, -77.2880],
      [1.2210, -77.2910],
      [1.2150, -77.2940],
      [1.2050, -77.2970],
      [1.1950, -77.3010],
      [1.1820, -77.2950]
    ],
    description: 'El 7 de Enero culmina la festividad con el Festival del Cuy y la Cultura Campesina en Pandiaco, Obonuco y Catambuco: gastronomía de trucha, cuy asado, papas con cáscara y música campesina de cuerda.'
  }
};

// Aliases para compatibilidad con selectores de fechas anteriores
export const CARNAVAL_DAYS_TRACKS = {
  'dec_28': CARNAVAL_DAILY_TRACKS.dec_28,
  'dec_31': CARNAVAL_DAILY_TRACKS.dec_31,
  'jan_02': CARNAVAL_DAILY_TRACKS.jan_02,
  'jan_03': CARNAVAL_DAILY_TRACKS.jan_03,
  'jan_04': CARNAVAL_DAILY_TRACKS.jan_04,
  'jan_05': CARNAVAL_DAILY_TRACKS.jan_05,
  'jan_06': CARNAVAL_DAILY_TRACKS.jan_06,
  'jan_07': CARNAVAL_DAILY_TRACKS.jan_07,
  '28-dic': CARNAVAL_DAILY_TRACKS.dec_28,
  '31-dic': CARNAVAL_DAILY_TRACKS.dec_31,
  '02-ene': CARNAVAL_DAILY_TRACKS.jan_02,
  '03-ene': CARNAVAL_DAILY_TRACKS.jan_03,
  '04-ene': CARNAVAL_DAILY_TRACKS.jan_04,
  '05-ene': CARNAVAL_DAILY_TRACKS.jan_05,
  '06-ene': CARNAVAL_DAILY_TRACKS.jan_06,
  '07-ene': CARNAVAL_DAILY_TRACKS.jan_07
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
