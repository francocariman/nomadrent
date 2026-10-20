import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, fromISO, hoyISO, toISO } from '../dates.js';

const SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function Mes({ base, value, bloqueadas, resaltar, hoy, onClick, esSeleccionable, puedeSerSalida }) {
  const anio = base.getFullYear();
  const mes = base.getMonth();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7; // semana inicia en lunes
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const titulo = base.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(<span key={`v${i}`} />);

  for (let d = 1; d <= diasMes; d++) {
    const iso = toISO(new Date(anio, mes, d));
    const pasado = iso < hoy;
    const ocupada = bloqueadas?.has(iso) ?? false;
    const esInicio = iso === value.desde;
    const esFin = iso === value.hasta;
    const enRango = value.desde && value.hasta && iso > value.desde && iso < value.hasta;
    const deshabilitada = pasado || !esSeleccionable(iso);

    let estilo;
    if (esInicio || esFin) estilo = 'bg-brand-600 font-semibold text-white';
    else if (enRango) estilo = 'bg-brand-100 text-brand-700';
    else if (pasado) estilo = 'text-slate-300';
    else if (ocupada) estilo = 'bg-red-100 text-red-400 line-through';
    else if (resaltar) estilo = 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100';
    else estilo = 'text-slate-700 hover:bg-slate-100';

    const estado = esInicio ? 'entrada' : esFin ? 'salida' : ocupada ? 'ocupada' : pasado ? 'pasada' : 'disponible';

    celdas.push(
      <button
        key={iso}
        type="button"
        disabled={deshabilitada}
        onClick={() => onClick(iso)}
        aria-label={`${d} de ${titulo}, ${estado}`}
        aria-pressed={esInicio || esFin}
        className={`flex h-10 w-full items-center justify-center rounded-md text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${estilo} ${
          deshabilitada ? 'cursor-not-allowed' : ''
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="min-w-0">
      <p className="mb-2 text-center text-sm font-semibold capitalize text-slate-800">{titulo}</p>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-slate-400" aria-hidden="true">
        {SEMANA.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">{celdas}</div>
    </div>
  );
}

/**
 * Calendario doble de selección de rango.
 * - value: { desde, hasta } (ISO)  ·  onChange(nuevoValue)
 * - bloqueadas: Set de noches ocupadas (modo disponibilidad)
 * - resaltarDisponibles: pinta de verde los días libres y muestra la leyenda
 * Modelo de noches: el día de salida no consume noche, por eso puede coincidir con una noche ocupada.
 */
export default function DateRangePicker({ value, onChange, bloqueadas = null, resaltarDisponibles = false }) {
  const hoy = hoyISO();
  const [base, setBase] = useState(() => {
    const ref = fromISO(value.desde || hoy);
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });
  const siguiente = new Date(base.getFullYear(), base.getMonth() + 1, 1);
  const mesActual = new Date(fromISO(hoy).getFullYear(), fromISO(hoy).getMonth(), 1);
  const puedeRetroceder = base > mesActual;

  const rangoLibre = useMemo(
    () => (a, b) => {
      if (!bloqueadas) return true;
      for (let d = a; d < b; d = addDays(d, 1)) if (bloqueadas.has(d)) return false;
      return true;
    },
    [bloqueadas]
  );

  // Eligiendo salida: un día es válido si todas las noches desde la entrada están libres
  const esperandoSalida = value.desde && !value.hasta;
  const puedeSerSalida = (iso) => esperandoSalida && iso > value.desde && rangoLibre(value.desde, iso);
  const esSeleccionable = (iso) => {
    if (iso < hoy) return false;
    if (!bloqueadas?.has(iso)) return true; // noche libre: sirve como entrada (o salida)
    return puedeSerSalida(iso); // noche ocupada: solo como día de salida
  };

  function click(iso) {
    const { desde, hasta } = value;
    if (!desde || hasta) return onChange({ desde: iso, hasta: '' });
    if (iso === desde) return onChange({ desde: '', hasta: '' });
    if (iso < desde) return onChange({ desde: iso, hasta: '' });
    if (rangoLibre(desde, iso)) return onChange({ desde, hasta: iso });
    return onChange({ desde: iso, hasta: '' }); // el rango cruza una fecha ocupada: empieza de nuevo
  }

  const props = { value, bloqueadas, resaltar: resaltarDisponibles, hoy, onClick: click, esSeleccionable, puedeSerSalida };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1))}
          disabled={!puedeRetroceder}
          aria-label="Mes anterior"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() + 1, 1))}
          aria-label="Mes siguiente"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dos meses lado a lado (apilados en pantallas chicas) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Mes base={base} {...props} />
        <Mes base={siguiente} {...props} />
      </div>

      {resaltarDisponibles && (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600" aria-label="Leyenda del calendario">
          <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-emerald-100 ring-1 ring-emerald-300" />Disponible</li>
          <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-red-100 ring-1 ring-red-300" />Ocupada</li>
          <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-brand-600" />Tu selección</li>
        </ul>
      )}
    </div>
  );
}
