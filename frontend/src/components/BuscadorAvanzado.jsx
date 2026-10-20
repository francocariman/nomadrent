import { useEffect, useId, useRef, useState } from 'react';
import { Building2, CalendarDays, MapPin, Search } from 'lucide-react';
import { getSugerencias } from '../api.js';
import { formatCorto } from '../dates.js';
import DateRangePicker from './DateRangePicker.jsx';

const campoCls =
  'flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100';

/**
 * Buscador por destino (con sugerencias dinámicas) y rango de fechas (calendario doble).
 * Llama a onBuscar({ destino, desde, hasta }) y onLimpiar().
 */
export default function BuscadorAvanzado({ onBuscar, onLimpiar, activo, busqueda }) {
  const uid = useId();
  const listId = `${uid}-sugerencias`;

  const [destino, setDestino] = useState('');
  const [fechas, setFechas] = useState({ desde: '', hasta: '' });
  const [sugerencias, setSugerencias] = useState([]);
  const [abiertoSug, setAbiertoSug] = useState(false);
  const [indice, setIndice] = useState(-1);
  const [calAbierto, setCalAbierto] = useState(false);
  const [error, setError] = useState('');

  // Si la búsqueda cambia desde afuera (p. ej. al elegir unas fechas sugeridas), se reflejan los campos
  useEffect(() => {
    if (!busqueda) return;
    setDestino(busqueda.destino);
    setFechas({ desde: busqueda.desde, hasta: busqueda.hasta });
    setError('');
    setAbiertoSug(false);
  }, [busqueda?.destino, busqueda?.desde, busqueda?.hasta]); // eslint-disable-line react-hooks/exhaustive-deps

  const refDestino = useRef(null);
  const refFechas = useRef(null);

  // Sugerencias con debounce; se descartan respuestas viejas
  useEffect(() => {
    if (!abiertoSug || destino.trim().length < 2) {
      setSugerencias([]);
      return undefined;
    }
    let cancelado = false;
    const t = setTimeout(() => {
      getSugerencias(destino.trim())
        .then((r) => { if (!cancelado) { setSugerencias(r); setIndice(-1); } })
        .catch(() => { if (!cancelado) setSugerencias([]); });
    }, 250);
    return () => { cancelado = true; clearTimeout(t); };
  }, [destino, abiertoSug]);

  // Cierra los desplegables al hacer clic fuera
  useEffect(() => {
    const fuera = (e) => {
      if (refDestino.current && !refDestino.current.contains(e.target)) setAbiertoSug(false);
      if (refFechas.current && !refFechas.current.contains(e.target)) setCalAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  function elegir(s) {
    setDestino(s.texto);
    setAbiertoSug(false);
    setSugerencias([]);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') return setAbiertoSug(false);
    if (!abiertoSug || sugerencias.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndice((i) => (i + 1) % sugerencias.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndice((i) => (i <= 0 ? sugerencias.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && indice >= 0) { e.preventDefault(); elegir(sugerencias[indice]); }
  }

  function submit(e) {
    e.preventDefault();
    if (fechas.desde && !fechas.hasta) {
      setError('Elige también la fecha de salida.');
      setCalAbierto(true);
      return;
    }
    setError('');
    setAbiertoSug(false);
    setCalAbierto(false);
    onBuscar({ destino: destino.trim(), desde: fechas.desde, hasta: fechas.hasta });
  }

  function limpiar() {
    setDestino('');
    setFechas({ desde: '', hasta: '' });
    setError('');
    setSugerencias([]);
    onLimpiar();
  }

  const textoFechas =
    fechas.desde && fechas.hasta
      ? `${formatCorto(fechas.desde)} → ${formatCorto(fechas.hasta)}`
      : fechas.desde
        ? `${formatCorto(fechas.desde)} → ¿salida?`
        : 'Entrada y salida';

  return (
    <section aria-label="Buscador" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-slate-900">¿Dónde quieres quedarte?</h2>

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[2fr_1.4fr_auto]">
        {/* Destino con sugerencias */}
        <div className="relative" ref={refDestino}>
          <label className={campoCls}>
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              role="combobox"
              aria-expanded={abiertoSug && sugerencias.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={indice >= 0 ? `${uid}-op-${indice}` : undefined}
              aria-label="Destino o alojamiento"
              placeholder="Ciudad o alojamiento"
              autoComplete="off"
              value={destino}
              onChange={(e) => { setDestino(e.target.value); setAbiertoSug(true); }}
              onFocus={() => setAbiertoSug(true)}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent focus:outline-none"
            />
          </label>
          {abiertoSug && sugerencias.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {sugerencias.map((s, i) => {
                const Icon = s.tipo === 'CIUDAD' ? MapPin : Building2;
                return (
                  <li
                    key={`${s.tipo}-${s.texto}`}
                    id={`${uid}-op-${i}`}
                    role="option"
                    aria-selected={i === indice}
                    onMouseDown={(e) => { e.preventDefault(); elegir(s); }}
                    onMouseEnter={() => setIndice(i)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${i === indice ? 'bg-brand-50 text-brand-700' : 'text-slate-700'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{s.texto}</span>
                    <span className="ml-auto text-xs text-slate-400">{s.tipo === 'CIUDAD' ? 'Destino' : 'Alojamiento'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Rango de fechas (calendario doble) */}
        <div className="relative" ref={refFechas}>
          <button
            type="button"
            onClick={() => setCalAbierto((v) => !v)}
            aria-expanded={calAbierto}
            aria-haspopup="dialog"
            className={`${campoCls} text-left ${fechas.desde ? 'text-slate-800' : 'text-slate-500'}`}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            {textoFechas}
          </button>
          {calAbierto && (
            <div
              role="dialog"
              aria-label="Elegir fechas"
              className="absolute right-0 z-30 mt-1 w-[min(92vw,44rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:left-0 md:right-auto"
            >
              <DateRangePicker value={fechas} onChange={setFechas} />
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setFechas({ desde: '', hasta: '' })}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Borrar fechas
                </button>
                <button
                  type="button"
                  onClick={() => setCalAbierto(false)}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar
        </button>
      </form>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {activo && (
        <button type="button" onClick={limpiar} className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          Limpiar búsqueda
        </button>
      )}
    </section>
  );
}
