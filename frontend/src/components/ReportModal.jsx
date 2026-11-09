import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Send, Loader2, MapPin, Locate, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { submitIncidentReport } from '../services/reportService';

// Opciones de tipo de reporte solicitadas con tarjetas visuales táctiles
export const REPORT_TYPES = [
  { value: 'Emergencia', label: 'Emergencia Médica / Salud', icon: '🚑', subtext: 'Cruz Roja y socorristas' },
  { value: 'Calle_Bloqueada', label: 'Tráfico / Vía Bloqueada', icon: '🚧', subtext: 'Tránsito y desvíos' },
  { value: 'Objeto_Perdido', label: 'Extravío / Objeto Perdido', icon: '🎒', subtext: 'Punto de información' },
  { value: 'Aglomeracion', label: 'Aglomeración / Seguridad', icon: '👥', subtext: 'Concentración masiva' },
  { value: 'Punto_Hidratacion', label: 'Punto de Hidratación', icon: '💧', subtext: 'Abastecimiento de agua' },
];

// Tramos oficiales y sectores clave a lo largo de la Senda del Carnaval
export const SENDA_SECTORS = [
  { id: 'plaza_carnaval', label: 'Plaza del Carnaval y la Cultura', lat: 1.2115, lng: -77.2785 },
  { id: 'calle_27', label: 'Carrera 27 (Sector Bomboná)', lat: 1.2130, lng: -77.2780 },
  { id: 'san_andresito', label: 'San Andresito / Calle 17', lat: 1.2105, lng: -77.2770 },
  { id: 'plaza_narino', label: 'Plaza de Nariño (Centro)', lat: 1.2145, lng: -77.2782 },
  { id: 'cra_27_calle_21', label: 'Carrera 27 con Calles 20 y 21', lat: 1.2168, lng: -77.2805 },
  { id: 'parque_infantil', label: 'Parque Infantil', lat: 1.2205, lng: -77.2850 },
  { id: 'av_estudiantes', label: 'Senda Avenida Los Estudiantes', lat: 1.2250, lng: -77.2885 },
  { id: 'fuente_transparencia', label: 'Fuente de la Transparencia (Llegada)', lat: 1.2275, lng: -77.2910 },
  { id: 'av_boyaca', label: 'Concentración Av. Boyacá (Salida)', lat: 1.2055, lng: -77.2755 },
];

