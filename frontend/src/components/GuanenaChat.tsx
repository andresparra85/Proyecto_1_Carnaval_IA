import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, RotateCcw, Compass, MapPin, Navigation, Bot, User } from 'lucide-react';
import { sendMessageToGuanena, ChatHistoryTurn } from '../services/carnavalApi';

export interface GuanenaChatProps {
  onRouteReceived?: (waypoints: [number, number][], shouldDrawRoute: boolean, title?: string) => void;
  onFocusSenda?: () => void;
  className?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  waypoints?: [number, number][];
  shouldDrawRoute?: boolean;
}

const DEFAULT_SUGGESTIONS: string[] = [
  '¿Cuál es el recorrido de la Familia Castañeda?',
  '¿Cómo llego a la Plaza del Carnaval?',
  '¿Cuál es el trayecto del Desfile Magno del 6 de Enero?',
  '¿Dónde hay puestos de salud y primeros auxilios?',
  '¿Dónde comer un buen cuy tradicional?',
];

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-slate-200">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-950/60 text-amber-300 font-mono text-[11px] border border-white/10">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = (content || '').split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-amber-300 text-sm mt-2 mb-1">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3 key={idx} className="font-extrabold text-amber-400 text-sm sm:text-base mt-2 mb-1">
              {trimmed.replace(/^#+\s*/, '')}
            </h3>
          );
        }

        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        if (isBullet) {
          const itemText = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>{formatInlineMarkdown(itemText)}</span>
            </div>
          );
        }

        return <p key={idx}>{formatInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

export const GuanenaChat: React.FC<GuanenaChatProps> = ({
  onRouteReceived,
  onFocusSenda,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      role: 'model',
      content: '¡Qué viva Pasto, carajo! 🎭 Soy **GuaneñaBot**, tu copiloto inteligente para el Carnaval de Negros y Blancos.\n\nPregúntame por los desfiles, recorridos, la Senda del Carnaval o cómo llegar a las plazas y puntos clave. ¡Te trazaré la ruta en el mapa al instante!',
      timestamp: 'Ahora',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const dispatchRouteToMap = useCallback((waypoints: [number, number][], title?: string) => {
    if (!Array.isArray(waypoints) || waypoints.length < 2) return;

    // Disparar evento global para componentes de mapa
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('DRAW_GEMINI_ROUTE', {
          detail: {
            waypoints,
            should_draw_route: true,
            title: title || 'Ruta del Carnaval',
          },
        })
      );
      window.dispatchEvent(
        new CustomEvent('TRIGGER_NAVIGATION', {
          detail: {
            targetCoords: waypoints[waypoints.length - 1],
            targetName: title || 'Destino de Carnaval',
            coords: waypoints,
          },
        })
      );
    }

    if (onRouteReceived) {
      onRouteReceived(waypoints, true, title);
    }
  }, [onRouteReceived]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Formatear historial para el backend de Gemini
    const historyPayload: ChatHistoryTurn[] = messages
      .filter((m) => m.id !== 'welcome-init')
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const response = await sendMessageToGuanena(query, historyPayload);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        waypoints: response.waypoints,
        shouldDrawRoute: response.should_draw_route,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Si GuaneñaBot retorna waypoints, pasarlos al mapa para dibujar la ruta inmediatamente
      if (response.should_draw_route && response.waypoints && response.waypoints.length >= 2) {
        dispatchRouteToMap(response.waypoints, query);
        if (onFocusSenda) onFocusSenda();
      }

      // Actualizar chips de preguntas sugeridas
      if (Array.isArray(response.suggested_questions) && response.suggested_questions.length > 0) {
        setSuggestedQuestions(response.suggested_questions);
      }
    } catch (error) {
      console.error('[GuanenaChat] Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: '¡Qué pena, paisano! Hubo un detalle al consultar el servidor. Pero no te preocupés: puedes explorar la Senda directamente en el mapa.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'welcome-init',
        role: 'model',
        content: '¡Conversación reiniciada! ¿Qué recorrido o punto del Carnaval querés que exploremos ahora?',
        timestamp: 'Ahora',
      },
    ]);
    setSuggestedQuestions(DEFAULT_SUGGESTIONS);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('CLEAR_MAP_ROUTE'));
    }
  };

  return (
    <>
      {/* 1. Botón Flotante Circular (FAB) con Gradiente Festivo y Pulso Neón */}
      <button
        id="guanena-fab-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-500 hover:scale-110 active:scale-95 text-white shadow-2xl shadow-rose-600/40 border-2 border-white/30 transition-all duration-300 cursor-pointer group select-none"
        aria-label="Abrir o cerrar chat de GuaneñaBot"
        title="GuaneñaBot • Asistente Inteligente del Carnaval de Pasto"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-white stroke-[2.5]" />
        ) : (
          <div className="relative flex items-center justify-center text-2xl">
            🎭
          </div>
        )}
      </button>

      {/* 2. Cajón de Chat Glassmorphic Desplegable */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="Ventana de GuaneñaBot"
          className={`fixed bottom-24 right-4 sm:right-6 z-[9999] pointer-events-auto w-[calc(100vw-2rem)] sm:w-[410px] h-[550px] max-h-[82vh] rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-rose-950/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}
        >
          {/* Header con Estado en Línea y Avatar Flotante */}
          <header className="px-4 py-3.5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-500 text-white shadow-lg shadow-rose-600/30 shrink-0 text-lg border border-white/20">
                🎭
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight truncate">
                    GuaneñaBot • Gemini 2.5 Flash
                  </h3>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    IA
                  </span>
                </div>
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
                onClick={handleResetConversation}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Cerrar chat"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Body: Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[88%] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 mb-1 shadow-md">
                        🎭
                      </div>
                    )}

                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white font-medium rounded-tr-none shadow-rose-900/40'
                          : 'bg-slate-900/85 backdrop-blur-md border border-white/10 text-slate-100 rounded-tl-none font-normal'
                      }`}
                    >
                      <MarkdownMessage content={msg.content} />

                      {/* Botón interactivo para ver trazado si la respuesta trajo waypoints */}
                      {!isUser && msg.waypoints && msg.waypoints.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => dispatchRouteToMap(msg.waypoints!)}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>📍 Ver trazado en el mapa</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <span className={`text-[9px] text-slate-500 mt-1 font-mono ${isUser ? 'pr-1' : 'pl-9'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Indicador de Escritura de Alta Fidelidad */}
            {loading && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="flex items-end gap-2 max-w-[88%]">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 mb-1">
                    🎭
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium">
                      GuaneñaBot está consultando la ruta del Carnaval...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Preguntas Sugeridas Clickeables (suggested_questions) */}
          <div className="px-3.5 py-2 bg-slate-950/80 border-t border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={`sug-${idx}`}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 text-[11px] font-semibold whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  title={q}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input de Texto en Píldora con Botón Circular y Degradado */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 bg-slate-950/95 flex items-center gap-2"
          >
            <input
              id="guanena-chat-input-live"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a GuaneñaBot (ej. ¿Cuál es el recorrido?)..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-900/80 border border-white/10 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition disabled:opacity-50"
            />
            <button
              id="guanena-chat-send-btn-live"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 hover:brightness-110 text-white font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center shrink-0"
              aria-label="Enviar pregunta a GuaneñaBot"
              title="Enviar pregunta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export { GuanenaChat as ChatBot, GuanenaChat as GuanenaBot, GuanenaChat as GuaneñaBot };
export default GuanenaChat;
