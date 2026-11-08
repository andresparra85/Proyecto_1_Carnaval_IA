import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw, MessageSquare, MapPin, Navigation, Bot, User } from 'lucide-react';
import { useMapAction } from '../context/MapActionContext';
import { parseBotIntent, dispatchIntentCommand } from '../services/botIntentParser';
import { QUICK_ACTION_CHIPS, QuickActionChip } from './ChatBot';

export interface ChatDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  userGps?: [number, number] | null;
  onFocusSenda?: () => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTaken?: string;
}

/**
 * ChatDrawer: Asistente GuaneñaBot con Arquitectura Chat-Driven UI y Estilizado Glassmorphism Andino.
 * Optimizado para exteriores de alto contraste, bordes ámbar/dorados y detalles carmesí festivo (#e11d48).
 */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen: propIsOpen,
  onClose,
  userGps,
  onFocusSenda,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;
  const { dispatchMapCommand } = useMapAction();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Que viva Pasto, carajo! 🎭 Soy GuaneñaBot, tu copiloto con inteligencia artificial en el Carnaval de Negros y Blancos.\n\nPídeme lo que necesites: ver el recorrido de la Senda, encontrar baños públicos, comer un buen cuy o buscar el CAI de policía más cercano.',
      timestamp: 'Ahora',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Procesar intención semántica con el parser de mapa Chat-Driven UI
    setTimeout(() => {
      const isParadeQuery = /senda|desfile|blancos|casta[ñn]eda|4 de enero|6 de enero|camino|ruta/i.test(query);
      if (isParadeQuery && typeof window !== 'undefined' && typeof (window as any).dibujarSendaCarnaval === 'function') {
        (window as any).dibujarSendaCarnaval('senda_oficial');
      }

      const intent = parseBotIntent(query, userGps);
      let botResponse = '¡Que viva Pasto, carajo! 🎭 Estoy buscando la mejor información para ti.';
      let actionLabel: string | undefined;

      if (isParadeQuery) {
        botResponse = '¡Que viva Pasto, carajo! 🎭 He desplegado la Senda Oficial continua calle por calle (Champagnat -> Cra 27 -> Plaza Carnaval -> Cll 19 -> Plaza Nariño -> Cra 22 / Torobajo) en el mapa.';
        actionLabel = 'Mapa actualizado: SHOW_SENDA';
        if (onFocusSenda) onFocusSenda();
      } else if (intent) {
        dispatchIntentCommand(intent, dispatchMapCommand);
        botResponse = intent.feedbackText;
        actionLabel = `Mapa actualizado: ${intent.mapCommand.actionType}`;

        if (intent.mapCommand.actionType === 'SHOW_SENDA' && onFocusSenda) {
          onFocusSenda();
        }
      } else {
        botResponse = `¡Entendido, paisano! Sobre "${query}": puedes consultar el calendario oficial, activar los filtros de puntos de interés o pedirme cómo llegar a pie a cualquier lugar de la Senda.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: actionLabel,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleChipClick = (chip: QuickActionChip) => {
    handleSendMessage(chip.prompt);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: '¡Memoria reiniciada, paisano! ¿Qué lugar o desfile del Carnaval deseas explorar?',
        timestamp: 'Ahora',
      },
    ]);
  };

  const handleToggle = () => {
    if (onClose && isOpen) {
      onClose();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <>
      {/* Botón flotante disparador de GuaneñaBot si no está abierto */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-[950] flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-500/40 backdrop-blur-md cursor-pointer group"
          title="Abrir GuaneñaBot Asistente"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🎭</span>
          <span className="font-extrabold tracking-wide uppercase">GuaneñaBot</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      )}

      {/* Drawer Glassmorphic Andino de Alto Contraste */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[1000] w-full sm:w-[420px] max-w-full bg-slate-950/92 backdrop-blur-md border-l border-amber-500/30 shadow-2xl flex flex-col transition-all duration-300 text-slate-100">
          {/* Cabecera del Drawer */}
          <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg border border-amber-400/40">
                🎭
              </div>
              <div>
                <h3 className="font-black text-base tracking-wide text-white flex items-center gap-2">
                  <span>GuaneñaBot</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 uppercase">
                    AI Chat-Driven
                  </span>
                </h3>
                <p className="text-xs text-amber-300/80 font-medium">
                  Copiloto Oficial Carnaval de Pasto
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/10 transition active:scale-95 cursor-pointer"
                title="Limpiar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggle}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition active:scale-95 cursor-pointer"
                title="Cerrar GuaneñaBot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chips de Acciones Rápidas (Píldoras temáticas) */}
          <div className="p-3 bg-slate-900/50 border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2">
            {QUICK_ACTION_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 text-xs font-semibold whitespace-nowrap transition active:scale-95 cursor-pointer shadow-sm"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-md'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : '🎭'}
                  </div>

                  <div className={`max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-lg ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 text-slate-100 border border-amber-500/25 rounded-tl-none backdrop-blur-md'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.actionTaken && (
                        <div className="mt-2 pt-1.5 border-t border-amber-500/30 flex items-center gap-1.5 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                          <Navigation className="w-3 h-3 text-amber-400 animate-spin" />
                          <span>{msg.actionTaken}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-slate-900/40 rounded-xl max-w-fit border border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>GuaneñaBot está consultando la Senda...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <div className="p-3 bg-slate-900/90 border-t border-amber-500/20 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregúntale a GuaneñaBot (ej. ¿Cómo llego a la Plaza?)..."
                className="flex-1 bg-slate-950/80 border border-amber-500/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer shrink-0"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDrawer;