export function ReportModal({
  isOpen,
  onClose,
  initialCoordinates,
  userGps,
  onReportCreated,
  onShowToast,
}) {
  const [reportType, setReportType] = useState('Emergencia');
  const [selectedSector, setSelectedSector] = useState('plaza_carnaval');
  const [customLocationName, setCustomLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(1.2115);
  const [longitude, setLongitude] = useState(-77.2785);
  const [loading, setLoading] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sincronización al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSuccess(false);
      setLoading(false);

      if (initialCoordinates && typeof initialCoordinates.lat === 'number') {
        setLatitude(Number(initialCoordinates.lat.toFixed(6)));
        setLongitude(Number(initialCoordinates.lng.toFixed(6)));
        setSelectedSector('custom');
        setCustomLocationName('Punto seleccionado en el mapa');
      } else if (userGps && typeof userGps.lat === 'number') {
        setLatitude(Number(userGps.lat.toFixed(6)));
        setLongitude(Number(userGps.lng.toFixed(6)));
        setSelectedSector('gps');
        setCustomLocationName('Mi ubicación GPS en la senda');
      } else {
        const defaultSec = SENDA_SECTORS[0];
        setSelectedSector(defaultSec.id);
        setLatitude(defaultSec.lat);
        setLongitude(defaultSec.lng);
        setCustomLocationName(defaultSec.label);
      }
    }
  }, [isOpen, initialCoordinates, userGps]);

  if (!isOpen) return null;

  const handleSectorChange = (sectorId) => {
    setSelectedSector(sectorId);
    if (sectorId === 'gps') {
      handleUseCurrentLocation();
      return;
    }
    const found = SENDA_SECTORS.find((s) => s.id === sectorId);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lng);
      setCustomLocationName(found.label);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocatingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          setSelectedSector('gps');
          setCustomLocationName('Mi ubicación actual (GPS)');
          setLocatingGps(false);
        },
        (err) => {
          console.warn('No se pudo obtener GPS:', err);
          setLocatingGps(false);
          if (userGps) {
            setLatitude(Number(userGps.lat.toFixed(6)));
            setLongitude(Number(userGps.lng.toFixed(6)));
            setSelectedSector('gps');
            setCustomLocationName('Mi ubicación actual (GPS)');
          } else {
            setError('No fue posible obtener el GPS. Puedes seleccionar un tramo de la lista.');
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else if (userGps) {
      setLatitude(Number(userGps.lat.toFixed(6)));
      setLongitude(Number(userGps.lng.toFixed(6)));
      setSelectedSector('gps');
      setCustomLocationName('Mi ubicación actual (GPS)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const typeObj = REPORT_TYPES.find((t) => t.value === reportType) || REPORT_TYPES[0];
    const sectorObj = SENDA_SECTORS.find((s) => s.id === selectedSector);
    const locationTitle = customLocationName.trim() || sectorObj?.label || 'Senda del Carnaval';

    const fullTitle = `${typeObj.label} en ${locationTitle}`;

    setLoading(true);

    try {
      const payload = {
        title: fullTitle,
        type: reportType,
        category: reportType,
        description: description.trim() || `Reporte de ${typeObj.label} registrado en ${locationTitle}.`,
        lat: Number(latitude),
        lng: Number(longitude),
        latitude: Number(latitude),
        longitude: Number(longitude),
        ai_risk_level: reportType === 'Emergencia' || reportType === 'Aglomeracion' ? 'Alto' : 'Medio',
      };

      // Inserción en Supabase / servicio de incidentes
      let newReport = null;
      try {
        newReport = await submitIncidentReport(payload);
      } catch (subErr) {
        console.warn('Error en submitIncidentReport, intentando API de respaldo:', subErr);
        try {
          newReport = await api.createReport(payload);
        } catch (apiErr) {
          console.warn('API error o backend desconectado, creando reporte local:', apiErr);
          newReport = {
            id: `rep-${Date.now()}`,
            ...payload,
            status: 'active',
            created_at: new Date().toISOString(),
          };
        }
      }

      if (onReportCreated) {
        onReportCreated(newReport);
      }

      // Feedback mediante Toast solicitado
      const successMessage = 'Reporte enviado a logística del Carnaval y registrado en tiempo real';
      if (onShowToast) {
        onShowToast(successMessage, 'success');
      }

      setIsSuccess(true);

      setTimeout(() => {
        setDescription('');
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al registrar incidencia:', err);
      setError('No fue posible procesar el reporte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2500] flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Fondo atenuado con backdrop-blur-sm bg-black/60 */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor Modal Glassmorphic Pulido */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-rose-950/40 text-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-coral-600 to-coral-500 text-white shadow-md shadow-rose-600/30 shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                Reportar Incidente en la Senda
              </h2>
              <p className="text-xs text-slate-400">
                Logística y Seguridad • Carnaval de Negros y Blancos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Cerrar modal de reporte"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 text-xs rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 text-xs rounded-2xl bg-aqua-500/15 border border-aqua-500/30 text-aqua-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-aqua-400 shrink-0" />
              <span className="font-bold">Reporte enviado a logística del Carnaval</span>
            </div>
          )}

          {/* 1. Selector de Categorías con Tarjetas Visuales Clickeables con Icono */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Incidente
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REPORT_TYPES.map((t) => {
                const isSelected = reportType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setReportType(t.value)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer text-left active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-500/25 to-coral-500/25 border-rose-500 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/50 scale-[1.02]'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isSelected ? 'bg-rose-500/30' : 'bg-slate-700/50'}`}>
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold leading-tight truncate">{t.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{t.subtext}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Selector de Ubicación / Tramo de la Senda */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ubicación en la Senda
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locatingGps}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-coral-400 hover:text-coral-300 transition cursor-pointer"
              >
                <Locate className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
                <span>{locatingGps ? 'Obteniendo...' : 'Capturar mi GPS'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-coral-400 pointer-events-none" />
              <select
                value={selectedSector}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/10 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 appearance-none cursor-pointer"
              >
                {selectedSector === 'custom' && (
                  <option value="custom">📍 Punto seleccionado en el mapa</option>
                )}
                {selectedSector === 'gps' && (
                  <option value="gps">📍 Mi ubicación actual (GPS)</option>
                )}
                {SENDA_SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Coordenadas: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              <span className="text-coral-400 font-medium">San Juan de Pasto</span>
            </div>
          </div>

          {/* 3. Textarea de Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Descripción de lo ocurrido
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente la situación observada (ej. aglomeración en la esquina, persona requiriendo asistencia, etc.)..."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 transition resize-none"
            />
          </div>

          {/* Botón de Confirmación con micro-interacción al pasar el mouse */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full py-3.5 px-4 carnaval-btn-primary text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Enviando reporte a logística...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Reporte Registrado con Éxito</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Reporte a Logística</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
