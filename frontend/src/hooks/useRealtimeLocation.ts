import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number; // Radio de precisión en metros
  isReal: boolean; // True si proviene de GPS real, False si es fallback
  timestamp?: number;
}

export type GeolocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface RealtimeLocationState {
  location: UserLocation;
  error: string | null;
  permission: GeolocationPermissionStatus;
  isTracking: boolean;
  centerOnMe: (mapInstance?: any) => void;
}

// Centro de San Juan de Pasto (Plaza de Nariño) como fallback oficial
export const PASTO_FALLBACK_COORDINATES: [number, number] = [1.2148, -77.2780];

/**
 * Hook para geolocalización en tiempo real utilizando la API HTML5 Geolocation con watchPosition.
 * Monitorea el desplazamiento continuo del usuario sobre el mapa de la Senda del Carnaval.
 */
export function useRealtimeLocation(): RealtimeLocationState {
  const [location, setLocation] = useState<UserLocation>({
    lat: PASTO_FALLBACK_COORDINATES[0],
    lng: PASTO_FALLBACK_COORDINATES[1],
    accuracy: 25,
    isReal: false,
    timestamp: Date.now(),
  });

  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<GeolocationPermissionStatus>('prompt');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Función para re-centrar el mapa sobre las coordenadas actuales del usuario
  const centerOnMe = useCallback((mapInstance?: any) => {
    const targetCoords: [number, number] = [location.lat, location.lng];

    if (mapInstance && typeof mapInstance.flyTo === 'function') {
      mapInstance.flyTo(targetCoords, 17, {
        animate: true,
        duration: 1.5,
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('CENTER_MAP_ON_USER', {
          detail: {
            lat: location.lat,
            lng: location.lng,
            zoom: 17,
          },
        })
      );
    }
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermission('unsupported');
      setError('La geolocalización no es compatible con este navegador.');
      return;
    }

    // Consulta de permisos si la API de Permissions está disponible
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          setPermission(permissionStatus.state as GeolocationPermissionStatus);
          permissionStatus.onchange = () => {
            setPermission(permissionStatus.state as GeolocationPermissionStatus);
          };
        })
        .catch(() => {
          // Algunos navegadores no implementan query para geolocation
        });
    }

    const geoSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy || 10,
        isReal: true,
        timestamp: position.timestamp,
      });
      setError(null);
      setPermission('granted');
      setIsTracking(true);

      // Despacha evento global para componentes desacoplados
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('USER_GPS_UPDATED', {
            detail: {
              lat: latitude,
              lng: longitude,
              accuracy: accuracy || 10,
            },
          })
        );
      }
    };

    const geoError = (err: GeolocationPositionError) => {
      console.warn('[useRealtimeLocation] Advertencia de GPS:', err.message);
      setIsTracking(false);

      if (err.code === err.PERMISSION_DENIED) {
        setPermission('denied');
        setError('Permiso de ubicación denegado. Usando centro de Pasto como referencia.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError('Señal GPS no disponible. Usando coordenadas referenciales.');
      } else if (err.code === err.TIMEOUT) {
        setError('Tiempo de espera de GPS agotado.');
      } else {
        setError(err.message || 'Error al obtener geolocalización.');
      }

      // Fallback seguro a Pasto
      setLocation((prev) => ({
        ...prev,
        lat: PASTO_FALLBACK_COORDINATES[0],
        lng: PASTO_FALLBACK_COORDINATES[1],
        isReal: false,
      }));
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000,
    };

    // Inicia seguimiento en vivo
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(geoSuccess, geoError, options);
      setIsTracking(true);
    } catch (e: any) {
      setError(e?.message || 'Error al inicializar watchPosition');
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    error,
    permission,
    isTracking,
    centerOnMe,
  };
}

export default useRealtimeLocation;
