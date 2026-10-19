import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, register as apiRegister, SESSION_KEY, EVENTO_SESION_EXPIRADA } from '../api.js';

const AuthContext = createContext(null);

function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    return s?.token && s?.usuario ? s : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const guardar = useCallback((s) => {
    setSesion(s);
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch { /* almacenamiento no disponible */ }
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await apiLogin({ email, password });
    guardar(r);
    return r.usuario;
  }, [guardar]);

  const register = useCallback(async (datos) => {
    const r = await apiRegister(datos);
    guardar(r);
    return r.usuario;
  }, [guardar]);

  const logout = useCallback(() => guardar(null), [guardar]);

  // Si el backend rechaza el token (vencido), se vuelve al modo anónimo
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, logout);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, logout);
  }, [logout]);

  const value = useMemo(() => {
    const user = sesion?.usuario ?? null;
    return { user, isAdmin: user?.rol === 'ADMIN', login, register, logout };
  }, [sesion, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
