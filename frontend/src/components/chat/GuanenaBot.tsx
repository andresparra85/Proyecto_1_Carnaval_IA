import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw, MessageSquare, MapPin, Navigation } from 'lucide-react';
import { findCarnavalLandmark, CARNAVAL_LANDMARKS } from '../../data/carnavalKnowledge';
import { searchPastoPOI, PASTO_POIS, PointOfInterest, dispatchGuanenaAction } from '../../data/pastoPOIs';
import { getStreetRoute } from '../../services/routingService';
import { sendGuanenaMessage } from '../../services/guanenaChatService';
import { parseBotIntent, dispatchParadeIntent } from '../../services/botIntentParser';

export interface GuanenaBotProps {
  onFocusSenda?: () => void;
  onFocusLandmark?: (coords: [number, number], name?: string) => void;
}

export interface QuickSuggestion {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  action: 'senda' | 'poi' | 'navigate';
  category?: 'restaurante' | 'bano' | 'cai' | 'salud';
  coords?: [number, number];
  name?: string;
  answer: string;
}

export const GUANENA_SUGGESTIONS: QuickSuggestion[] = [
  {
    id: 'sug-senda',
    icon: '🎭',
    label: '¿Qué desfile hay hoy?',
    prompt: '¿Qué desfile hay hoy y cuál es el recorrido de la Senda?',
    action: 'senda',
    coords: [1.2140, -77.2820],
    name: 'Senda del Carnaval de Negros y Blancos',
    answer: '¡Que viva Pasto, carajo! 🎭 Hoy la Senda vibra con 7 km de derroche cultural desde la Normal hasta Champagnat.\n¡Te acabo de enfocar el trazado milimétrico en el mapa para que no te perdás ni una comparsa!',
  },
  {
    id: 'sug-bano',
    icon: '🚻',
    label: 'Baños públicos',
    prompt: '¿Dónde hay baños públicos cercanos en la Plaza del Carnaval?',
    action: 'poi',
    category: 'bano',
    coords: [1.2153, -77.2843],
    name: 'Batería Sanitaria Plaza del Carnaval',
    answer: '¡A la voz de una, paisano! 🚻 Tenés baterías sanitarias habilitadas 24 horas en Plaza del Carnaval y en el Parque Nariño.\n¡Pines encendidos en el mapa y ruta peatonal trazada para llegar de una!',
  },
  {
    id: 'sug-cuy',
    icon: '🍽️',
    label: 'Comer cuy tradicional',
    prompt: '¿Dónde puedo comer buen cuy asado o comida tradicional de Pasto?',
    action: 'poi',
    category: 'restaurante',
    coords: [1.2132, -77.2798],
    name: 'Restaurante Rancho Grande',
    answer: '¡Que viva el buen sabor pastuso! 🍽️ Andá al Rancho Grande en la Calle 18 o a la Picantería La Merced junto a la Plaza del Carnaval.\n¡Pines gastronómicos activados y ruta a pie lista en pantalla!',
  },
  {
    id: 'sug-cai',
    icon: '👮',
    label: 'CAI de Policía',
    prompt: '¿Dónde está el CAI de policía o puesto de seguridad más cercano?',
    action: 'poi',
    category: 'cai',
    coords: [1.2155, -77.2839],
    name: 'CAI Plaza del Carnaval',
    answer: '¡Todo firme y seguro! 👮 Tenés el CAI Plaza del Carnaval y el del Parque Nariño con policías y recepción de extraviados.\n¡Pines de seguridad activados en tu mapa inmediatamente!',
  },
  {
    id: 'sug-salud',
    icon: '🚨',
    label: 'Puestos de Salud',
    prompt: '¿Dónde hay puestos de salud y primeros auxilios de la Cruz Roja?',
    action: 'poi',
    category: 'salud',
    coords: [1.2151, -77.2845],
    name: 'Puesto de Primeros Auxilios Cruz Roja',
    answer: '¡Tranquilo mi gente! 🚨 La Cruz Roja y Defensa Civil están en la Plaza del Carnaval y el Parque Nariño con ambulancias.\n¡Puestos médicos iluminados en el mapa para cualquier auxilio!',
  },
];

// Coordenadas oficiales de respaldo en Plaza de Nariño
export const FALLBACK_PLAZA_NARINO: [number, number] = [1.2168, -77.2805];

/**
 * Captura las coordenadas GPS en tiempo real del turista con fallback a Plaza de Nariño.
 */
export async function getTouristGpsCoords(): Promise<[number, number]> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return FALLBACK_PLAZA_NARINO;
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(FALLBACK_PLAZA_NARINO);
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Aviso GPS turista (usando Plaza de Nariño como fallback):', err?.message);
        resolve(FALLBACK_PLAZA_NARINO);
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 5000 }
    );
  });
}

