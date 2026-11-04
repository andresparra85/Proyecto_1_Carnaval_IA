import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw } from 'lucide-react';

const QUICK_PROMPTS = [
  '¿Cómo es el recorrido de la Senda?',
  '¿Qué eventos hay el 5 y 6 de enero?',
  '¿Dónde comer frito pastuso y cuy?',
];

export function ChatIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Qué viva Pasto, carajo! 🎉 Soy GuaneñaBot, tu guía en el Carnaval de Pasto. Pregúntame sobre el recorrido de la Senda, el calendario de eventos o los mejores lugares gastronómicos.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend) => {
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

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
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
      const botResponse = data.response || data.reply || data.message || 'Sin respuesta';

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error al conectar con GuaneñaBot:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'No se pudo conectar con GuaneñaBot. Verifica que el backend esté encendido.',
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: '¡Conversación reiniciada! ¿Qué deseas consultar sobre el Carnaval de Pasto, paisano?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* 1. Botón Disparador Flotante con z-[9999] y pointer-events-auto */}
      <button
        id="open-chat-fab"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group select-none"
        aria-label="Abrir o cerrar chat con GuaneñaBot"
        title="GuaneñaBot - Asistente IA del Carnaval de Pasto"
      >
        <div className="relative flex items-center justify-center w-6 h-6 text-base">
          🎭
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>
        <span className="font-extrabold tracking-wide">
          {isOpen ? 'Cerrar Chat' : 'GuaneñaBot'}
        </span>
        <Sparkles className="w-3.5 h-3.5 text-white/90 shrink-0" />
      </button>

      {/* 2. Ventana de Chat Flotante con z-[9999] ubicada sobre el botón */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="Ventana de GuaneñaBot"
          className="fixed bottom-20 right-6 z-[9999] pointer-events-auto w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[80vh] rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header con botón visible de cierre */}
          <header className="px-4 py-3.5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shrink-0 text-base">
                🎭
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs sm:text-sm text-white tracking-tight leading-tight truncate">
                  GuaneñaBot
                </h3>
                <p className="text-[10px] text-slate-400 truncate">
                  Tu guía en el Carnaval de Pasto
                </p>
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

          {/* Body: Historial de mensajes */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
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

                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-br-sm'
                          : msg.isError
                            ? 'bg-rose-950/80 text-rose-200 border border-rose-500/50 rounded-bl-sm'
                            : 'bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-sm'
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

            {/* Indicador de carga: 3 puntos animados */}
            {loading && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs shrink-0 mb-1">
                    🎭
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-slate-800/90 border border-white/10 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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

          {/* Chips de preguntas rápidas (Quick Prompts) */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium whitespace-nowrap active:scale-95 transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Input con ícono de avión de papel (Send) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 bg-slate-950/90 flex items-center gap-2"
          >
            <input
              id="guanena-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a GuaneñaBot..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition disabled:opacity-50"
            />
            <button
              id="guanena-chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-orange-500/20 shrink-0"
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

export { ChatIA as GuaneñaBot, ChatIA as GuanenaBot, ChatIA as ChatBot };
export default ChatIA;
