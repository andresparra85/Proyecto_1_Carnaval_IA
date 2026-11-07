import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';
import { findCarnavalLandmark, CARNAVAL_LANDMARKS } from '../data/carnavalKnowledge';

export interface ChatBotProps {
  onFocusSenda?: () => void;
  onFocusLandmark?: (coords: [number, number], name?: string) => void;
}

// 3 Quick Action Chips solicitados expresamente para GuaneñaBot
export const QUICK_ACTION_CHIPS = [
  {
    id: 'ruta_6_enero',
    icon: '📌',
    label: 'Ruta 6 de Enero',
    prompt: '¿Cómo es el recorrido de la Senda el 6 de Enero?',
    type: 'senda' as const,
    coords: [1.2154, -77.2841] as [number, number],
    name: 'Senda del Carnaval (Desfile Magno)',
    answer: '¡Que viva Pasto, carajo! 🎭 El Desfile Magno recorre 7 km desde la Normal Superior por toda la Cra 27 hasta Champagnat con las monumentales carrozas. ¡Te he enfocado la Senda completa en el mapa!',
  },
  {
    id: 'plaza_carnaval',
    icon: '🎭',
    label: 'Plaza del Carnaval',
    prompt: 'Cuéntame de la Plaza del Carnaval',
    type: 'landmark' as const,
    coords: [1.2115, -77.2785] as [number, number],
    name: 'Plaza del Carnaval y la Cultura',
    category: 'plaza',
    zoom: 17,
    answer: '¡Que viva Pasto, carajo! 💃 La Plaza del Carnaval es el corazón de la fiesta con tarimas de orquestas en vivo, juego de cosmético y encuentro de murgas. ¡Cámara enfocada en la plaza!',
  },
  {
    id: 'puestos_salud',
    icon: '🚨',
    label: 'Puestos de Salud',
    prompt: '¿Dónde están los puestos de salud y primeros auxilios?',
    type: 'landmark' as const,
    coords: [1.21820, -77.27010] as [number, number],
    name: 'Puesto de Salud Cruz Roja / Bomboná',
    category: 'salud',
    zoom: 17,
    answer: '¡Que viva Pasto, carajo! 🚨 Puestos de primeros auxilios activos con Cruz Roja y Defensa Civil en Bomboná, Plaza del Carnaval y Champagnat. ¡Cámara y capa médica activadas!',
  },
];

export function ChatBot({ onFocusSenda, onFocusLandmark }: ChatBotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Que viva Pasto, carajo! 🎉 Soy GuaneñaBot, tu guía en el Carnaval de Negros y Blancos. Pregúntame sobre la Senda, puntos de salud o los eventos clave.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const handleQuickChip = (chip: typeof QUICK_ACTION_CHIPS[number]) => {
    if (loading) return;

    if (chip.type === 'senda') {
      triggerCameraAction('senda');
    } else if (chip.type === 'landmark') {
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

    const q = userText.toLowerCase();
    const landmark = findCarnavalLandmark(userText);

    const isSendaQuery =
      q.includes('senda') ||
      q.includes('recorrido') ||
      q.includes('ruta') ||
      q.includes('6 de enero') ||
      q.includes('desfile magno') ||
      (landmark && (landmark.id === 'desfile_magno' || landmark.id === 'castaneda'));

    const isSaludQuery =
      q.includes('salud') ||
      q.includes('médic') ||
      q.includes('medic') ||
      q.includes('primeros auxilios') ||
      q.includes('cruz roja') ||
      q.includes('defensa civil') ||
      (landmark && landmark.category === 'salud');

    const isPlazaQuery =
      q.includes('plaza del carnaval') ||
      q.includes('plaza de nariño') ||
      q.includes('plaza narino') ||
      (landmark && landmark.category === 'plaza');

    if (isSendaQuery) {
      triggerCameraAction('senda');
    } else if (isSaludQuery) {
      triggerCameraAction('landmark', [1.21820, -77.27010], 'Puestos de Salud', 'salud', 17);
    } else if (isPlazaQuery) {
      triggerCameraAction('landmark', [1.2115, -77.2785], 'Plaza del Carnaval', 'plaza', 17);
    } else if (landmark) {
      triggerCameraAction('landmark', landmark.coords, landmark.name, landmark.category, landmark.category === 'salud' ? 18 : 17);
    }

    let conciseFallback = '';
    if (isSendaQuery) {
      conciseFallback = '¡Que viva Pasto, carajo! 🎭 La Senda recorre 7 km desde la Normal Superior por la Cra 27 hasta Champagnat. ¡He enfocado la ruta en tu mapa!';
    } else if (isSaludQuery) {
      conciseFallback = '¡Que viva Pasto, carajo! 🚨 Hay puestos médicos de Cruz Roja y Defensa Civil en Bomboná, Plaza del Carnaval y Champagnat. ¡He activado la capa de salud!';
    } else if (isPlazaQuery) {
      conciseFallback = '¡Que viva Pasto, carajo! 💃 La Plaza del Carnaval es el epicentro de la fiesta, orquestas y juego de cosmético. ¡Cámara centrada en la plaza!';
    } else if (landmark) {
      conciseFallback = `¡Que viva Pasto, carajo! 📍 ${landmark.name}: ${landmark.description.slice(0, 110)}... ¡He enfocado sus coordenadas en el mapa!`;
    }

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let botResponse = data.response || data.reply || data.message;

      if (!botResponse) {
        botResponse = conciseFallback || '¡Que viva Pasto, carajo! 🎉 Estoy lista para guiarte por la senda y eventos del Carnaval.';
      } else {
        if (!botResponse.toLowerCase().includes('pasto, carajo')) {
          botResponse = `¡Que viva Pasto, carajo! 🎉 ${botResponse}`;
        }
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.warn('Backend desconectado o error de red, respondiendo de forma contextual:', error);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: conciseFallback || '¡Que viva Pasto, carajo! 🎉 Aquí estoy para guiarte por el Carnaval de Negros y Blancos.',
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
          className="fixed bottom-24 right-6 z-[9999] pointer-events-auto w-[calc(100vw-2.5rem)] sm:w-[390px] h-[520px] max-h-[80vh] rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-rose-950/50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header Festivo: "GuaneñaBot • Asistente del Carnaval" e Indicador "En línea" */}
          <header className="px-4 py-3.5 border-b border-white/10 bg-slate-950/70 flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/30 shrink-0 text-lg">
                🎭
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
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
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Reiniciar chat"
                aria-label="Reiniciar chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
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
                      <div className="w-6 h-6 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs shrink-0 mb-1">
                        🎭
                      </div>
                    )}

                    {/* Burbujas diferenciadas: Usuario con acento festivo, Bot en gris oscuro pulido */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-medium rounded-br-sm shadow-rose-600/20'
                          : (msg as any).isError
                            ? 'bg-rose-950/80 text-rose-200 border border-rose-500/50 rounded-bl-sm'
                            : 'bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-sm font-normal'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
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
                  <div className="w-6 h-6 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs shrink-0 mb-1">
                    🎭
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-slate-800/90 border border-white/10 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
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
          <div className="px-3.5 py-2 bg-slate-950/80 border-t border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_ACTION_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-rose-500/20 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 text-[11px] font-semibold whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  title={`Preguntar por ${chip.label}`}
                >
                  <span className="text-xs">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Input con ícono de Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 bg-slate-950/95 flex items-center gap-2"
          >
            <input
              id="guanena-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a GuaneñaBot..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 transition disabled:opacity-50"
            />
            <button
              id="guanena-chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-600/30 shrink-0"
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
