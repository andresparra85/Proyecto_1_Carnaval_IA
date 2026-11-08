import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapAction } from '../context/MapActionContext';

export interface IncidentReportData {
  id: string | number;
  title?: string;
  description?: string;
  incident_type?: string;
  category?: string;
  ai_risk_level?: 'Alto' | 'Medio' | 'Bajo' | string;
  severity?: string;
  latitude?: number;
  longitude?: number;
  coords?: [number, number];
  created_at?: string;
  verified?: boolean;
}

export interface ReportMarkerProps {
  report: IncidentReportData;
  userGps?: [number, number] | null;
  onRouteClick?: (coords: [number, number], title: string) => void;
}

// Icono temático de alerta según el nivel de severidad / riesgo AI
function createReportIcon(report: IncidentReportData) {
  const risk = report.ai_risk_level || report.severity || 'Medio';
  let bg = '#f59e0b'; // Medio
  let emoji = '⚠️';

  if (risk === 'Alto' || risk === 'high') {
    bg = '#e11d48'; // Carmesí crítico
    emoji = '🚨';
  } else if (risk === 'Bajo' || risk === 'low') {
    bg = '#3b82f6';
    emoji = 'ℹ️';
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        background: ${bg};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px ${bg}aa, 0 4px 8px rgba(0,0,0,0.5);
      ">
        <div style="transform: rotate(45deg); font-size: 15px;">
          ${emoji}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: `custom-report-marker-${report.id}`,
    html,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -46],
  });
}

/**
 * Marcador de Reporte Ciudadano o Incidencia para Leaflet con botón interactivo
 * de trazado de ruta peatonal directa OSRM hacia sus coordenadas.
 */
export const ReportMarker: React.FC<ReportMarkerProps> = ({ report, userGps, onRouteClick }) => {
  const { dispatchMapCommand } = useMapAction();

  const coords: [number, number] | null = report.coords
    ? report.coords
    : typeof report.latitude === 'number' && typeof report.longitude === 'number'
    ? [report.latitude, report.longitude]
    : null;

  if (!coords) return null;

  const title = report.title || report.incident_type || report.category || 'Incidencia';
  const risk = report.ai_risk_level || report.severity || 'Informativo';

  const handleHowToGetThere = () => {
    const start: [number, number] = userGps || [1.2138, -77.2818]; // Plaza Nariño por defecto

    // Despacho del comando de enrutamiento sin romper el ciclo de vida del mapa
    dispatchMapCommand({
      actionType: 'DRAW_ROUTE',
      payload: {
        startCoords: start,
        targetCoords: coords,
        targetName: `Alerta: ${title}`,
        category: 'reporte',
      },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('route-to-poi', {
          detail: {
            startCoords: start,
            targetCoords: coords,
            targetName: `Alerta: ${title}`,
          },
        })
      );
    }

    if (onRouteClick) {
      onRouteClick(coords, title);
    }
  };

  return (
    <Marker position={coords} icon={createReportIcon(report)}>
      <Popup className="custom-popup" autoPan={true}>
        <div className="p-2.5 min-w-[210px] max-w-[260px] font-sans text-xs bg-slate-900 text-white rounded-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
            <span className="font-bold text-rose-400 uppercase text-[11px] truncate">{title}</span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                risk === 'Alto'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : risk === 'Medio'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
              }`}
            >
              {risk}
            </span>
          </div>

          {report.description && (
            <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
              {report.description}
            </p>
          )}

          <div className="text-[10px] text-slate-400 font-mono mb-2 flex justify-between">
            <span>Lat: {coords[0].toFixed(4)}</span>
            <span>Lng: {coords[1].toFixed(4)}</span>
          </div>

          {/* Botón interactivo para trazar ruta peatonal */}
          <button
            type="button"
            onClick={handleHowToGetThere}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
            title={`Trazar ruta hacia ${title}`}
          >
            <span>📍</span>
            <span>¿Cómo llegar a pie?</span>
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default ReportMarker;
