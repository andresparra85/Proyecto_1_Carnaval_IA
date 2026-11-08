/**
 * Servicio de enrutamiento OSRM para generación de la Senda Oficial del Carnaval
 * sobre la malla vial real de San Juan de Pasto.
 */

// Caché en memoria para evitar llamadas redundantes a la API pública de OSRM
const routeCache = new Map();

/**
 * Genera una geometría de alta densidad interpolando puntos intermedios
 * entre cada par consecutivo de waypoints para evitar cortes diagonales o polilíneas secas
 * en caso de indisponibilidad de red o error de OSRM.
 * @param {[number, number][]} waypoints Array en formato [longitud, latitud]
 * @param {number} pointsPerSegment Cantidad de puntos interpolados por segmento
 * @returns {[number, number][]} Array denso en formato Leaflet [latitud, longitud]
 */
export function generateDenseFallbackGeometry(waypoints, pointsPerSegment = 15) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return [];
  if (waypoints.length === 1) return [[waypoints[0][1], waypoints[0][0]]];

  const denseCoordinates = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const [startLng, startLat] = waypoints[i];
    const [endLng, endLat] = waypoints[i + 1];

    for (let step = 0; step < pointsPerSegment; step++) {
      const factor = step / pointsPerSegment;
      const lat = startLat + (endLat - startLat) * factor;
      const lng = startLng + (endLng - startLng) * factor;
      denseCoordinates.push([lat, lng]);
    }
  }

  const lastWaypoint = waypoints[waypoints.length - 1];
  denseCoordinates.push([lastWaypoint[1], lastWaypoint[0]]);

  return denseCoordinates;
}

/**
 * Consulta la geometría vial continua y exacta a OSRM para conectar los hitos de paso obligatorio.
 * Si la consulta falla (red, timeout o error 5xx), recurre a generateDenseFallbackGeometry.
 * @param {[number, number][]} waypoints Array de hitos en formato [longitud, latitud]
 * @returns {Promise<[number, number][]>} Array denso de coordenadas viales en formato Leaflet [latitud, longitud]
 */
export async function getExactStreetParadeRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    console.warn('getExactStreetParadeRoute: Se requieren al menos dos waypoints [lng, lat].');
    return [];
  }

  // Clave única para la caché en memoria
  const cacheKey = waypoints.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const coordsString = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API respondió con estado ${response.status}`);
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (route?.geometry?.coordinates && Array.isArray(route.geometry.coordinates)) {
      // OSRM devuelve [lng, lat]; Leaflet requiere [lat, lng]
      const denseStreetCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      // Guardar en caché antes de retornar
      routeCache.set(cacheKey, denseStreetCoords);
      return denseStreetCoords;
    }

    throw new Error('Geometría no disponible en la respuesta de OSRM');
  } catch (err) {
    console.warn('Aviso: Falló consulta OSRM en tiempo real, activando fallback geométrico de alta densidad:', err?.message);
    const fallbackCoords = generateDenseFallbackGeometry(waypoints, 15);
    return fallbackCoords;
  }
}

export default {
  getExactStreetParadeRoute,
  generateDenseFallbackGeometry,
};
