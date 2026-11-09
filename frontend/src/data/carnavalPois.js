/**
 * Catálogo Oficial y Calibrado de Puntos de Interés (POI) del Carnaval de Negros y Blancos
 * San Juan de Pasto - Georreferenciación de Alta Precisión.
 * 
 * NOTA CRÍTICA DE PRECISIÓN GIS:
 * Todos los puntos han sido rigurosamente desplazados fuera de la calzada vehicular / asfalto
 * de la Senda para ubicarse sobre andenes, plazoletas y zonas peatonales seguras,
 * garantizando que nunca obstruyan la visualización del desfile de carrozas.
 */

export const CARNAVAL_POIS = [
  // 1. Puestos de Salud y Primeros Auxilios (Cruz Roja / Defensa Civil)
  {
    id: 'poi-salud-plaza-carnaval',
    name: 'Cruz Roja Plaza del Carnaval',
    category: 'salud',
    icon: '🚨',
    coords: [1.2158, -77.2835], // Sidewalk plaza (andén fuera de la calzada)
    address: 'Plaza del Carnaval y la Cultura (Costado Sur / Andén)',
    description: 'Puesto de mando y atención prehospitalaria, curaciones y ambulancia medicalizada.',
    badgeColor: '#dc2626',
    phone: '132'
  },
  {
    id: 'poi-salud-parque-narino',
    name: 'Cruz Roja Parque Nariño',
    category: 'salud',
    icon: '🚨',
    coords: [1.2170, -77.2812], // Plazoleta este (andén sobre la plaza)
    address: 'Plaza de Nariño (Plazoleta Este / Andén)',
    description: 'Punto de primeros auxilios y triage rápido para espectadores en el centro.',
    badgeColor: '#dc2626',
    phone: '132'
  },
  {
    id: 'poi-salud-bombona',
    name: 'Punto Médico Bomboná / Champagnat',
    category: 'salud',
    icon: '🚨',
    coords: [1.2092, -77.2899],
    address: 'Sector Bomboná con Cra 25 (Andén Peatonal)',
    description: 'Atención médica en zona de desconcentración y llegada.',
    badgeColor: '#dc2626',
    phone: '123'
  },

  // 2. Baños Públicos y Baterías Sanitarias
  {
    id: 'poi-bano-plaza-carnaval',
    name: 'Baños públicos Plaza del Carnaval',
    category: 'bano',
    icon: '🚻',
    coords: [1.2145, -77.2845], // Costado sur (fuera de la calzada)
    address: 'Plaza del Carnaval (Costado Sur)',
    description: 'Batería sanitaria pública habilitada sobre el andén peatonal.',
    badgeColor: '#a8a29e',
    schedule: '24 Horas'
  },
  {
    id: 'poi-bano-parque-narino',
    name: 'Baños públicos Parque Nariño',
    category: 'bano',
    icon: '🚻',
    coords: [1.2139, -77.2816],
    address: 'Costado Occidental Plaza de Nariño',
    description: 'Baterías sanitarias municipales.',
    badgeColor: '#a8a29e',
    schedule: '6:00 AM - 10:00 PM'
  },

  // 3. Graderías Oficiales Calibradas
  {
    id: 'poi-graderia-cra27',
    name: 'Graderías Carrera 27',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2122, -77.2782], // Acera oriental
    address: 'Carrera 27 (Acera Oriental entre Calles 14 y 15)',
    description: 'Estructuras modulares elevadas ubicadas sobre el andén oriental con vista despejada.',
    badgeColor: '#dc2626'
  },
  {
    id: 'poi-graderia-plaza-carnaval',
    name: 'Graderías Plaza del Carnaval',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2156, -77.2838],
    address: 'Plaza del Carnaval frente a Tarima',
    description: 'Tribunas principales para calificación de jurados.',
    badgeColor: '#dc2626'
  },
  {
    id: 'poi-graderia-plaza-narino',
    name: 'Graderías VIP Plaza de Nariño',
    category: 'graderia',
    icon: '🏟️',
    coords: [1.2135, -77.2810],
    address: 'Calle 18 con Carrera 25',
    description: 'Tribunas cívicas y prensa oficial.',
    badgeColor: '#dc2626'
  }
];

export default CARNAVAL_POIS;
