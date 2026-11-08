import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SENDA_OFICIAL_STREET_COORDS,
  CARNAVAL_DAYS_TRACKS,
  SENDA_POINTS_OF_INTEREST,
} from '../data/carnavalRoutesGeoJSON';
import {
  calculateHaversineDistance,
  getWalkingRouteToSenda,
  getSnappedSendaRoute,
} from '../services/osrmRoutingService';

// Solución clásica de iconos rotos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para el Punto de Partida (Salida)
export function createTerminalStartIcon() {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.75), 0 8px 16px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
          🚩
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #10b981;
        font-family: sans-serif;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #10b981;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        SALIDA OFICIAL
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-terminal-start-icon',
    html,
    iconSize: [42, 60],
    iconAnchor: [21, 60],
    popupAnchor: [0, -62],
  });
}

// Icono personalizado para el Punto de Culminación (Llegada)
export function createTerminalEndIcon() {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px rgba(225, 29, 72, 0.75), 0 8px 16px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
          🏁
        </div>
      </div>
      <div style="
        background: #0f172a;
        color: #fb7185;
        font-family: sans-serif;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #e11d48;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        META / LLEGADA
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-terminal-end-icon',
    html,
    iconSize: [42, 60],
    iconAnchor: [21, 60],
    popupAnchor: [0, -62],
  });
}

// Icono GPS en tiempo real para el espectador con anillo radar pulsante
export function createSpectatorGpsIcon() {
  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <!-- Anillo radar exterior pulsante -->
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.35);
        border: 2px solid #3b82f6;
        animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <!-- Punto azul central -->
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #2563eb;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.9), 0 2px 4px rgba(0,0,0,0.5);
      "></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-spectator-gps-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Icono personalizado para Puntos de Interés a lo largo de la Senda
export function createPoiIcon(poi) {
  const bg = poi.badgeColor || '#f59e0b';
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: ${bg};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px ${bg}88, 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">
          ${poi.icon || '📍'}
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    className: `custom-senda-poi-icon-${poi.id}`,
    html,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
  });
}

// Controlador de cámara para animar suavemente a los límites de la Senda seleccionada
function DynamicRouteCameraController({ routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (map && routeCoords && routeCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 16,
          animate: true,
          duration: 1.2,
        });
      } catch (err) {
        console.warn('Error al ajustar límites de la ruta:', err);
      }
    }
  }, [map, routeCoords]);
  return null;
}

export const AVAILABLE_CARNAVAL_DAYS = [
  { id: '03-ene', label: '3 de Enero - Canto a la Tierra', short: '3 Ene • Canto a la Tierra', icon: '🌿' },
  { id: '04-ene', label: '4 de Enero - Familia Castañeda', short: '4 Ene • Flia Castañeda', icon: '👨‍👩‍👦' },
  { id: '05-ene', label: '5 de Enero - Día de Negros', short: '5 Ene • Día de Negros', icon: '🎨' },
  { id: '06-ene', label: '6 de Enero - Desfile Magno', short: '6 Ene • Desfile Magno', icon: '👑' },
];

