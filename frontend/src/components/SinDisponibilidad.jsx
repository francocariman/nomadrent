import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarSearch } from 'lucide-react';
import { getAlternativas } from '../api.js';
import { formatCorto } from '../dates.js';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function textoDesplazamiento(dias) {
  const n = Math.abs(dias);
  return dias > 0 ? `${plural(n, 'día', 'días')} después de tu entrada` : `${plural(n, 'día', 'días')} antes de tu entrada`;
}

/**
 * Se muestra cuando la búsqueda por destino + fechas no devuelve resultados.
 * Si el destino existe, propone las fechas libres más cercanas (misma cantidad de noches).
 * Si no hay ninguna (o el destino no existe), muestra el mensaje genérico.
 */
export default function SinDisponibilidad({ busqueda, seleccion, onElegirFechas }) {
  const { destino, desde, hasta } = busqueda;
  const [alternativas, setAlternativas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    getAlternativas({ destino, desde, hasta }, seleccion)
      .then((r) => { if (!cancelado) setAlternativas(r); })
      .catch(() => { if (!cancelado) setAlternativas([]); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, [destino, desde, hasta, seleccion]);

  if (cargando) {
    return <p className="py-8 text-center text-slate-500">Buscando las fechas disponibles más cercanas…</p>;
  }

  if (alternativas.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        Ningún alojamiento coincide con los filtros elegidos. Prueba con otro destino, fechas o categorías.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5" role="status">
      <div className="flex items-start gap-3">
        <CalendarSearch className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-amber-900">
            No hay disponibilidad en “{destino}” del {formatCorto(desde)} al {formatCorto(hasta)}
          </h3>
          <p className="text-sm text-amber-800">
            Estas son las fechas libres más cercanas para una estadía de {plural(alternativas[0].noches, 'noche', 'noches')}:
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {alternativas.map((a) => (
          <li key={a.productoId} className="flex flex-col overflow-hidden rounded-xl border border-amber-100 bg-white">
            <div className="h-28 bg-slate-200">
              {a.imagen && <img src={a.imagen} alt={a.nombre} loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="truncate text-sm font-semibold text-slate-900">{a.nombre}</p>
              <p className="truncate text-xs text-slate-500">{a.ciudad}</p>
              <p className="mt-2 text-sm font-medium text-brand-700">
                Del {formatCorto(a.fechaInicio)} al {formatCorto(a.fechaFin)}
              </p>
              <p className="text-xs text-slate-500">{textoDesplazamiento(a.desplazamientoDias)}</p>
              <p className="mt-1 text-sm text-slate-700">
                USD {a.precio} / noche · <span className="font-semibold">USD {a.total.toFixed(2)}</span> total
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onElegirFechas({ destino, desde: a.fechaInicio, hasta: a.fechaFin })}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700"
                >
                  Buscar en esas fechas
                </button>
                <Link
                  to={`/producto/${a.productoId}`}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver alojamiento
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
