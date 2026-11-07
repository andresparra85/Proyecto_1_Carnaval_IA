/**
 * Servicio de enrutamiento vial real por calles para San Juan de Pasto
 * utilizando la API pública de OSRM (Open Source Routing Machine).
 */

export interface StreetRouteResponse {
  coordinates: [number, number][];
  distanceMeters?: number;
  durationSeconds?: number;
}

/**
 * Calcula la ruta exacta a pie por la malla vial de Pasto usando OSRM.
 * @param start Coordenadas de inicio [latitud, longitud]
 * @param end Coordenadas de destino [latitud, longitud]
 * @returns Promesa con array de coordenadas [latitud, longitud] formateadas para Leaflet
 */
export async function getStreetRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  try {
    // OSRM utiliza formato [longitud, latitud]
    const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
        // Convierte [lng, lat] retornado por OSRM a [lat, lng] para Leaflet
        return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      }
    }

    // Fallback con el perfil alternativo 'walking' de OSRM
    const fallbackUrl = `https://router.project-osrm.org/route/v1/walking/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (fallbackData.routes && fallbackData.routes.length > 0 && fallbackData.routes[0].geometry?.coordinates) {
        return fallbackData.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      }
    }

    return [start, end];
  } catch (err) {
    console.error('Error calculando ruta en OSRM:', err);
    return [start, end];
  }
}

export default getStreetRoute;

