import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de entorno para Supabase con fallback de contingencia seguro
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-carnavalia-pasto.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_dummy_anon_key_for_safe_fallback_carnavalia_2026';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('demo-carnavalia')
);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface IncidentReportPayload {
  title?: string;
  type?: string;
  category?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  ai_risk_level?: 'Alto' | 'Medio' | 'Bajo';
  status?: string;
  created_at?: string;
}

export interface IncidentReport {
  id: string | number;
  title: string;
  category: string;
  type?: string;
  description: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  ai_risk_level: 'Alto' | 'Medio' | 'Bajo';
  status: string;
  created_at: string;
}

// Clave local para persistencia inmediata en el navegador
const LOCAL_STORAGE_KEY = 'carnavalia_reports_cache';

// Reportes iniciales activos en puntos clave de la Senda del Carnaval
const INITIAL_ACTIVE_REPORTS: IncidentReport[] = [
  {
    id: 'rep-init-1',
    title: 'Aglomeración severa en Plaza del Carnaval',
    category: 'Aglomeracion',
    type: 'Aglomeracion',
    description: 'Gran concentración de personas cerca de la tarima principal. Tránsito peatonal lento.',
    latitude: 1.2115,
    longitude: -77.2785,
    lat: 1.2115,
    lng: -77.2785,
    ai_risk_level: 'Alto',
    status: 'active',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'rep-init-2',
    title: 'Punto de hidratación activo en Carrera 27',
    category: 'Punto_Hidratacion',
    type: 'Punto_Hidratacion',
    description: 'Punto de abastecimiento de agua y apoyo logístico de Cruz Roja operando normalmente.',
    latitude: 1.2130,
    longitude: -77.2780,
    lat: 1.2130,
    lng: -77.2780,
    ai_risk_level: 'Bajo',
    status: 'active',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'rep-init-3',
    title: 'Bloqueo temporal en Calle 17',
    category: 'Calle_Bloqueada',
    type: 'Calle_Bloqueada',
    description: 'Paso restringido por montaje de graderías y vallas de seguridad de Corpocarnaval.',
    latitude: 1.2105,
    longitude: -77.2770,
    lat: 1.2105,
    lng: -77.2770,
    ai_risk_level: 'Medio',
    status: 'active',
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
];

const getStoredReports = (): IncidentReport[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error al leer reportes locales:', err);
  }
  return [];
};

const saveStoredReports = (reports: IncidentReport[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Error al guardar reportes locales:', err);
  }
};

/**
 * Normaliza un reporte asegurando lat/latitude, lng/longitude y valores consistentes
 */
const normalizeReport = (raw: any): IncidentReport => {
  const lat = Number(raw.latitude ?? raw.lat ?? 1.2115);
  const lng = Number(raw.longitude ?? raw.lng ?? -77.2785);
  const category = raw.category || raw.type || 'Aglomeracion';
  const risk: 'Alto' | 'Medio' | 'Bajo' = raw.ai_risk_level || (category === 'Emergencia' || category === 'Aglomeracion' ? 'Alto' : 'Medio');

  return {
    id: raw.id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: raw.title || raw.type || `${category} en Senda del Carnaval`,
    category,
    type: category,
    description: raw.description || 'Reporte registrado por la comunidad.',
    latitude: lat,
    longitude: lng,
    lat,
    lng,
    ai_risk_level: risk,
    status: raw.status || 'active',
    created_at: raw.created_at || new Date().toISOString(),
  };
};

/**
 * Inserta un reporte de incidente directamente en Supabase (o en almacenamiento local)
 */
export async function submitIncidentReport(payload: IncidentReportPayload): Promise<IncidentReport> {
  const lat = Number(payload.latitude ?? payload.lat ?? 1.2115);
  const lng = Number(payload.longitude ?? payload.lng ?? -77.2785);
  const category = payload.category || payload.type || 'Aglomeracion';
  const risk: 'Alto' | 'Medio' | 'Bajo' = payload.ai_risk_level || (category === 'Emergencia' || category === 'Aglomeracion' ? 'Alto' : 'Medio');
  const title = payload.title || payload.type || `${category} en Senda del Carnaval`;
  const description = payload.description || 'Incidente reportado en la senda.';
  const now = new Date().toISOString();

  const recordToInsert = {
    title,
    type: category,
    category,
    description,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    ai_risk_level: risk,
    status: 'active',
    created_at: now,
  };

  let createdReport: IncidentReport = normalizeReport({
    id: `rep-${Date.now()}`,
    ...recordToInsert,
  });

  if (isSupabaseConfigured) {
    try {
      // Intentar insertar en tabla 'incident_reports' o 'reports'
      const { data, error } = await supabase
        .from('incident_reports')
        .insert([recordToInsert])
        .select()
        .single();

      if (error) {
        // Intentar fallback con tabla 'reports'
        const fallbackRes = await supabase
          .from('reports')
          .insert([recordToInsert])
          .select()
          .single();

        if (!fallbackRes.error && fallbackRes.data) {
          createdReport = normalizeReport(fallbackRes.data);
        } else {
          console.warn('Supabase insert warning, usando almacenamiento seguro:', error.message);
        }
      } else if (data) {
        createdReport = normalizeReport(data);
      }
    } catch (sbErr) {
      console.warn('Error de conexión con Supabase, usando respaldo local:', sbErr);
    }
  }

  // Guardar en caché local para visualización reactiva inmediata
  const localList = getStoredReports();
  const updatedList = [createdReport, ...localList.filter((r) => r.id !== createdReport.id)];
  saveStoredReports(updatedList);

  return createdReport;
}

/**
 * Consulta los reportes activos para cargarlos al iniciar el mapa
 */
export async function fetchActiveReports(): Promise<IncidentReport[]> {
  let remoteReports: IncidentReport[] = [];

  if (isSupabaseConfigured) {
    try {
      // Intentar consultar de 'incident_reports'
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        remoteReports = data.map(normalizeReport);
      } else {
        // Fallback a tabla 'reports'
        const fallbackRes = await supabase
          .from('reports')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
          remoteReports = fallbackRes.data.map(normalizeReport);
        }
      }
    } catch (sbErr) {
      console.warn('Consulta a Supabase en modo desconectado/offline:', sbErr);
    }
  }

  const storedLocals = getStoredReports();
  
  // Fusionar remotos, locales persistidos y los iniciales de la Senda
  const mapById = new Map<string | number, IncidentReport>();
  
  INITIAL_ACTIVE_REPORTS.forEach((r) => mapById.set(r.id, r));
  storedLocals.forEach((r) => mapById.set(r.id, r));
  remoteReports.forEach((r) => mapById.set(r.id, r));

  return Array.from(mapById.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export default {
  submitIncidentReport,
  fetchActiveReports,
  supabase,
};

