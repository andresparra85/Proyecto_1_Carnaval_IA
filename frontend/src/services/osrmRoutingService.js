/**
 * Servicio de enrutamiento peatonal OSRM para conectar a espectadores con la Senda del Carnaval
 * de San Juan de Pasto.
 * Utiliza el perfil 'foot' de Open Source Routing Machine (OSRM) con fallback de seguridad.
 */

/**
 * Consulta la ruta peatonal exacta por calles entre la posición del usuario y un punto objetivo de la Senda.
 * @param {number} userLat Latitud del usuario
 * @param {number} userLng Longitud del usuario
 * @param {number} targetLat Latitud del destino en la Senda
 * @param {number} targetLng Longitud del destino en la Senda
 * @returns {Promise<{ coordinates: [number, number][], distanceMeters: number, durationMinutes: number }>}
 */
export async function getWalkingRouteToSenda(userLat, userLng, targetLat, targetLng) {
  // Validación de coordenadas numéricas
  if (
    typeof userLat !== 'number' || isNaN(userLat) ||
    typeof userLng !== 'number' || isNaN(userLng) ||
    typeof targetLat !== 'number' || isNaN(targetLat) ||
    typeof targetLng !== 'number' || isNaN(targetLng)
  ) {
    console.warn('Coordenadas inválidas para enrutamiento OSRM:', { userLat, userLng, targetLat, targetLng });
    return {
      coordinates: [],
      distanceMeters: 0,
      durationMinutes: 0
    };
  }

  const fallback = {
    coordinates: [
      [userLat, userLng],
      [targetLat, targetLng]
    ],
    distanceMeters: Math.round(calculateHaversineDistance(userLat, userLng, targetLat, targetLng) * 1000),
    durationMinutes: Math.round((calculateHaversineDistance(userLat, userLng, targetLat, targetLng) / 4.5) * 60)
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // OSRM espera coordenadas en formato [lng, lat] separadas por punto y coma
    const url = `https://router.project-osrm.org/route/v1/foot/${userLng},${userLat};${targetLng},${targetLat}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Respuesta fallida de OSRM (${response.status}), usando fallback en línea recta.`);
      return fallback;
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (route && route.geometry && Array.isArray(route.geometry.coordinates)) {
      // OSRM devuelve [lng, lat]; Leaflet requiere [lat, lng]
      const decodedCoordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      return {
        coordinates: decodedCoordinates,
        distanceMeters: Math.round(route.distance || fallback.distanceMeters),
        durationMinutes: Math.max(1, Math.round((route.duration || 0) / 60))
      };
    }

    return fallback;
  } catch (error) {
    console.warn('Error al calcular ruta peatonal OSRM:', error);
    return fallback;
  }
}

/**
 * Encuentra el punto más cercano de la Senda a las coordenadas dadas
 * @param {number} userLat
 * @param {number} userLng
 * @param {[number, number][]} sendaCoords
 * @returns {[number, number]}
 */
export function findNearestPointOnSenda(userLat, userLng, sendaCoords) {
  if (!Array.isArray(sendaCoords) || sendaCoords.length === 0) {
    return [1.2140, -77.2820]; // Plaza Nariño por defecto
  }

  let minDistance = Infinity;
  let nearestPoint = sendaCoords[0];

  for (let i = 0; i < sendaCoords.length; i++) {
    const [sLat, sLng] = sendaCoords[i];
    const dist = calculateHaversineDistance(userLat, userLng, sLat, sLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = [sLat, sLng];
    }
  }

  return nearestPoint;
}

/**
 * Distancia euclidiana / Haversine en kilómetros entre dos coordenadas
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
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
 * Realiza el map-matching con la API de OSRM Match para ceñir los waypoints
 * con precisión milimétrica al asfalto de las vías de Pasto.
 * @param {[number, number][]} coordinates Array de coordenadas [lat, lng]
 * @returns {Promise<[number, number][]>} Array de coordenadas ajustadas a la calzada [lat, lng]
 */
export async function getSnappedSendaRoute(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return coordinates || [];
  }

  // Prepara la cadena de coordenadas en formato lng,lat requerida por OSRM
  const coordsString = coordinates
    .map(([lat, lng]) => `${lng.toFixed(5)},${lat.toFixed(5)}`)
    .join(';');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://router.project-osrm.org/match/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OSRM Match falló con status ${response.status}, usando fallback denso.`);
      return coordinates;
    }

    const data = await response.json();

    if (data && data.matchings && data.matchings.length > 0) {
      // Combina las geometrías de todos los segmentos encontrados
      const allSnapped = [];
      data.matchings.forEach((match) => {
        if (match.geometry && Array.isArray(match.geometry.coordinates)) {
          // OSRM entrega [lng, lat]; Leaflet requiere [lat, lng]
          const mapped = match.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          allSnapped.push(...mapped);
        }
      });

      if (allSnapped.length >= 2) {
        return allSnapped;
      }
    }

    return coordinates;
  } catch (err) {
    console.warn('Aviso OSRM Match (usando trazado denso de respaldo):', err?.message);
    return coordinates;
  }
}

/**
 * Consulta la ruta peatonal OSRM entre dos pares de coordenadas [lat, lng].
 * @param {[number, number]} startCoords Coordenadas de origen [lat, lng]
 * @param {[number, number]} endCoords Coordenadas de destino [lat, lng]
 * @returns {Promise<{ coordinates: [number, number][], distanceMeters: number, durationMinutes: number }>}
 */
export async function fetchFootRoute(startCoords, endCoords) {
  if (!Array.isArray(startCoords) || !Array.isArray(endCoords) || startCoords.length < 2 || endCoords.length < 2) {
    console.warn('fetchFootRoute: coordenadas de inicio o fin inválidas', { startCoords, endCoords });
    return { coordinates: [], distanceMeters: 0, durationMinutes: 0 };
  }
  return getWalkingRouteToSenda(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
}

export default {
  getWalkingRouteToSenda,
  fetchFootRoute,
  findNearestPointOnSenda,
  calculateHaversineDistance,
  getSnappedSendaRoute,
};
