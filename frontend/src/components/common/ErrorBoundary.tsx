import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó una excepción en tiempo de ejecución:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('carnavalia_session');
      localStorage.removeItem('carnavalia_user');
      localStorage.removeItem('carnavalia_token');
    } catch (_) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans select-none">
          <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-in fade-in duration-300">
            {/* Ícono festivo */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white text-3xl shadow-lg shadow-rose-600/30">
              🎭
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                GuaneñaBot • Recuperación Activa
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                ¡Que viva Pasto, carajo!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ocurrió un contratiempo inesperado en la interfaz del Carnaval. Tus datos y configuraciones están seguros.
              </p>
            </div>

            {/* Detalle del error si existe */}
            {this.state.error && (
              <div className="text-left bg-black/40 border border-white/5 rounded-xl p-3 max-h-32 overflow-y-auto font-mono text-[11px] text-rose-300">
                <strong>Error: </strong>
                {this.state.error.message || 'Error desconocido en el árbol de componentes.'}
              </div>
            )}

            {/* Botones de rescate */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-md shadow-rose-600/25 active:scale-95 cursor-pointer"
              >
                Recargar CarnavalIA
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                Reiniciar Sesión
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
