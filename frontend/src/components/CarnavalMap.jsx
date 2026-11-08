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
} from '../data/carnavalRoutesGeoJSON';

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

  // Puntos terminales: Salida y Llegada
  const startPoint = currentTrack.startPoint;
  const endPoint = currentTrack.endPoint;

  return (
    <div className="relative w-full h-full min-h-[500px]">
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
        <DynamicRouteCameraController routeCoords={routeCoords} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* 1. Borde exterior oscuro para contraste óptico de la Senda */}
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: '#0f172a',
            weight: 10,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* 2. Capa vectorial principal estilizada con identidad del Carnaval (Esmeralda / Dorado vibrante) */}
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: currentTrack.color || '#10b981', // Color temático dinámico del día
            weight: 6,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
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
      </MapContainer>
    </div>
  );
}

export default CarnavalMap;
