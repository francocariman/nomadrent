import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createResena, getElegibilidadResena, getResenas } from '../api.js';
import { formatFechaHora } from '../dates.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EntradaEstrellas, Estrellas } from './Estrellas.jsx';
import Notice from './Notice.jsx';

const MAX = 1000;

function Formulario({ productoId, onPublicada }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!puntuacion) return setError('Elige una puntuación de 1 a 5 estrellas.');
    if (!comentario.trim()) return setError('Escribe un comentario sobre tu estadía.');
    setEnviando(true);
    try {
      await createResena(productoId, { puntuacion, comentario: comentario.trim() });
      onPublicada();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">Cuéntanos tu experiencia</h3>
      <Notice>{error}</Notice>
      <EntradaEstrellas valor={puntuacion} onChange={setPuntuacion} disabled={enviando} />
      <div>
        <label htmlFor="resena-comentario" className="sr-only">Comentario</label>
        <textarea
          id="resena-comentario"
          rows={4}
          maxLength={MAX}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="¿Qué te pareció el alojamiento?"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{comentario.length}/{MAX}</p>
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {enviando ? 'Publicando…' : 'Publicar reseña'}
      </button>
    </form>
  );
}

/**
 * `refrescar` (número) permite que el padre fuerce una nueva consulta de elegibilidad
 * (por ejemplo, justo después de crear una reserva).
 */
export default function Resenas({ productoId, refrescar = 0, onCambio }) {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState({ media: 0, total: 0, resenas: [] });
  const [eleg, setEleg] = useState({ puedeResenar: false, motivo: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [r, e] = await Promise.all([getResenas(productoId), getElegibilidadResena(productoId)]);
      setData(r);
      setEleg(e);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [productoId]);

  // `user` y `refrescar` en las dependencias: recarga al iniciar/cerrar sesión o al reservar
  useEffect(() => { cargar(); }, [cargar, user, refrescar]);

  return (
    <section aria-label="Reseñas" className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="border-b border-brand-100 pb-3 text-lg font-semibold text-slate-900">Opiniones</h2>

      <div className="mt-4">
        <Notice>{error}</Notice>
        {cargando ? (
          <p className="py-4 text-center text-sm text-slate-500">Cargando reseñas…</p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <p className="text-4xl font-bold text-slate-900">{data.total ? data.media.toFixed(1) : '–'}</p>
              <div>
                <Estrellas valor={data.media} className="h-5 w-5" />
                <p className="mt-0.5 text-sm text-slate-500">
                  {data.total ? `${data.total} ${data.total === 1 ? 'reseña' : 'reseñas'}` : 'Aún no hay reseñas'}
                </p>
              </div>
            </div>

            {user && eleg.puedeResenar ? (
              <div className="mb-6">
                <Formulario productoId={productoId} onPublicada={() => { cargar(); onCambio?.(); }} />
              </div>
            ) : (
              <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {eleg.motivo || 'Inicia sesión para dejar tu opinión.'}{' '}
                {!user && (
                  <Link to="/login" state={{ from: location.pathname }} className="font-medium text-brand-600 hover:text-brand-700">
                    Iniciar sesión
                  </Link>
                )}
              </p>
            )}

            <ul className="divide-y divide-slate-100">
              {data.resenas.map((r) => (
                <li key={r.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600" aria-hidden="true">
                        {r.autor[0]}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.autor}</p>
                        <p className="text-xs text-slate-500">{formatFechaHora(r.fecha)}</p>
                      </div>
                    </div>
                    <Estrellas valor={r.puntuacion} />
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{r.comentario}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
