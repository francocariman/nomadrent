import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavoritos } from '../context/FavoritosContext.jsx';

/** Corazón interactivo. Solo se muestra a usuarios autenticados. */
export default function FavoritoButton({ productoId, className = '' }) {
  const { user } = useAuth();
  const { esFavorito, alternar, estaPendiente } = useFavoritos();
  if (!user) return null;

  const activo = esFavorito(productoId);
  return (
    <button
      type="button"
      onClick={() => alternar(productoId)}
      disabled={estaPendiente(productoId)}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={activo ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow ring-1 ring-slate-200 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`h-5 w-5 ${activo ? 'text-rose-500' : 'text-slate-500'}`}
        fill={activo ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  );
}
