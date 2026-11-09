import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';
import { findCarnavalLandmark, CARNAVAL_LANDMARKS } from '../data/carnavalKnowledge';
import { searchPastoPOI, PASTO_POIS, PointOfInterest } from '../data/pastoPOIs';
import { sendGuanenaMessage } from '../services/guanenaChatService';
import { parseBotIntent, dispatchParadeIntent } from '../services/botIntentParser';
import { CARNAVAL_DAYS_CONFIG, TRACK_SENDA_DIRECTO } from '../data/carnavalDaysData';

export interface ChatBotProps {
  onFocusSenda?: () => void;
  onFocusLandmark?: (coords: [number, number], name?: string) => void;
}

export interface QuickActionChip {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  type: 'senda' | 'landmark' | 'poi' | 'day';
  dayId?: string;
  coords?: [number, number];
  name?: string;
  category?: string;
  zoom?: number;
  answer: string;
}

// 5 Quick Action Chips solicitados para GuaneñaBot con acciones automáticas al mapa
export const QUICK_ACTION_CHIPS: QuickActionChip[] = [
  {
    id: 'ruta_6_enero',
    icon: '📌',
    label: 'Ruta 6 de Enero',
    prompt: '¿Cómo es el recorrido del Desfile Magno el 6 de Enero?',
    type: 'day',
    dayId: '06-ene',
    coords: [1.2154, -77.2841],
    name: 'Senda del Carnaval - Desfile Magno',
    answer: '¡Que viva Pasto, carajo! 🎭 El 6 de Enero es el Desfile Magno: 7 km de derroche artístico desde la Normal Superior por la Cra 27 hasta Champagnat con las monumentales carrozas. ¡Te he enfocado la Senda oficial en el mapa!',
  },
  {
    id: 'banos_publicos',
    icon: '🚻',
    label: 'Baños Públicos',
    prompt: '¿Dónde hay un baño público cerca de la Plaza del Carnaval?',
    type: 'poi',
    coords: [1.2153, -77.2843],
    name: 'Batería Sanitaria Plaza del Carnaval',
    category: 'bano',
    zoom: 18,
    answer: '¡Que viva Pasto, carajo! 🚻 Baterías sanitarias habilitadas 24 horas en el Costado Sur de la Plaza del Carnaval y en la Plaza de Nariño (Cra 25). ¡Capa activada y ruta a pie trazada en el mapa!',
  },
  {
    id: 'comer_cuy',
    icon: '🍽️',
    label: 'Comer Cuy / Frito',
    prompt: '¿Dónde puedo comer un buen cuy asado o comida tradicional?',
    type: 'poi',
    coords: [1.2132, -77.2798],
    name: 'Restaurante Rancho Grande',
    category: 'restaurante',
    zoom: 18,
    answer: '¡Que viva Pasto, carajo! 🍽️ Te recomiendo el Restaurante Rancho Grande (Calle 18 # 25-30 Centro) para un buen cuy asado o La Merced cerca a la Plaza del Carnaval. ¡Ruta a pie trazada en el mapa!',
  },
  {
    id: 'cai_policia',
    icon: '👮',
    label: 'CAI Policía',
    prompt: '¿Dónde está el CAI de policía más cercano?',
    type: 'poi',
    coords: [1.2155, -77.2839],
    name: 'CAI Plaza del Carnaval',
    category: 'cai',
    zoom: 18,
    answer: '¡Que viva Pasto, carajo! 👮 Tienes el CAI Plaza del Carnaval y el CAI Parque Nariño activos para seguridad y recepción de extraviados. ¡Puesto localizado y ruta trazada en el mapa!',
  },
  {
    id: 'puestos_salud',
    icon: '🚨',
    label: 'Puestos de Salud',
    prompt: '¿Dónde hay puestos de primeros auxilios y emergencias?',
    type: 'poi',
    coords: [1.2151, -77.2845],
    name: 'Puesto de Primeros Auxilios Cruz Roja',
    category: 'salud',
    zoom: 18,
    answer: '¡Que viva Pasto, carajo! 🚨 Puesto de Primeros Auxilios de la Cruz Roja en Plaza del Carnaval y punto médico en Parque Nariño, además del Hospital Civil en la Calle 11. ¡Ruta de asistencia activada!',
  },
];

