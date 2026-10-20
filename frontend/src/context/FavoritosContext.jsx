import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getFavoritos, toggleFavorito, deleteFavorito } from '../api.js';

const FavoritosContext = createContext(null);

export function FavoritosProvider({ children }) {
  const { user } = useAuth();
  const [lista, setLista] = useState([]); // [{ id, producto }]
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [pendientes, setPendientes] = useState(() => new Set()); // productoIds en curso

  const recargar = useCallback(async () => {
    if (!user) return;
    try {
      setLista(await getFavoritos(user.id));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [user]);

  // Se carga al iniciar sesión y se vacía al cerrarla
  useEffect(() => {
    if (!user) {
      setLista([]);
      setError('');
      return;
    }
    setCargando(true);
    recargar().finally(() => setCargando(false));
  }, [user, recargar]);

  const conPendiente = async (productoId, fn) => {
    setPendientes((s) => new Set(s).add(productoId));
    try {
      await fn();
      await recargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setPendientes((s) => {
        const n = new Set(s);
        n.delete(productoId);
        return n;
      });
    }
  };

  const value = useMemo(() => {
    const ids = new Set(lista.map((f) => f.producto.id));
    return {
      lista,
      cargando,
      error,
      esFavorito: (productoId) => ids.has(productoId),
      estaPendiente: (productoId) => pendientes.has(productoId),
      alternar: (productoId) => conPendiente(productoId, () => toggleFavorito(productoId)),
      quitar: (favorito) => conPendiente(favorito.producto.id, () => deleteFavorito(favorito.id)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, cargando, error, pendientes, recargar]);

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error('useFavoritos debe usarse dentro de <FavoritosProvider>');
  return ctx;
}
