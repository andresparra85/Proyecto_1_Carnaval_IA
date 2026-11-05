export interface Landmark {
  id: string;
  name: string;
  category: 'evento' | 'patrimonio' | 'salud' | 'plaza';
  coords: [number, number];
  description: string;
}

export const CARNAVAL_LANDMARKS: Record<string, Landmark> = {
  desfile_magno: {
    id: 'desfile_magno',
    name: 'Desfile Magno (6 de Enero) - Senda Completa',
    category: 'evento',
    coords: [1.21540, -77.28410],
    description: 'El día cumbre del Carnaval. Recorre toda la Senda oficial desde la Normal Superior hasta Champagnat.'
  },
  castaneda: {
    id: 'castaneda',
    name: 'Llegada de la Familia Castañeda (4 de Enero)',
    category: 'evento',
    coords: [1.21852, -77.26941],
    description: 'Apertura oficial del Carnaval en la Senda, partiendo desde la Normal Superior.'
  },
  dia_negros: {
    id: 'dia_negros',
    name: 'Día de Negros (5 de Enero)',
    category: 'evento',
    coords: [1.21540, -77.28410],
    description: 'Juego de caricias y cosmético en las principales plazas: Plaza del Carnaval y Parque Nariño.'
  },
  plaza_carnaval: {
    id: 'plaza_carnaval',
    name: 'Plaza del Carnaval y la Cultura',
    category: 'plaza',
    coords: [1.21540, -77.28410],
    description: 'Punto neurálgico de conciertos, tablados y concentración de comparsas.'
  },
  parque_narino: {
    id: 'parque_narino',
    name: 'Plaza de Nariño (Centro Histórico)',
    category: 'patrimonio',
    coords: [1.21380, -77.28180],
    description: 'Corazón histórico de Pasto y paso peatonal de la fiesta.'
  },
  puesto_salud_normal: {
    id: 'puesto_salud_normal',
    name: 'Puesto de Primeros Auxilios - Normal Superior',
    category: 'salud',
    coords: [1.21820, -77.27010],
    description: 'Atención médica y Defensa Civil en el punto de partida de la Senda.'
  },
  puesto_salud_plaza: {
    id: 'puesto_salud_plaza',
    name: 'Puesto de Emergencias - Plaza del Carnaval',
    category: 'salud',
    coords: [1.21510, -77.28390],
    description: 'Módulo de Cruz Roja y Bomberos.'
  }
};

/**
 * Función auxiliar para buscar un hito o evento a partir del texto ingresado por el usuario.
 */
export function findCarnavalLandmark(query: string): Landmark | null {
  const q = query.toLowerCase();

  // Salud / Primeros Auxilios / Emergencias
  if (
    q.includes('salud') ||
    q.includes('primeros auxilios') ||
    q.includes('emergencia') ||
    q.includes('cruz roja') ||
    q.includes('médico') ||
    q.includes('medico') ||
    q.includes('ambulancia') ||
    q.includes('herido') ||
    q.includes('defensa civil')
  ) {
    if (q.includes('normal') || q.includes('salida') || q.includes('inicio') || q.includes('santander')) {
      return CARNAVAL_LANDMARKS.puesto_salud_normal;
    }
    return CARNAVAL_LANDMARKS.puesto_salud_plaza;
  }

  // Familia Castañeda
  if (q.includes('castañeda') || q.includes('castaneda') || q.includes('4 de enero') || q.includes('cuatro de enero')) {
    return CARNAVAL_LANDMARKS.castaneda;
  }

  // Día de Negros
  if (
    q.includes('día de negros') ||
    q.includes('dia de negros') ||
    q.includes('negros') ||
    q.includes('pintica') ||
    q.includes('cosmético') ||
    q.includes('cosmetico') ||
    q.includes('5 de enero') ||
    q.includes('cinco de enero')
  ) {
    return CARNAVAL_LANDMARKS.dia_negros;
  }

  // Desfile Magno / 6 de Enero
  if (
    q.includes('desfile magno') ||
    q.includes('magno') ||
    q.includes('6 de enero') ||
    q.includes('seis de enero') ||
    q.includes('carroza') ||
    q.includes('blancos')
  ) {
    return CARNAVAL_LANDMARKS.desfile_magno;
  }

  // Plaza de Nariño / Parque Nariño
  if (q.includes('parque nariño') || q.includes('parque narino') || q.includes('plaza de nariño') || q.includes('plaza narino')) {
    return CARNAVAL_LANDMARKS.parque_narino;
  }

  // Plaza del Carnaval
  if (q.includes('plaza del carnaval') || q.includes('plaza carnaval') || q.includes('tablado') || q.includes('concierto')) {
    return CARNAVAL_LANDMARKS.plaza_carnaval;
  }

  return null;
}
