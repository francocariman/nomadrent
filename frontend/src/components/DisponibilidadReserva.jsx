import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createReserva, getDisponibilidad } from '../api.js';
import { diffDays, formatLargo, nochesOcupadas } from '../dates.js';
import { useAuth } from '../context/AuthContext.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import Notice from './Notice.jsx';

export default function DisponibilidadReserva({ producto, onReservado }) {
  const { user } = useAuth();
  const location = useLocation();
  const [rangos, setRangos] = useState([]);
  const [fechas, setFechas] = useState({ desde: '', hasta: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setRangos(await getDisponibilidad(producto.id));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [producto.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const bloqueadas = useMemo(() => nochesOcupadas(rangos), [rangos]);
  const completo = fechas.desde && fechas.hasta;
  const noches = completo ? diffDays(fechas.desde, fechas.hasta) : 0;

  async function reservar() {
    setError('');
    setExito('');
    setEnviando(true);
    try {
      await createReserva({ productoId: producto.id, fechaInicio: fechas.desde, fechaFin: fechas.hasta });
      setExito(`¡Reserva confirmada! Del ${formatLargo(fechas.desde)} al ${formatLargo(fechas.hasta)}.`);
      setFechas({ desde: '', hasta: '' });
      await cargar();
      onReservado?.();
    } catch (e) {
      setError(e.message);
      await cargar(); // refresca bloqueos por si alguien reservó antes
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-label="Disponibilidad" className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="border-b border-brand-100 pb-3 text-lg font-semibold text-slate-900">Fechas disponibles</h2>

      <div className="mt-4">
        <Notice>{error}</Notice>
        <Notice tipo="ok">{exito}</Notice>
        {cargando ? (
          <p className="py-6 text-center text-sm text-slate-500">Cargando disponibilidad…</p>
        ) : (
          <DateRangePicker value={fechas} onChange={(f) => { setFechas(f); setExito(''); }} bloqueadas={bloqueadas} resaltarDisponibles />
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
            <p>Elige tu fecha de entrada y de salida en el calendario.</p>
          )}
        </div>

        {user ? (
          <button
            type="button"
            onClick={reservar}
            disabled={!completo || enviando}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Reservando…' : 'Reservar'}
          </button>
        ) : (
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="rounded-lg border border-brand-600 px-6 py-2.5 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            Inicia sesión para reservar
          </Link>
        )}
      </div>
    </section>
  );
}
