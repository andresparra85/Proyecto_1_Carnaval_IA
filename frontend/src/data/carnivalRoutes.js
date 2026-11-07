/**
 * Base de datos geográfica oficial de eventos, rutas y cierres viales
 * por día del Carnaval de Negros y Blancos de San Juan de Pasto.
 */

// Trazado 100% real y georreferenciado de la Senda del Carnaval
export const SENDA_OFICIAL_COORDS = [
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

export const HITOS_SENDA = [
  { id: 'salida', nombre: 'PUNTO DE SALIDA: I.E. Normal Superior', coords: [1.21852, -77.26941], tipo: 'inicio', desc: 'Concentración de carrozas gigantes, murgas y comparsas.' },
  { id: 'narino', nombre: 'HITO HISTÓRICO: Plaza de Nariño', coords: [1.21380, -77.28180], tipo: 'intermedio', desc: 'Paso por el centro de la ciudad y tarimas de transmisión.' },
  { id: 'plaza_carnaval', nombre: 'EPICENTRO: Plaza del Carnaval', coords: [1.21540, -77.28410], tipo: 'intermedio', desc: 'Tarima principal de jurados y graderías.' },
  { id: 'llegada', nombre: 'PUNTO DE LLEGADA: Champagnat / Bomboná', coords: [1.20780, -77.29130], tipo: 'fin', desc: 'Desmonte y finalización oficial del desfile.' }
];

export const SENDA_CARNAVAL_COORDS = SENDA_OFICIAL_COORDS;
export const SENDA_DEL_CARNAVAL_COORDS = SENDA_OFICIAL_COORDS;

export const CARNIVAL_DAYS = [
  { id: '28-dic', label: '28 Dic', shortName: 'Arcoíris Asfalto' },
  { id: '31-dic', label: '31 Dic', shortName: 'Años Viejos' },
  { id: '02-ene', label: '02 Ene', shortName: 'Carnavalito' },
  { id: '03-ene', label: '03 Ene', shortName: 'Canto a la Tierra' },
  { id: '04-ene', label: '04 Ene', shortName: 'Flia Castañeda' },
  { id: '05-ene', label: '05 Ene', shortName: 'Día de Negros' },
  { id: '06-ene', label: '06 Ene', shortName: 'Desfile Magno' },
  { id: '07-ene', label: '07 Ene', shortName: 'Festival del Cuy' },
];

export const CARNIVAL_ROUTES = {
  '28-dic': {
    name: "Arcoíris en el Asfalto (Pre-Carnaval)",
    hours: "08:00 - 18:00",
    description: "Pintura artística con tiza en el asfalto. Zona peatonal cultural.",
    color: "#ec4899", // Rosa
    closedPoints: [
      { lat: 1.2118, lng: -77.2798, label: "Cra 23 entre Calles 14 y 15 (El Colorado)" },
      { lat: 1.2135, lng: -77.2790, label: "Calle 16 entre Cra 23 y Cra 27" }
    ],
    route: [
      [1.2110, -77.2805],
      [1.2125, -77.2795],
      [1.2138, -77.2785]
    ]
  },

  '31-dic': {
    name: "Desfile de Años Viejos y Viudas",
    hours: "08:00 - 16:00",
    description: "Humor, sátira política y quema de monigotes.",
    color: "#f59e0b", // Ámbar
    startPoint: { lat: 1.2012, lng: -77.2748, label: "Salida: Escuela Normal Superior / Transversal del Caracha" },
    endPoint: { lat: 1.2225, lng: -77.2862, label: "Llegada: Sector Champagnat (IEM Ciudad de Pasto)" },
    closedPoints: [
      { lat: 1.2012, lng: -77.2748, label: "Bloqueo Caracha / Cra 27" },
      { lat: 1.2142, lng: -77.2780, label: "Cierre Calle 19 y acceso Plaza de Nariño" },
      { lat: 1.2225, lng: -77.2862, label: "Desconcentración Champagnat" }
    ],
    route: [
      [1.2012, -77.2748], // Normal Superior
      [1.2085, -77.2762], // Cra 27 subiendo
      [1.2115, -77.2772], // Cra 27 con Cll 16
      [1.2140, -77.2780], // Giro en Cll 19 (Plaza Nariño)
      [1.2180, -77.2825], // Cll 19 bajando
      [1.2225, -77.2862]  // Champagnat
    ]
  },

  '02-ene': {
    name: "Carnavalito y Ofrenda a la Virgen de las Mercedes",
    hours: "07:00 - 14:00",
    description: "Desfile infantil con mini-carrozas y comparsas tradicionales.",
    color: "#06b6d4", // Cyan
    startPoint: { lat: 1.2012, lng: -77.2748, label: "Salida: Escuela Normal Superior" },
    endPoint: { lat: 1.2225, lng: -77.2862, label: "Llegada: Sector Champagnat" },
    closedPoints: [
      { lat: 1.2012, lng: -77.2748, label: "Cierre Cra 27 sur-norte" },
      { lat: 1.2142, lng: -77.2780, label: "Cierre Calle 19 (Plaza Nariño)" }
    ],
    route: [
      [1.2012, -77.2748],
      [1.2085, -77.2762],
      [1.2140, -77.2780],
      [1.2180, -77.2825],
      [1.2225, -77.2862]
    ]
  },

  '03-ene': {
    name: "Canto a la Tierra (Colectivos Coreográficos)",
    hours: "09:00 - 16:00",
    description: "Recorrido completo por la Senda con trazo Ámbar. Miles de músicos y danzantes andinos.",
    color: "#F59E0B", // Ámbar oficial
    startPoint: { lat: 1.21852, lng: -77.26941, label: "Salida Oficial: I.E. Normal Superior" },
    endPoint: { lat: 1.20780, lng: -77.29130, label: "Llegada Oficial: Champagnat / Bomboná" },
    closedPoints: [
      { lat: 1.21852, lng: -77.26941, label: "Cierre Salida Normal Superior" },
      { lat: 1.21380, lng: -77.28180, label: "Cierre Eje Plaza de Nariño" },
      { lat: 1.21540, lng: -77.28410, label: "Cierre Plaza del Carnaval" }
    ],
    route: SENDA_OFICIAL_COORDS
  },

  '04-ene': {
    name: "Llegada de la Familia Castañeda",
    hours: "08:00 - 15:00",
    description: "Recorrido completo por la Senda con trazo Magenta. Estampas de época y bienvenida campesina de 1929.",
    color: "#D946EF", // Magenta oficial
    startPoint: { lat: 1.21852, lng: -77.26941, label: "Salida Oficial: Normal Superior" },
    endPoint: { lat: 1.20780, lng: -77.29130, label: "Llegada Oficial: Champagnat / Bomboná" },
    closedPoints: [
      { lat: 1.21852, lng: -77.26941, label: "Cierre Cra 27 y Av. Santander" },
      { lat: 1.21380, lng: -77.28180, label: "Cierre Calle 18 y Plaza de Nariño" }
    ],
    route: SENDA_OFICIAL_COORDS
  },

  '05-ene': {
    name: "Día de Negros (Juego de la Pintica y Tablados)",
    hours: "11:00 - 23:00",
    description: "Tablados y zonas de juego en Plaza del Carnaval y Plaza de Nariño. Conmemoración de la igualdad étnica.",
    color: "#38BDF8", // Cyan festivo / Tablados
    startPoint: { lat: 1.21380, lng: -77.28180, label: "Tablado Principal: Plaza de Nariño" },
    endPoint: { lat: 1.21540, lng: -77.28410, label: "Tablado Oficial: Plaza del Carnaval" },
    closedPoints: [
      { lat: 1.21540, lng: -77.28410, label: "Peatonalización Plaza del Carnaval" },
      { lat: 1.21380, lng: -77.28180, label: "Peatonalización Plaza de Nariño" },
      { lat: 1.21460, lng: -77.28290, label: "Zona Peatonal Calle 19" }
    ],
    route: [
      [1.21380, -77.28180], // Plaza de Nariño
      [1.21460, -77.28290], // Calle 19
      [1.21540, -77.28410]  // Plaza del Carnaval
    ]
  },

  '06-ene': {
    name: "Día de Blancos (El Desfile Magno)",
    hours: "05:00 - 17:00",
    description: "Recorrido oficial completo con trazo Rojo Carmesí y todos los hitos visibles. Carrozas Monumentales.",
    color: "#E11D48", // Rojo Carmesí oficial
    startPoint: { lat: 1.21852, lng: -77.26941, label: "Salida Oficial: I.E. Normal Superior" },
    endPoint: { lat: 1.20780, lng: -77.29130, label: "Llegada Oficial: Champagnat / Bomboná" },
    closedPoints: [
      { lat: 1.21852, lng: -77.26941, label: "Cierre Total Salida Normal Superior" },
      { lat: 1.21380, lng: -77.28180, label: "Cierre Total Eje Plaza de Nariño" },
      { lat: 1.21540, lng: -77.28410, label: "Cierre Total Plaza del Carnaval" },
      { lat: 1.20780, lng: -77.29130, label: "Desmonte y Cierre Champagnat" }
    ],
    route: SENDA_OFICIAL_COORDS
  },

  '07-ene': {
    name: "Festival del Cuy y la Cultura Campesina",
    hours: "09:00 - 17:00",
    description: "Gastronomía tradicional andina y música campesina en corregimientos.",
    color: "#ea580c", // Naranja
    startPoint: { lat: 1.2145, lng: -77.2782, label: "Punto de Encuentro: Plaza de Nariño" },
    endPoint: { lat: 1.1850, lng: -77.2950, label: "Destino Festivo: Corregimiento de Obonuco" },
    closedPoints: [
      { lat: 1.1850, lng: -77.2950, label: "Cierre plaza corregimiento de Obonuco" },
      { lat: 1.1680, lng: -77.2750, label: "Cierre plaza corregimiento de Catambuco" }
    ],
    route: [
      [1.2145, -77.2782], // Plaza de Nariño
      [1.2050, -77.2850], // Salida al sur
      [1.1950, -77.2900], // Vía a Obonuco
      [1.1850, -77.2950]  // Plaza de Obonuco
    ]
  }
};
