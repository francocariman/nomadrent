import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getReservasUsuario } from '../api.js';
import { formatFechaHora, formatLargo, hoyISO } from '../dates.js';
import { useAuth } from '../context/AuthContext.jsx';
import Notice from './Notice.jsx';

function estado(r) {
  const hoy = hoyISO();
  if (hoy < r.fechaInicio) return { texto: 'Próxima', cls: 'bg-sky-100 text-sky-700' };
  if (hoy >= r.fechaFin) return { texto: 'Finalizada', cls: 'bg-slate-100 text-slate-600' };
  return { texto: 'En curso', cls: 'bg-emerald-100 text-emerald-700' };
}

/** Historial de reservas del usuario, de la más reciente a la más antigua. */
export default function MisReservas() {
  const { user } = useAuth();
  const location = useLocation();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setCargando(true);
    getReservasUsuario(user.id)
      .then((r) => { setReservas(r); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [user]);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, mensaje: 'Inicia sesión para ver tu historial de reservas.' }}
      />
    );
  }

  return (
    <section aria-label="Mis reservas">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Mis reservas</h1>
        {!cargando && <p className="text-sm text-slate-500">{reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}</p>}
      </div>

      <Notice>{error}</Notice>
      {cargando && <p className="py-8 text-center text-slate-500">Cargando reservas…</p>}

      {!cargando && !error && reservas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <p className="text-slate-600">Todavía no tienes reservas.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">Explorar alojamientos</Link>
        </div>
      )}

      <ul className="space-y-4">
        {reservas.map((r) => {
          const est = estado(r);
          return (
            <li key={r.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:h-28 sm:w-40">
                {r.productoImagen && <img src={r.productoImagen} alt={r.productoNombre} loading="lazy" className="h-full w-full object-cover" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/producto/${r.productoId}`} className="block truncate text-base font-semibold text-slate-900 hover:text-brand-700">
                      {r.productoNombre}
                    </Link>
                    <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" aria-hidden="true" />{r.productoCiudad}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${est.cls}`}>{est.texto}</span>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-500">Fechas de uso</dt>
                    <dd className="font-medium text-slate-800">{formatLargo(r.fechaInicio)} → {formatLargo(r.fechaFin)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Reservado el</dt>
                    <dd className="font-medium text-slate-800">{formatFechaHora(r.creadaEn)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Estadía</dt>
                    <dd className="font-medium text-slate-800">
                      {r.noches} {r.noches === 1 ? 'noche' : 'noches'} · USD {r.total.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Código</dt>
                    <dd className="font-medium text-slate-800">NR-{r.id}</dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
