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

export function CarnavalMap({
  selectedDay = '06-ene',
  onSelectDay,
}) {
  const currentTrack = CARNAVAL_DAYS_TRACKS[selectedDay] || CARNAVAL_DAYS_TRACKS['06-ene'];
  const routeCoords = currentTrack.coords || SENDA_OFICIAL_STREET_COORDS;

  // Puntos terminales: Salida y Llegada
  const startPoint = currentTrack.startPoint;
  const endPoint = currentTrack.endPoint;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={[1.2140, -77.2820]}
        zoom={15}
        className="h-[calc(100vh-4rem)] w-full relative z-0"
        style={{ minHeight: '500px', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
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
            color: '#10b981', // Color esmeralda vibrante
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