export function CarnavalMap({
  selectedDay: propSelectedDay = '06-ene',
  onSelectDay,
}) {
  const [currentDay, setCurrentDay] = useState(propSelectedDay);

  useEffect(() => {
    if (propSelectedDay) {
      setCurrentDay(propSelectedDay);
    }
  }, [propSelectedDay]);

  const handleDaySelect = (dayId) => {
    setCurrentDay(dayId);
    if (onSelectDay) {
      onSelectDay(dayId);
    }
  };

  const currentTrack = CARNAVAL_DAYS_TRACKS[currentDay] || CARNAVAL_DAYS_TRACKS['06-ene'];
  const routeCoords = currentTrack.coords || SENDA_OFICIAL_STREET_COORDS;

  // Ruta procesada por el servicio de map-matching OSRM para ceñirse milimétricamente al asfalto
  const [snappedRoute, setSnappedRoute] = useState(routeCoords);

  useEffect(() => {
    let isMounted = true;
    setSnappedRoute(routeCoords);

    getSnappedSendaRoute(routeCoords)
      .then((snapped) => {
        if (isMounted && Array.isArray(snapped) && snapped.length >= 2) {
          setSnappedRoute(snapped);
        }
      })
      .catch((err) => {
        console.warn('Aviso OSRM snapping (usando trazado denso de respaldo):', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDay, routeCoords]);

  // Puntos terminales: Salida y Llegada
  const startPoint = currentTrack.startPoint;
  const endPoint = currentTrack.endPoint;

  // Rastreo GPS en tiempo real del espectador con watchPosition
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        console.warn('Aviso de geolocalización espectador:', err?.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 2000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Cálculo de cercanía del espectador a la Senda en metros (umbral < 50m)
  const distanceToSendaMeters = React.useMemo(() => {
    if (!userPosition || !routeCoords || routeCoords.length === 0) return Infinity;
    let minD = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
      const [sLat, sLng] = routeCoords[i];
      const distKm = calculateHaversineDistance(userPosition.lat, userPosition.lng, sLat, sLng);
      const distMeters = distKm * 1000;
      if (distMeters < minD) {
        minD = distMeters;
      }
    }
    return minD;
  }, [userPosition, routeCoords]);

  const isNearSenda = distanceToSendaMeters <= 50;

  // Estado para la ruta peatonal calculada por OSRM
  const [walkingRoute, setWalkingRoute] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  const handleRouteToPoi = async (poi) => {
    setIsRouting(true);
    const startLat = userPosition ? userPosition.lat : 1.2138;
    const startLng = userPosition ? userPosition.lng : -77.2818;

    try {
      const result = await getWalkingRouteToSenda(startLat, startLng, poi.coords[0], poi.coords[1]);
      setWalkingRoute({
        coordinates: result.coordinates,
        targetName: poi.name,
        distanceMeters: result.distanceMeters,
        durationMinutes: result.durationMinutes,
      });
    } catch (err) {
      console.warn('Error calculando ruta a pie hacia POI:', err);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Badge en vivo si el usuario se encuentra a menos de 50 metros de la Senda */}
      {isNearSenda && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[950] animate-bounce px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 text-white font-black text-xs sm:text-sm shadow-2xl border-2 border-white/40 flex items-center gap-2 whitespace-nowrap">
          <span className="text-base">🎉</span>
          <span>¡Estás sobre la Senda del Carnaval! 🎉</span>
        </div>
      )}
      {/* Selector dinámico de trazado por día del evento (Glassmorphic) */}
      <div className="absolute top-4 left-4 z-[900] max-w-[95vw] sm:max-w-2xl bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {AVAILABLE_CARNAVAL_DAYS.map((day) => {
            const isSelected = day.id === currentDay;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDaySelect(day.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-lg font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={day.label}
              >
                <span>{day.icon}</span>
                <span className="hidden sm:inline">{day.label}</span>
                <span className="inline sm:hidden">{day.short}</span>
              </button>
            );
          })}
        </div>
        {/* Metadatos en vivo del día seleccionado */}
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 px-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400">{currentTrack.name}</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">{currentTrack.lengthKm} km</span>
          </div>
          <span className="text-[10px] text-slate-400 hidden md:inline font-mono">
            {currentTrack.direction}
          </span>
        </div>
      </div>

      <MapContainer
        center={[1.2140, -77.2820]}
        zoom={15}
        className="h-[calc(100vh-4rem)] w-full relative z-0"
        style={{ minHeight: '500px', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <DynamicRouteCameraController routeCoords={snappedRoute} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* 1. Efecto de resplandor / sombra exterior para destacar sobre el fondo del mapa */}
        <Polyline
          positions={snappedRoute}
          pathOptions={{
            color: '#e11d48',
            weight: 10,
            opacity: 0.3,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />

        {/* 2. Capa vectorial principal oficial ceñida a la calzada vial */}
        <Polyline
          positions={snappedRoute}
          pathOptions={{
            color: '#e11d48',
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'drop-shadow-lg',
          }}
        />

        {/* 3. Marcador especial de Salida (Punto de Partida) */}
        {startPoint && (
          <Marker position={startPoint.coords} icon={createTerminalStartIcon()}>
            <Popup className="custom-popup">
              <div className="p-2 min-w-[220px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-400 font-black border-b border-white/10 pb-1 mb-1">
                  <span>🚩</span>
                  <span className="uppercase">{startPoint.name}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {startPoint.description}
                </p>
                <div className="mt-2 text-[10px] text-emerald-300 font-mono">
                  Senda del Carnaval • Inicio Oficial
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Marcador especial de Llegada (Punto de Culminación) */}
        {endPoint && (
          <Marker position={endPoint.coords} icon={createTerminalEndIcon()}>
            <Popup className="custom-popup">
              <div className="p-2 min-w-[220px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                <div className="flex items-center gap-1.5 text-rose-400 font-black border-b border-white/10 pb-1 mb-1">
                  <span>🏁</span>
                  <span className="uppercase">{endPoint.name}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {endPoint.description}
                </p>
                <div className="mt-2 text-[10px] text-rose-300 font-mono">
                  Senda del Carnaval • Meta y Desmonte
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5. Rastreo GPS en tiempo real del espectador con punto azul y anillo radar */}
        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={Math.min(userPosition.accuracy || 25, 45)}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1.5,
              }}
            />
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={createSpectatorGpsIcon()}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[210px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center gap-1.5 text-blue-400 font-black border-b border-white/10 pb-1 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="uppercase">Tu ubicación GPS</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {isNearSenda
                      ? '¡Estás en plena fiesta sobre la Senda del Carnaval!'
                      : `Te encuentras a aprox. ${Math.round(distanceToSendaMeters)} m de la Senda.`}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between border-t border-white/10 pt-1">
                    <span>Lat: {userPosition.lat.toFixed(5)}</span>
                    <span>Lng: {userPosition.lng.toFixed(5)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* 6. Puntos de Interés interactivos a lo largo de la Senda */}
        {SENDA_POINTS_OF_INTEREST.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.coords}
            icon={createPoiIcon(poi)}
          >
            <Popup className="custom-popup">
              <div className="p-2.5 min-w-[220px] max-w-[270px] font-sans text-xs bg-slate-900 text-white rounded-xl">
                <div className="flex items-center gap-1.5 font-bold border-b border-white/10 pb-1 mb-1.5 text-amber-400">
                  <span className="text-base">{poi.icon}</span>
                  <span className="leading-tight">{poi.name}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                  {poi.description}
                </p>
                <div className="text-[10px] text-slate-400 mb-2 font-mono">
                  📍 {poi.address}
                </div>
                <button
                  type="button"
                  onClick={() => handleRouteToPoi(poi)}
                  disabled={isRouting}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>🚶‍♂️</span>
                  <span>{isRouting ? 'Calculando ruta...' : 'Cómo llegar a pie'}</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 7. Polilínea peatonal calculada por OSRM hacia el punto de interés */}
        {walkingRoute && walkingRoute.coordinates && walkingRoute.coordinates.length > 1 && (
          <Polyline
            positions={walkingRoute.coordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              dashArray: '8, 8',
              opacity: 0.95,
            }}
          />
        )}
      </MapContainer>

      {/* Tarjeta flotante de navegación peatonal OSRM activa */}
      {walkingRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[950] max-w-[90vw] sm:max-w-md bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-blue-500/40 shadow-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 text-lg">
              🚶‍♂️
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight">
                Hacia: {walkingRoute.targetName}
              </div>
              <div className="text-[11px] text-blue-300 font-mono">
                {walkingRoute.distanceMeters} m • ~{walkingRoute.durationMinutes} min a pie
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWalkingRoute(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition text-xs font-bold"
            title="Cerrar ruta peatonal"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default CarnavalMap;
