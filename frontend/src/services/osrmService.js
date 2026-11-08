/**
 * Servicio de enrutamiento OSRM para cálculo vial exacto calle por calle
 * adaptando los trazados de los desfiles al asfalto real de San Juan de Pasto.
 */

const routeCache = new Map();

/**
 * Consulta la geometría vial continua y exacta a OSRM para conectar los waypoints oficiales.
 * @param {[number, number][]} waypoints Array de waypoints en formato [longitud, latitud]
 * @returns {Promise<[number, number][]>} Array denso de coordenadas viales en formato Leaflet [latitud, longitud]
 */
export async function fetchSnappedStreetRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    console.warn('fetchSnappedStreetRoute: Se requieren al menos dos waypoints [lng, lat].');
    return [];
  }

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

      routeCache.set(cacheKey, denseStreetCoords);
      return denseStreetCoords;
    }

    throw new Error('Geometría no disponible en la respuesta de OSRM');
  } catch (err) {
    console.warn('Aviso: Falló consulta OSRM en tiempo real, generando interpolación densa:', err?.message);
    // Interpolación densa de respaldo entre waypoints consecutivos para evitar cortes secos
    const fallbackCoords = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const [startLng, startLat] = waypoints[i];
      const [endLng, endLat] = waypoints[i + 1];
      const steps = 15;
      for (let s = 0; s < steps; s++) {
        const factor = s / steps;
        fallbackCoords.push([
          startLat + (endLat - startLat) * factor,
          startLng + (endLng - startLng) * factor,
        ]);
      }
    }
    const last = waypoints[waypoints.length - 1];
    fallbackCoords.push([last[1], last[0]]);
    return fallbackCoords;
  }
}

export default {
  fetchSnappedStreetRoute,
};