// Coordenadas oficiales de respaldo en Plaza de Nariño
export const FALLBACK_PLAZA_NARINO_COORDS: [number, number] = [1.2168, -77.2805];

/**
 * Captura las coordenadas GPS en tiempo real del turista con fallback a Plaza de Nariño.
 */
export async function getTouristGpsCoords(): Promise<[number, number]> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return FALLBACK_PLAZA_NARINO_COORDS;
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(FALLBACK_PLAZA_NARINO_COORDS);
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Aviso GPS turista (usando Plaza de Nariño como fallback):', err?.message);
        resolve(FALLBACK_PLAZA_NARINO_COORDS);
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 5000 }
    );
  });
}

export interface ChatMessageItem {
  id: number | string;
  sender: 'user' | 'bot';
  text: string;
  crowdNotice?: string | null;
  actionButton?: {
    label: string;
    dayKey: string;
  } | null;
  timestamp: Date;
  isError?: boolean;
}

export function ChatBot({ onFocusSenda, onFocusLandmark }: ChatBotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Soy GuaneñaBot. Pregúntame sobre desfiles, la Senda o servicios del Carnaval.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vinculación del clic del botón al despacho de ruta en el mapa y reencuadre de cámara
  const handleTriggerDayRoute = (dayKey?: string) => {
    if (!dayKey) return;
    const cleanDay = String(dayKey).replace(/[^0-9]/g, '') || String(dayKey);
    const dayConfig = CARNAVAL_DAYS_CONFIG[cleanDay] || CARNAVAL_DAYS_CONFIG['6'];

    if (typeof window !== 'undefined') {
      // 1. Invocar función global sincronizada del mapa
      if (typeof (window as any).activarSendaPorDia === 'function') {
        (window as any).activarSendaPorDia(cleanDay);
      } else if (typeof (window as any).activarSendaDirecta === 'function') {
        const coords = dayConfig?.track || TRACK_SENDA_DIRECTO;
        (window as any).activarSendaDirecta(coords);
      }

      // 2. Notificar actualización de día e indicador flotante de evento activo
      window.dispatchEvent(
        new CustomEvent('focus-carnival-day', { detail: { dayId: cleanDay } })
      );
      window.dispatchEvent(
        new CustomEvent('DRAW_SENDA', { detail: { dayKey: cleanDay } })
      );
      window.dispatchEvent(
        new CustomEvent('focus-senda', { detail: { show: true } })
      );

      // 3. Despacho directo con fitBounds para reencuadre instantáneo
      const coords = dayConfig?.track || TRACK_SENDA_DIRECTO;
      if (Array.isArray(coords) && coords.length > 0) {
        window.dispatchEvent(
          new CustomEvent('DIRECT_TRACK_DISPATCH', {
            detail: { coords, fitBounds: true },
          })
        );
      }
    }

    if (onFocusSenda) {
      onFocusSenda();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Ejecuta la interacción de cámara con el mapa de Leaflet
  const triggerCameraAction = (actionType: 'senda' | 'landmark', coords?: [number, number], name?: string, category?: string, zoom: number = 17) => {
    if (actionType === 'senda') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('focus-senda', {
            detail: { show: true },
          })
        );
      }
      if (onFocusSenda) {
        onFocusSenda();
      }
    } else if (actionType === 'landmark' && coords) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('focus-landmark', {
            detail: {
              coords,
              name: name || 'Punto Clave del Carnaval',
              category: category || 'general',
              zoom,
              showSenda: true,
            },
          })
        );
      }
      if (onFocusLandmark) {
        onFocusLandmark(coords, name);
      }
    }
  };

  // Manejo de clic en los Quick Action Chips
  const handleQuickChip = (chip: QuickActionChip) => {
    if (loading) return;

    if (chip.type === 'day' && chip.dayId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('focus-carnival-day', {
            detail: { dayId: chip.dayId },
          })
        );
        window.dispatchEvent(
          new CustomEvent('focus-senda', {
            detail: { show: true },
          })
        );
      }
      if (onFocusSenda) {
        onFocusSenda();
      }
    } else if (chip.type === 'poi' && chip.coords) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-poi-category', {
            detail: { category: chip.category || 'todos' },
          })
        );
        window.dispatchEvent(
          new CustomEvent('highlight-poi', {
            detail: {
              coords: chip.coords,
              name: chip.name || 'Punto de Interés',
              category: chip.category || 'general',
              zoom: chip.zoom || 18,
              showSenda: true,
            },
          })
        );
        window.dispatchEvent(
          new CustomEvent('route-to-poi', {
            detail: {
              targetCoords: chip.coords,
              targetName: chip.name,
            },
          })
        );
      }
      if (onFocusLandmark) {
        onFocusLandmark(chip.coords, chip.name);
      }
    } else if (chip.type === 'senda') {
      triggerCameraAction('senda');
    } else if (chip.type === 'landmark' && chip.coords) {
      triggerCameraAction('landmark', chip.coords, chip.name, chip.category, chip.zoom);
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chip.prompt,
      timestamp: new Date(),
    };

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: chip.answer,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || inputMessage).trim();
    if (!userText || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    // Detección directa de rutas o desfiles del Carnaval ('senda', '4 de enero', '6 de enero', 'desfile')
    const isParadeQuery = /senda|desfile|blancos|casta[ñn]eda|4 de enero|6 de enero|3 de enero|2 de enero|camino|ruta/i.test(userText);
    if (isParadeQuery && typeof window !== 'undefined') {
      if (typeof (window as any).activarSendaDirecta === 'function') {
        (window as any).activarSendaDirecta(TRACK_SENDA_DIRECTO);
      } else if (typeof (window as any).activarSendaPorDia === 'function') {
        const cleanDay = q.includes('4') ? '4' : q.includes('3') ? '3' : q.includes('2') ? '2' : '6';
        (window as any).activarSendaPorDia(cleanDay);
      }
      if (typeof (window as any).dibujarSendaCarnaval === 'function') {
        (window as any).dibujarSendaCarnaval('senda_oficial');
      }

      window.dispatchEvent(
        new CustomEvent('DIRECT_TRACK_DISPATCH', {
          detail: { coords: TRACK_SENDA_DIRECTO, fitBounds: true },
        })
      );
    }

    const paradeIntent = parseBotIntent(userText);
    if (paradeIntent.matched) {
      dispatchParadeIntent(userText);
    }

    const q = userText.toLowerCase();

    // 1. Detección de intenciones sobre Días del Carnaval
    let matchedDay: { dayId: string; name: string; desc: string } | null = null;
    if (q.includes('3 de enero') || q.includes('tres de enero') || q.includes('canto a la tierra') || q.includes('colectivos coreográficos') || q.includes('coreograficos')) {
      matchedDay = {
        dayId: '03-ene',
        name: 'Canto a la Tierra (3 de Enero)',
        desc: 'Desfile de colectivos coreográficos en honor a la Madre Tierra.',
      };
    } else if (q.includes('4 de enero') || q.includes('cuatro de enero') || q.includes('castañeda') || q.includes('castaneda') || q.includes('familia')) {
      matchedDay = {
        dayId: '04-ene',
        name: 'Llegada de la Familia Castañeda (4 de Enero)',
        desc: 'Recorrido trazado en el mapa de Sur (Champagnat) a Norte (Av. Estudiantes).',
      };
    } else if (q.includes('5 de enero') || q.includes('cinco de enero') || q.includes('día de negros') || q.includes('dia de negros') || q.includes('negros') || q.includes('pintica') || q.includes('cosmético') || q.includes('cosmetico')) {
      matchedDay = {
        dayId: '05-ene',
        name: 'Día de Negros (5 de Enero)',
        desc: 'Juego de identidad en Plaza de Nariño y Plaza del Carnaval.',
      };
    } else if (q.includes('6 de enero') || q.includes('seis de enero') || q.includes('desfile magno') || q.includes('magno') || q.includes('blancos') || q.includes('carrozas') || q.includes('carroza')) {
      matchedDay = {
        dayId: '06-ene',
        name: 'Desfile Magno de Blancos (6 de Enero)',
        desc: 'Carrozas Gigantes y senda oficial trazada en el mapa.',
      };
    }

    // 2. Detección de POIs reales de Pasto (baños, restaurantes/cuy, policía/CAI, puestos de salud)
    const poiMatch = searchPastoPOI(userText);

    // 3. Detección de hitos de la Senda
    const landmark = findCarnavalLandmark(userText);

    let conciseFallback = '';

    if (matchedDay) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('focus-carnival-day', { detail: { dayId: matchedDay.dayId } }));
        window.dispatchEvent(new CustomEvent('focus-senda', { detail: { show: true } }));
      }
      if (onFocusSenda) onFocusSenda();
      conciseFallback = `${matchedDay.name}: ${matchedDay.desc} Ruta oficial trazada en el mapa.`;
    } else if (poiMatch) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-poi-category', { detail: { category: poiMatch.category } }));
        window.dispatchEvent(
          new CustomEvent('highlight-poi', {
            detail: {
              coords: poiMatch.coords,
              name: poiMatch.name,
              category: poiMatch.category,
              zoom: 18,
              showSenda: true,
            },
          })
        );
        window.dispatchEvent(
          new CustomEvent('route-to-poi', {
            detail: {
              targetCoords: poiMatch.coords,
              targetName: poiMatch.name,
            },
          })
        );
      }
      if (onFocusLandmark) onFocusLandmark(poiMatch.coords, poiMatch.name);
      conciseFallback = `Ubicación encontrada: ${poiMatch.name}. Marcadores y ruta ubicados en el mapa.`;
    } else if (landmark) {
      triggerCameraAction('landmark', landmark.coords, landmark.name, landmark.category, landmark.category === 'salud' ? 18 : 17);
      conciseFallback = `${landmark.name}. Coordenadas enfocadas en el mapa.`;
    } else if (q.includes('senda') || q.includes('recorrido') || q.includes('ruta')) {
      triggerCameraAction('senda');
      conciseFallback = 'Ruta oficial de la Senda del Carnaval trazada de Sur (Champagnat) a Norte (Av. Estudiantes).';
    }

    try {
      const [userLat, userLng] = await getTouristGpsCoords();
      const guanenaResult = await sendGuanenaMessage(userText, userLat, userLng);
      let botResponse = guanenaResult.reply;

      // Interpretación y enlace de acciones del mapa devueltas por la IA (map_action)
      if (guanenaResult.map_action) {
        const action = guanenaResult.map_action;
        if (
          action.action_type === 'ROUTE_TO_EVENT_START' ||
          action.action_type === 'DRAW_ROUTE' ||
          action.action_type === 'ROUTE_TO_POI'
        ) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('TRIGGER_NAVIGATION', {
                detail: {
                  targetCoords: action.target_coords,
                  targetName: action.target_name || 'Destino',
                  originCoords: [userLat, userLng],
                },
              })
            );
            if (action.day_id) {
              window.dispatchEvent(
                new CustomEvent('DRAW_SENDA', {
                  detail: { dayKey: action.day_id },
                })
              );
            }
          }
        }
      }

      let finalResponse = botResponse || conciseFallback || 'Ruta y marcadores oficiales ubicados en el mapa.';
      finalResponse = finalResponse.replace(/¡?Que viva Pasto,?\s*carajo!?[^.\n]*[.\n]*/gi, '').trim();
      if (!finalResponse) {
        finalResponse = conciseFallback || 'Ruta y marcadores oficiales ubicados en el mapa.';
      }

      const botMsg: ChatMessageItem = {
        id: Date.now() + 1,
        sender: 'bot',
        text: finalResponse,
        crowdNotice: guanenaResult?.crowdNotice || null,
        actionButton: guanenaResult?.actionButton || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.warn('Backend desconectado o error de red, respondiendo de forma contextual:', error);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: conciseFallback || 'Ruta y marcadores oficiales ubicados en el mapa.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: '¡Que viva Pasto, carajo! 🎉 Conversación reiniciada. ¿Qué deseas consultar sobre el Carnaval?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* 1. Botón Circular Flotante en la esquina inferior derecha con degradado pastuso y pulso sutil */}
      <button
        id="open-chat-fab"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 hover:scale-110 active:scale-95 text-white shadow-2xl shadow-rose-600/40 border-2 border-white/30 transition-all duration-300 cursor-pointer group select-none"
        aria-label="Abrir o cerrar chat con GuaneñaBot"
        title="GuaneñaBot • Asistente del Carnaval de Negros y Blancos"
      >
        {/* Efecto de pulso sutil cuando está cerrado */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-rose-500/35 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-white stroke-[2.5]" />
        ) : (
          <div className="relative flex items-center justify-center text-2xl">
            🎭
          </div>
        )}
      </button>

      {/* 2. Ventana de Chat Flotante Desplegable */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="Ventana de GuaneñaBot"
          className="fixed bottom-24 right-6 z-[9999] pointer-events-auto w-[calc(100vw-2.5rem)] sm:w-[390px] h-[520px] max-h-[80vh] rounded-3xl bg-[#15082e]/90 backdrop-blur-2xl border border-fuchsia-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header Festivo: "GuaneñaBot • Asistente del Carnaval" e Indicador "En línea" */}
          <header className="px-4 py-3.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(244,63,94,0.6)] flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-2 ring-amber-400/60 ring-offset-2 ring-offset-[#15082e] shrink-0 text-lg">
                🎭
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs sm:text-sm text-white tracking-tight leading-tight truncate">
                  GuaneñaBot • Asistente del Carnaval
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-semibold">
                    En línea • Pasto, Nariño
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Reiniciar chat"
                aria-label="Reiniciar chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Cerrar chat"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Body: Historial de mensajes con burbujas diferenciadas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-6 h-6 rounded-xl bg-[#2a1150]/80 border border-fuchsia-400/20 flex items-center justify-center text-xs shrink-0 mb-1">
                        🎭
                      </div>
                    )}

                    {/* Burbujas diferenciadas: Usuario con acento festivo, Bot en gris oscuro pulido */}
                    <div
                      className={`px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-2xl rounded-tr-sm shadow-md'
                          : (msg as any).isError
                            ? 'bg-rose-950/80 text-rose-200 border border-rose-500/50 rounded-2xl rounded-tl-none'
                            : 'bg-[#210c47]/80 backdrop-blur-md border border-fuchsia-400/20 text-white rounded-2xl rounded-tl-sm font-normal'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {msg.crowdNotice && (
                        <div className="mt-2 bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded border border-amber-500/20 font-medium">
                          {msg.crowdNotice}
                        </div>
                      )}

                      {msg.actionButton && (
                        <button
                          type="button"
                          onClick={() => handleTriggerDayRoute(msg.actionButton?.dayKey)}
                          className="mt-2 w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          {msg.actionButton.label}
                        </button>
                      )}
                    </div>
                  </div>

                  <span className={`text-[9px] text-slate-500 mt-1 ${isUser ? 'pr-1' : 'pl-8'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Indicador de carga animado */}
            {loading && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-xl bg-[#2a1150]/80 border border-fuchsia-400/20 flex items-center justify-center text-xs shrink-0 mb-1">
                    🎭
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-[#210c47]/80 backdrop-blur-md border border-fuchsia-400/20 text-xs text-slate-200 flex items-center gap-2 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      GuaneñaBot está escribiendo...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chips de sugerencias redondeados táctiles que invitan a hacer clic */}
          <div className="px-3.5 py-2 bg-[#15082e]/85 border-t border-fuchsia-500/15">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_ACTION_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-[#220d45]/80 hover:bg-rose-500/20 text-slate-200 hover:text-amber-300 border border-fuchsia-400/20 hover:border-amber-400/50 text-[11px] font-semibold whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  title={`Preguntar por ${chip.label}`}
                >
                  <span className="text-xs">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Input con diseño de píldora y botón de envío circular con gradiente */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-fuchsia-500/20 bg-[#15082e]/95 flex items-center gap-2"
          >
            <input
              id="guanena-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a GuaneñaBot..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#220d45]/60 border border-fuchsia-400/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/60 focus:border-rose-500/50 transition disabled:opacity-50"
            />
            <button
              id="guanena-chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:brightness-110 text-white font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-rose-500/50 ring-1 ring-white/25 flex items-center justify-center shrink-0"
              aria-label="Enviar mensaje a GuaneñaBot"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export { ChatBot as GuaneñaBot, ChatBot as GuanenaBot, ChatBot as ChatIA };
export default ChatBot;
