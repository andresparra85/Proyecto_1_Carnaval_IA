import React, { useState } from 'react';

/**
 * CarnavalIANewDesign.tsx
 * Generated & Exported reference screen from Stitch MCP (Project: 9851680101524456848)
 * "Mapa GIS Interactivo • Neo Edition" + "GuaneñaBot IA • Neo Edition" + "Reportar Incidente • Neo Edition"
 */

export const STITCH_DESIGN_TOKENS = {
  colors: {
    background: '#07090e',
    surface: '#0C101A',
    surfaceGlass: 'rgba(15, 23, 42, 0.8)',
    surfaceBorder: 'rgba(255, 255, 255, 0.12)',
    primaryCrimson: '#E11D48',
    accentAmber: '#F59E0B',
    accentTurquoise: '#06B6D4',
    accentMint: '#10B981',
    errorRed: '#F87171',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#94A3B8',
  },
  shadows: {
    floatingGlass: '0 12px 36px rgba(0, 0, 0, 0.65)',
    crimsonGlow: '0 0 20px rgba(225, 29, 72, 0.5)',
    cyanGlow: '0 0 16px rgba(6, 182, 212, 0.45)',
    amberGlow: '0 0 16px rgba(245, 158, 11, 0.45)',
  },
};

export interface POIItem {
  id: string;
  name: string;
  category: 'gastronomia' | 'bano' | 'seguridad' | 'salud' | 'tarima' | 'carroza';
  coordinates: [number, number];
  distance: string;
  description: string;
  rating?: number;
}

export const SAMPLE_POIS: POIItem[] = [
  {
    id: 'poi-1',
    name: 'El Frito Pastuso de la 19',
    category: 'gastronomia',
    coordinates: [1.2155, -77.2795],
    distance: '180m • 3 min',
    description: 'Frito tradicional con papas al vapor y crispetas.',
    rating: 4.9,
  },
  {
    id: 'poi-2',
    name: 'Módulo Sanitario Sector Bomboná',
    category: 'bano',
    coordinates: [1.2130, -77.2780],
    distance: '220m',
    description: 'Batería de baños móviles limpios con personal de aseo activo.',
  },
  {
    id: 'poi-3',
    name: 'CAI Móvil Policía Parque Nariño',
    category: 'seguridad',
    coordinates: [1.2140, -77.2792],
    distance: '120m',
    description: 'Cuadrante de seguridad ciudadana y punto de encuentro.',
  },
  {
    id: 'poi-4',
    name: 'Puesto de Salud Cruz Roja Senda Norte',
    category: 'salud',
    coordinates: [1.2210, -77.2825],
    distance: '340m',
    description: 'Ambulancia medicalizada y triage de primeros auxilios.',
  },
];

export function CarnavalIANewDesign() {
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [selectedPoi, setSelectedPoi] = useState<POIItem | null>(SAMPLE_POIS[0]);
  const [isBotDrawerOpen, setIsBotDrawerOpen] = useState<boolean>(true);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP FLOATING GLASS CAPSULE NAVBAR */}
      <header className="fixed top-3 left-4 right-4 z-[1000] pointer-events-auto">
        <div className="mx-auto max-w-7xl h-16 flex items-center justify-between gap-3 px-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Logo & Edition */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(225,29,72,0.5)]">
              <div className="w-full h-full rounded-full bg-[#07090e] flex items-center justify-center text-lg">
                🎭
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Carnaval<span className="text-cyan-400">IA</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                  Edición Oficial
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                <span className="font-semibold">18 Puntos Activos</span>
                <span className="text-white/30">•</span>
                <span className="text-slate-400">Telemetría GIS Pasto</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button: Report Incident */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(225,29,72,0.45)] border border-rose-400/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚨</span>
              <span>+ Reportar Incidente</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. FULLSCREEN IMMERSIVE MAP CANVAS */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-[#07090e]">
        {/* Placeholder SVG map backdrop representing Leaflet map canvas */}
        <div className="absolute inset-0 z-0 bg-[#07090e]">
          <div className="w-full h-full relative opacity-90">
            {/* Grid and Senda Glowing Polyline */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sendaGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E11D48" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <filter id="polylineBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 120,720 L 220,620 L 220,380 L 320,380 L 320,180 L 460,110 L 520,60"
                fill="none"
                stroke="#E11D48"
                strokeWidth="12"
                strokeOpacity="0.45"
                filter="url(#polylineBlur)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 120,720 L 220,620 L 220,380 L 320,380 L 320,180 L 460,110 L 520,60"
                fill="none"
                stroke="url(#sendaGlowGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Category Pills Overlay Filter */}
        <div className="absolute top-24 left-4 z-[900] flex items-center gap-2 overflow-x-auto max-w-[85vw] pb-2 no-scrollbar">
          {[
            { id: 'todos', label: 'Todos (18)', icon: '✨' },
            { id: 'gastronomia', label: 'Gastronomía', icon: '🍴' },
            { id: 'bano', label: 'Baños Móviles', icon: '🚻' },
            { id: 'seguridad', label: 'Seguridad CAI', icon: '👮' },
            { id: 'salud', label: 'Cruz Roja', icon: '🚑' },
            { id: 'tarima', label: 'Tarimas', icon: '🎪' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-xl transition-all border ${
                activeFilter === cat.id
                  ? 'bg-rose-600 text-white border-rose-400/40 shadow-[0_0_16px_rgba(225,29,72,0.4)]'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/25'
              }`}
            >
              <span>{cat.icon} </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Selected POI Card in Map */}
        {selectedPoi && (
          <div className="absolute bottom-6 left-4 z-[900] w-[90vw] sm:w-96 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                {selectedPoi.category}
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {selectedPoi.distance}
              </span>
            </div>
            <h3 className="font-bold text-white text-base leading-tight">
              {selectedPoi.name}
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              {selectedPoi.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition"
              >
                <span>📍</span>
                <span>Trazar ruta a pie</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. DOCKED CONVERSATIONAL HUD DRAWER: GUANEÑABOT */}
        <div
          className={`fixed bottom-5 right-5 z-[1001] w-80 sm:w-96 max-h-[580px] flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isBotDrawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-0.5">
                <div className="w-full h-full rounded-full bg-[#07090e] flex items-center justify-center text-lg">
                  🎭
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm">GuaneñaBot</h4>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                </div>
                <p className="text-[10px] text-amber-400 font-semibold">
                  IA en vivo • Carnaval de Pasto
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBotDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Quick Prompt Pills Carousel */}
          <div className="p-2.5 bg-slate-950/40 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {['¿Dónde comer cuy?', 'Ver la Senda', 'Baño cercano', 'Ruta a Plaza Nariño'].map((pill, i) => (
              <button
                key={i}
                type="button"
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition active:scale-95"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs min-h-[220px]">
            <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/5 text-slate-200">
              ¡Qué viva Pasto, carajo! 🎭 Soy <strong>GuaneñaBot</strong>. Pregúntame sobre la Senda del Carnaval, puntos de encuentro o gastronomía.
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-slate-900 border border-white/10 px-3 py-2 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(6,182,212,0.5)] active:scale-95"
            >
              ➤
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CarnavalIANewDesign;

