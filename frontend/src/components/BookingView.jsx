import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Pencil } from 'lucide-react';
import { createReserva, getDisponibilidad, getProducto } from '../api.js';
import { addDays, diffDays, formatLargo, hoyISO, nochesOcupadas } from '../dates.js';
import { validarCampo } from '../validation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icono } from '../icons.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import { ResumenPuntuacion } from './Estrellas.jsx';
import { MENSAJE_LOGIN_RESERVA } from './DisponibilidadReserva.jsx';
import Notice from './Notice.jsx';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const HORAS = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 08:00–23:00
const MAX_COMENTARIO = 500;

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const soloLecturaCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700';

function Seccion({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 border-b border-brand-100 pb-3 text-lg font-semibold text-slate-900">{titulo}</h2>
      {children}
    </section>
  );
}

function Dato({ label, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{children}</p>
    </div>
  );
}

/** Pantalla de éxito con el detalle de la reserva confirmada. */
function Confirmacion({ reserva }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8" role="status">
      <div className="mb-5 flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-500" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">¡Reserva confirmada!</h1>
          <p className="text-sm text-slate-500">Código de reserva: <strong>NR-{reserva.id}</strong></p>
        </div>
      </div>

      <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
        {reserva.productoImagen && (
          <img src={reserva.productoImagen} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{reserva.productoNombre}</p>
          <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" aria-hidden="true" />{reserva.productoCiudad}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <Dato label="Entrada">{formatLargo(reserva.fechaInicio)}</Dato>
        <Dato label="Salida">{formatLargo(reserva.fechaFin)}</Dato>
        <Dato label="Estadía">{reserva.noches} {reserva.noches === 1 ? 'noche' : 'noches'}</Dato>
        <Dato label="Total">USD {reserva.total.toFixed(2)}</Dato>
        <Dato label="Hora estimada de llegada">{reserva.horaLlegada ? reserva.horaLlegada.slice(0, 5) : 'No indicada'}</Dato>
        <Dato label="Correo de contacto">{reserva.emailContacto}</Dato>
        {reserva.comentarios && (
          <div className="sm:col-span-2"><Dato label="Comentarios">{reserva.comentarios}</Dato></div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        <Link to="/mis-reservas" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          Ver mis reservas
        </Link>
        <Link to="/" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function BookingView() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [query] = useSearchParams();

  const [producto, setProducto] = useState(null);
  const [rangos, setRangos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Fechas que vienen del calendario del detalle (?desde=...&hasta=...), si son válidas
  const [fechas, setFechas] = useState(() => {
    const d = query.get('desde');
    const h = query.get('hasta');
    const validas = d && h && ISO_RE.test(d) && ISO_RE.test(h) && d < h && d >= hoyISO();
    return validas ? { desde: d, hasta: h } : { desde: '', hasta: '' };
  });
  const [editarEmail, setEditarEmail] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [errorEmail, setErrorEmail] = useState('');
  const [hora, setHora] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);

  const bloqueadas = useMemo(() => nochesOcupadas(rangos), [rangos]);

  useEffect(() => {
    if (!user) return;
    setCargando(true);
    Promise.all([getProducto(id), getDisponibilidad(id)])
      .then(([p, r]) => { setProducto(p); setRangos(r); setErrorCarga(''); })
      .catch((e) => setErrorCarga(e.message))
      .finally(() => setCargando(false));
  }, [id, user]);

  // Si las fechas elegidas cruzan noches ocupadas (p. ej. alguien reservó antes), se descartan
  useEffect(() => {
    if (!fechas.desde || !fechas.hasta) return;
    for (let d = fechas.desde; d < fechas.hasta; d = addDays(d, 1)) {
      if (bloqueadas.has(d)) {
        setFechas({ desde: '', hasta: '' });
        setAviso('Las fechas que habías elegido ya no están disponibles. Elige otras en el calendario.');
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloqueadas]);

  const refrescarDisponibilidad = useCallback(
    () => getDisponibilidad(id).then(setRangos).catch(() => {}),
    [id]
  );

  // Sin sesión: se vuelve a Login con un mensaje claro y se regresa aquí tras ingresar
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search, mensaje: MENSAJE_LOGIN_RESERVA }}
      />
    );
  }

  if (reserva) return <Confirmacion reserva={reserva} />;

  const completo = Boolean(fechas.desde && fechas.hasta);
  const noches = completo ? diffDays(fechas.desde, fechas.hasta) : 0;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setAviso('');
    if (!completo) {
      return setError('Selecciona tu fecha de entrada y de salida en el calendario.');
    }
    const emailLimpio = email.trim();
    if (editarEmail) {
      const msg = validarCampo('email', emailLimpio);
      setErrorEmail(msg);
      if (msg) return undefined;
    }

    setEnviando(true);
    try {
      const creada = await createReserva({
        productoId: producto.id,
        fechaInicio: fechas.desde,
        fechaFin: fechas.hasta,
        horaLlegada: hora || null,
        comentarios: comentarios.trim() || null,
        emailContacto: editarEmail && emailLimpio.toLowerCase() !== user.email.toLowerCase() ? emailLimpio : null,
      });
      setReserva(creada);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message); // mensaje específico del servidor (p. ej. fechas ya no disponibles)
      if (err.status === 400) await refrescarDisponibilidad();
    } finally {
      setEnviando(false);
    }
    return undefined;
  }

  if (cargando) return <p className="py-16 text-center text-slate-500">Cargando…</p>;
  if (errorCarga || !producto) {
    return (
      <div>
        <Notice>{errorCarga || 'No se pudo cargar el alojamiento.'}</Notice>
        <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">Volver al inicio</Link>
      </div>
    );
  }

  const imagenes = producto.imagenes.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-6">
        <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">Confirma tu reserva</h1>
        <Link
          to={`/producto/${producto.id}`}
          aria-label="Volver al alojamiento"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Link>
      </div>

      {/* Información completa del producto */}
      <Seccion titulo="Tu alojamiento">
        <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
            <div className="col-span-4 row-span-1 h-52 sm:h-64">
              {imagenes[0] && <img src={imagenes[0]} alt={producto.nombre} className="h-full w-full object-cover" />}
            </div>
            {imagenes.slice(1).map((src, i) => (
              <img key={i} src={src} alt={`${producto.nombre} — imagen ${i + 2}`} className="h-16 w-full object-cover sm:h-20" />
            ))}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-600">{producto.categoria}</p>
            <h2 className="text-xl font-bold text-slate-900">{producto.nombre}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />{producto.ciudad}
            </p>
            <ResumenPuntuacion media={producto.puntuacionMedia} total={producto.totalResenas} className="mt-1" />
            <p className="mt-2 text-sm text-slate-700">
              <span className="text-xl font-bold text-slate-900">USD {producto.precio}</span> / noche
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{producto.descripcion}</p>
            {producto.caracteristicas.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {producto.caracteristicas.map((c) => (
                  <li key={c.id} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                    <Icono nombre={c.icono} className="h-3.5 w-3.5" />{c.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Seccion>

      <form onSubmit={enviar} noValidate className="space-y-6">
        {/* Datos del usuario autenticado */}
        <Seccion titulo="Tus datos">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reserva-nombre" className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
              <input id="reserva-nombre" readOnly value={user.nombre} className={soloLecturaCls} />
            </div>
            <div>
              <label htmlFor="reserva-apellido" className="mb-1 block text-sm font-medium text-slate-700">Apellido</label>
              <input id="reserva-apellido" readOnly value={user.apellido} className={soloLecturaCls} />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="reserva-email" className="text-sm font-medium text-slate-700">Correo electrónico de contacto</label>
                <button
                  type="button"
                  onClick={() => {
                    if (editarEmail) { setEmail(user.email); setErrorEmail(''); }
                    setEditarEmail((v) => !v);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  {editarEmail ? 'Usar el de mi cuenta' : 'Editar'}
                </button>
              </div>
              <input
                id="reserva-email"
                type="email"
                readOnly={!editarEmail}
                value={editarEmail ? email : user.email}
                onChange={(e) => { setEmail(e.target.value); setErrorEmail(''); }}
                aria-invalid={errorEmail ? 'true' : undefined}
                className={editarEmail ? `${inputCls} ${errorEmail ? 'border-red-400' : ''}` : soloLecturaCls}
              />
              {errorEmail && <p className="mt-1 text-xs text-red-600">{errorEmail}</p>}
            </div>
          </div>
        </Seccion>

        {/* Fechas */}
        <Seccion titulo="Fechas de tu estadía">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reserva-checkin" className="mb-1 block text-sm font-medium text-slate-700">Entrada (check-in)</label>
              <input id="reserva-checkin" readOnly value={fechas.desde ? formatLargo(fechas.desde) : ''} placeholder="Elige en el calendario" className={soloLecturaCls} />
            </div>
            <div>
              <label htmlFor="reserva-checkout" className="mb-1 block text-sm font-medium text-slate-700">Salida (check-out)</label>
              <input id="reserva-checkout" readOnly value={fechas.hasta ? formatLargo(fechas.hasta) : ''} placeholder="Elige en el calendario" className={soloLecturaCls} />
            </div>
          </div>

          <Notice tipo="info">{aviso}</Notice>
          <DateRangePicker
            value={fechas}
            onChange={(f) => { setFechas(f); setAviso(''); setError(''); }}
            bloqueadas={bloqueadas}
            resaltarDisponibles
          />

          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600" aria-live="polite">
            {completo ? (
              <>
                {noches} {noches === 1 ? 'noche' : 'noches'} × USD {producto.precio} ={' '}
                <span className="text-lg font-bold text-slate-900">USD {(noches * producto.precio).toFixed(2)}</span>
              </>
            ) : (
              'Selecciona entrada y salida para ver el total.'
            )}
          </p>
        </Seccion>

        {/* Opcionales */}
        <Seccion titulo="Detalles adicionales (opcional)">
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <div>
              <label htmlFor="reserva-hora" className="mb-1 block text-sm font-medium text-slate-700">Hora estimada de llegada</label>
              <select id="reserva-hora" value={hora} onChange={(e) => setHora(e.target.value)} className={inputCls}>
                <option value="">No lo sé aún</option>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reserva-comentarios" className="mb-1 block text-sm font-medium text-slate-700">Comentarios para el anfitrión</label>
              <textarea
                id="reserva-comentarios"
                rows={3}
                maxLength={MAX_COMENTARIO}
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className={inputCls}
              />
              <p className="mt-1 text-right text-xs text-slate-400">{comentarios.length}/{MAX_COMENTARIO}</p>
            </div>
          </div>
        </Seccion>

        <Notice>{error}</Notice>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
          >
            {enviando ? 'Confirmando…' : 'Confirmar reserva'}
          </button>
        </div>
      </form>
    </div>
  );
}
