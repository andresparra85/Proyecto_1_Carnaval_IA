import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('carnavalia_session') === 'active';
    } catch (_) {
      return false;
    }
  });
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  // Sincronizar estado inicial al montar la aplicación
  useEffect(() => {
    try {
      const isSessionActive = typeof window !== 'undefined' && localStorage.getItem('carnavalia_session') === 'active';
      const storedUser = authService.getUser();
      const storedToken = authService.getToken();

      if (isSessionActive) {
        setIsAuthenticated(true);
        if (storedUser) setUser(storedUser);
        if (storedToken) setToken(storedToken);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('carnavalia_session');
      }
    } catch (err) {
      console.warn('Error inicializando estado de autenticación:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicia sesión con credenciales y da acceso inmediato a la app.
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('carnavalia_session', 'active');
    if (data?.user) {
      localStorage.setItem('carnavalia_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    if (data?.access_token) {
      setToken(data.access_token);
    }
    setIsAuthenticated(true);
    return data;
  };

  /**
   * Registra un nuevo usuario en el backend y da acceso inmediato a la app.
   */
  const register = async (fullName, email, password) => {
    const data = await authService.register(fullName, email, password);
    localStorage.setItem('carnavalia_session', 'active');
    if (data?.user) {
      localStorage.setItem('carnavalia_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    if (data?.access_token) {
      setToken(data.access_token);
    }
    setIsAuthenticated(true);
    return data;
  };

  /**
   * Entrada directa como Turista / Invitado (acceso inmediato sin trabas).
   */
  const loginAsGuest = () => {
    const data = authService.loginAsGuest();
    localStorage.setItem('carnavalia_session', 'active');
    if (data?.user) {
      localStorage.setItem('carnavalia_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    setIsAuthenticated(true);
    return data;
  };

  /**
   * Cierra la sesión activa y limpia el almacenamiento.
   */
  const logout = () => {
    authService.logout();
    localStorage.removeItem('carnavalia_session');
    localStorage.removeItem('carnavalia_user');
    localStorage.removeItem('carnavalia_token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
