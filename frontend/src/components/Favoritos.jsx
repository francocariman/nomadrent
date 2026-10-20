import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavoritos } from '../context/FavoritosContext.jsx';
import ProductCard from './ProductCard.jsx';
import Notice from './Notice.jsx';

export default function Favoritos() {
  const { user } = useAuth();
  const { lista, cargando, error, quitar, estaPendiente } = useFavoritos();

  if (!user) {
    return (
      <div role="alert" className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Inicia sesión para ver tus favoritos</p>
        <Link
          to="/login"
          state={{ from: '/favoritos' }}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <section aria-label="Mis favoritos">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Mis favoritos</h1>
        {!cargando && <p className="text-sm text-slate-500">{lista.length} {lista.length === 1 ? 'alojamiento' : 'alojamientos'}</p>}
      </div>

      <Notice>{error}</Notice>
      {cargando && <p className="py-8 text-center text-slate-500">Cargando favoritos…</p>}

      {!cargando && lista.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <p className="text-slate-600">Aún no marcaste ningún alojamiento como favorito.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            Explorar alojamientos
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {lista.map((fav) => (
          <div key={fav.id} className="space-y-2">
            <ProductCard producto={fav.producto} />
            <button
              type="button"
              onClick={() => quitar(fav)}
              disabled={estaPendiente(fav.producto.id)}
              className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Quitar de favoritos
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