export function GuanenaBot({ onFocusSenda, onFocusLandmark }: GuanenaBotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Que viva Pasto, carajo! 🎉 Soy GuaneñaBot, tu guía oficial en el Carnaval de Negros y Blancos.\nPregúntame por desfiles, baños, cuy tradicional o seguridad y manejo el mapa por vos.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const executeActionOnMap = async (action: 'senda' | 'poi' | 'navigate', detail: any) => {
    if (typeof window === 'undefined') return;

    if (action === 'senda') {
      dispatchGuanenaAction({ type: 'SHOW_SENDA', dayId: detail.dayId || '06-ene' });
      if (onFocusSenda) onFocusSenda();
    } else if (action === 'poi') {
      const cat = detail.category || 'todos';
      dispatchGuanenaAction({ type: 'FOCUS_CATEGORY', category: cat });
      if (detail.coords) {
        window.dispatchEvent(
          new CustomEvent('highlight-poi', {
            detail: {
              coords: detail.coords,
              name: detail.name,
              category: detail.category,
              zoom: 18,
              showSenda: true,
            },
          })
        );
        // Calcular ruta vial a pie mediante getStreetRoute
        const origin: [number, number] = [1.2138, -77.2818];
        try {
          const path = await getStreetRoute(origin, detail.coords);
          window.dispatchEvent(
            new CustomEvent('route-to-poi', {
              detail: {
                targetCoords: detail.coords,
                targetName: detail.name,
                path,
              },
            })
          );
        } catch (e) {
          console.warn('Error calculando ruta a pie:', e);
        }
      }
      if (onFocusLandmark && detail.coords) onFocusLandmark(detail.coords, detail.name);
    } else if (action === 'navigate' && detail.coords) {
      const origin: [number, number] = [1.2138, -77.2818];
      const path = await getStreetRoute(origin, detail.coords);
      dispatchGuanenaAction({
        type: 'NAVIGATE_TO',
        targetCoords: detail.coords,
        targetName: detail.name || 'Destino',
        startCoords: origin,
      });
      window.dispatchEvent(
        new CustomEvent('route-to-poi', {
          detail: {
            targetCoords: detail.coords,
            targetName: detail.name,
            path,
          },
        })
      );
    }
  };

  const handleSuggestionClick = async (chip: QuickSuggestion) => {
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
    await executeActionOnMap(chip.action, chip);
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

    const paradeIntent = parseBotIntent(userText);
    if (paradeIntent.matched) {
      dispatchParadeIntent(userText);
    }

    const q = userText.toLowerCase();

    // 1. Detección de intenciones: desfiles / Senda
    let actionTriggered = false;
    let botReply = '';

    const isParadeQuery = /senda|desfile|blancos|casta[ñn]eda|4 de enero|6 de enero|camino|ruta/i.test(userText);
    if (isParadeQuery) {
      actionTriggered = true;
      if (typeof window !== 'undefined' && typeof (window as any).dibujarSendaCarnaval === 'function') {
        (window as any).dibujarSendaCarnaval('senda_oficial');
      }
      await executeActionOnMap('senda', { dayId: '06-ene' });
      botReply = '¡Que viva Pasto, carajo! 🎭 He desplegado la Senda Oficial continua calle por calle (Champagnat -> Cra 27 -> Plaza Carnaval -> Cll 19 -> Plaza Nariño -> Cra 22 / Torobajo) en el mapa.';
    } else if (q.includes('desfile') || q.includes('senda') || q.includes('recorrido') || q.includes('evento') || q.includes('carroza')) {
      actionTriggered = true;
      await executeActionOnMap('senda', { dayId: '06-ene' });
      botReply = '¡Que viva Pasto, carajo! 🎭 La Senda recorre 7 km desde la Normal por la Cra 27 hasta Champagnat.\n¡Te he desplegado el desfile y el mapa vial al instante!';
    } else if (q.includes('baño') || q.includes('bano') || q.includes('sanitario') || q.includes('orinar')) {
      actionTriggered = true;
      const bano = searchPastoPOI(userText) || PASTO_POIS.find((p) => p.category === 'bano');
      await executeActionOnMap('poi', { category: 'bano', coords: bano?.coords, name: bano?.name });
      botReply = `¡A la voz de una! 🚻 Ubicado ${bano?.name || 'Baño público'} en ${bano?.address || 'Plaza del Carnaval'}.\n¡Pines sanitarios iluminados y ruta vial a pie calculada!`;
    } else if (q.includes('comer') || q.includes('cuy') || q.includes('restaurante') || q.includes('fritada') || q.includes('empanada')) {
      actionTriggered = true;
      const rest = searchPastoPOI(userText) || PASTO_POIS.find((p) => p.category === 'restaurante');
      await executeActionOnMap('poi', { category: 'restaurante', coords: rest?.coords, name: rest?.name });
      botReply = `¡Qué delicia paisano! 🍽️ Recomendadísimo ${rest?.name || 'Rancho Grande'} (${rest?.address || 'Centro'}).\n¡Pines gastronómicos activados y ruta trazada en el mapa!`;
    } else if (q.includes('policia') || q.includes('policía') || q.includes('cai') || q.includes('seguridad') || q.includes('robo') || q.includes('extraviado')) {
      actionTriggered = true;
      const cai = searchPastoPOI(userText) || PASTO_POIS.find((p) => p.category === 'cai');
      await executeActionOnMap('poi', { category: 'cai', coords: cai?.coords, name: cai?.name });
      botReply = `¡Firme mi paisano! 👮 Tenés disponible el ${cai?.name || 'CAI Centro'} en ${cai?.address || 'Plaza del Carnaval'}.\n¡Puestos de vigilancia y seguridad encendidos en el mapa!`;
    } else if (q.includes('salud') || q.includes('médic') || q.includes('medic') || q.includes('cruz roja') || q.includes('urgencia') || q.includes('hospital')) {
      actionTriggered = true;
      const salud = searchPastoPOI(userText) || PASTO_POIS.find((p) => p.category === 'salud');
      await executeActionOnMap('poi', { category: 'salud', coords: salud?.coords, name: salud?.name });
      botReply = `¡Atención prioritaria! 🚨 ${salud?.name || 'Puesto de Cruz Roja'} en ${salud?.address || 'Plaza del Carnaval'}.\n¡Ruta de asistencia médica trazada de inmediato en tu mapa!`;
    } else if (q.includes('cómo llegar') || q.includes('como llegar') || q.includes('ruta a') || q.includes('ir a')) {
      actionTriggered = true;
      const target = searchPastoPOI(userText) || findCarnavalLandmark(userText);
      const coords = target && 'coords' in target ? target.coords : [1.2140, -77.2820];
      const name = target ? target.name : 'Punto solicitado';
      await executeActionOnMap('navigate', { coords, name });
      botReply = `¡Listo paisano! 🚶‍♂️ He calculado la ruta vial a pie más rápida hacia **${name}** con OSRM.\n¡Seguí la línea azul trazada en las calles del mapa!`;
    }

    if (!actionTriggered) {
      try {
        const [userLat, userLng] = await getTouristGpsCoords();
        const guanenaResult = await sendGuanenaMessage(userText, userLat, userLng);
        botReply = guanenaResult.reply;

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
      } catch (err) {
        console.warn('Chat backend fallback:', err);
      }

      if (!botReply) {
        botReply = '¡Que viva Pasto, carajo! 🎉 Decime a dónde querés ir, qué querés comer o qué hito querés que te trace en el mapa y lo hago de una.';
      } else if (!botReply.toLowerCase().includes('pasto, carajo')) {
        botReply = `¡Que viva Pasto, carajo! 🎉 ${botReply}`;
      }
    }

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: botReply,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Botón flotante GuaneñaBot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] p-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white/30 backdrop-blur-md group"
          title="Abrir Asistente GuaneñaBot"
          aria-label="Abrir asistente de IA GuaneñaBot"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm ml-0 group-hover:ml-2">
            GuaneñaBot
          </span>
        </button>
      )}

      {/* Ventana de Chat GuaneñaBot */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1100] w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-xl text-white overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-600/40 via-rose-600/40 to-slate-900/80 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg border border-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                  GuaneñaBot
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-amber-200/80">Guía de Inteligencia Vial y Cultural</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: Date.now(),
                      sender: 'bot',
                      text: '¡Que viva Pasto, carajo! 🎉 Conversación reiniciada. ¿Qué punto o evento querés ubicar en la Senda?',
                      timestamp: new Date(),
                    },
                  ]);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition text-slate-300 hover:text-white"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition text-slate-300 hover:text-white"
                title="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chips de sugerencias interactivas */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {GUANENA_SUGGESTIONS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleSuggestionClick(chip)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-xs font-semibold whitespace-nowrap transition active:scale-95 text-slate-200 hover:text-amber-300"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Cuerpo de mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-br-xs'
                        : 'bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-xs leading-relaxed whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-white/10 text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Consultando la Senda de Pasto...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Preguntá por la Senda, baños, cuy, CAIs..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition"
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

export default GuanenaBot;
