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
 * Calcula la ruta exacta a pie por la malla vial de Pasto usando OSRM con timeout seguro y fallback en línea recta.
 * @param start Coordenadas de inicio [latitud, longitud]
 * @param end Coordenadas de destino [latitud, longitud]
 * @returns Promesa con array de coordenadas [latitud, longitud] formateadas para Leaflet
 */
export async function getStreetRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return [start, end];
    }

    const data = await res.json();
    if (data.routes && data.routes[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    }
    return [start, end];
  } catch (err) {
    console.warn('Fallback de ruta activado:', err);
    return [start, end];
  }
}

export default getStreetRoute;
