import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisponibilidad } from '../api.js';
import { diffDays, formatLargo, nochesOcupadas } from '../dates.js';
import { useAuth } from '../context/AuthContext.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import Notice from './Notice.jsx';

export const MENSAJE_LOGIN_RESERVA = 'Debes iniciar sesión o registrarte para continuar con tu reserva.';

/**
 * Calendario de disponibilidad del detalle. El botón "Reservar":
 *  - sin sesión  → redirige a /login con un mensaje claro (y vuelve a la reserva tras ingresar)
 *  - con sesión  → redirige a /producto/:id/reserva (con las fechas elegidas, si las hay)
 */
export default function DisponibilidadReserva({ producto }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rangos, setRangos] = useState([]);
  const [fechas, setFechas] = useState({ desde: '', hasta: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDisponibilidad(producto.id)
      .then((r) => { setRangos(r); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [producto.id]);

  const bloqueadas = useMemo(() => nochesOcupadas(rangos), [rangos]);
  const completo = fechas.desde && fechas.hasta;
  const noches = completo ? diffDays(fechas.desde, fechas.hasta) : 0;

  function reservar() {
    const base = `/producto/${producto.id}/reserva`;
    const destino = completo ? `${base}?desde=${fechas.desde}&hasta=${fechas.hasta}` : base;
    if (!user) {
      navigate('/login', { state: { from: destino, mensaje: MENSAJE_LOGIN_RESERVA } });
      return;
    }
    navigate(destino);
  }

  return (
    <section aria-label="Disponibilidad" className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="border-b border-brand-100 pb-3 text-lg font-semibold text-slate-900">Fechas disponibles</h2>

      <div className="mt-4">
        <Notice>{error}</Notice>
        {cargando ? (
          <p className="py-6 text-center text-sm text-slate-500">Cargando disponibilidad…</p>
        ) : (
          <DateRangePicker value={fechas} onChange={setFechas} bloqueadas={bloqueadas} resaltarDisponibles />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600" aria-live="polite">
          {completo ? (
            <>
              <p>{formatLargo(fechas.desde)} → {formatLargo(fechas.hasta)}</p>
              <p className="mt-0.5">
                {noches} {noches === 1 ? 'noche' : 'noches'} ·{' '}
                <span className="text-lg font-bold text-slate-900">USD {(noches * producto.precio).toFixed(2)}</span>
              </p>
            </>
          ) : (
            <p>Elige tu entrada y salida en el calendario, o continúa y elígelas en el siguiente paso.</p>
          )}
        </div>
        <button
          type="button"
          onClick={reservar}
          className="rounded-lg bg-brand-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Reservar
        </button>
      </div>
    </section>
  );
}
