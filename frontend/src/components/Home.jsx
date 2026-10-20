import { useEffect, useState } from 'react';
import { getRandomProductos, getProductos, getCategorias } from '../api.js';
import ProductCard from './ProductCard.jsx';
import Pagination from './Pagination.jsx';
import BuscadorAvanzado from './BuscadorAvanzado.jsx';
import SinDisponibilidad from './SinDisponibilidad.jsx';
import { formatCorto } from '../dates.js';

/** Sección de categorías: selección múltiple que filtra el catálogo. */
function Categorias({ categorias, seleccion, onToggle, onLimpiar, cargando, error }) {
  return (
    <section aria-label="Categorías">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Categorías</h2>
        {seleccion.length > 0 && (
          <button
            type="button"
            onClick={onLimpiar}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Quitar filtros ({seleccion.length})
          </button>
        )}
      </div>

      {cargando && <p className="text-sm text-slate-500">Cargando categorías…</p>}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categorias.map((c) => {
          const activa = seleccion.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={activa}
              onClick={() => onToggle(c.id)}
              title={c.descripcion}
              className={`group relative h-28 overflow-hidden rounded-xl border-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                activa ? 'border-brand-600' : 'border-transparent'
              }`}
            >
              <img src={c.imagen} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className={`absolute inset-0 ${activa ? 'bg-brand-700/70' : 'bg-slate-900/50 group-hover:bg-slate-900/40'}`} />
              <span className="relative flex h-full flex-col justify-end p-3 text-white">
                <span className="text-sm font-semibold leading-tight">{c.titulo}</span>
                <span className="text-xs text-white/85">
                  {c.cantidadProductos} {c.cantidadProductos === 1 ? 'alojamiento' : 'alojamientos'}
                </span>
              </span>
              {activa && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-700" aria-hidden="true">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 10.5 4 4 8-9" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Estado({ cargando, error, vacio, mensajeVacio }) {
  if (cargando) return <p className="py-8 text-center text-slate-500">Cargando alojamientos…</p>;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (vacio) return <p className="py-8 text-center text-slate-500">{mensajeVacio}</p>;
  return null;
}

function Recomendaciones() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRandomProductos()
      .then(setProductos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section aria-label="Recomendaciones">
      <h2 className="mb-3 text-xl font-bold text-slate-900">Recomendaciones</h2>
      <Estado cargando={cargando} error={error} vacio={!cargando && !error && productos.length === 0}
        mensajeVacio="Aún no hay alojamientos publicados." />
      {/* Máximo 2 columnas × 5 filas = 10 productos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {productos.slice(0, 10).map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}

function resumenBusqueda({ destino, desde, hasta }) {
  const partes = [];
  if (destino) partes.push(`en “${destino}”`);
  if (desde && hasta) partes.push(`del ${formatCorto(desde)} al ${formatCorto(hasta)}`);
  return partes.length ? ` ${partes.join(' ')}` : ' con tu filtro';
}

/** Se remonta (key) cada vez que cambia el filtro, así vuelve a la página 1. */
function Catalogo({ seleccion, busqueda, totalCatalogo, onElegirFechas }) {
  const [data, setData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const buscando = Boolean(busqueda.destino || (busqueda.desde && busqueda.hasta));
  const filtrado = seleccion.length > 0 || buscando;
  const sinVacio = !cargando && !error && data.content.length === 0;
  // Destino + fechas sin resultados: se sugieren las fechas libres más cercanas
  const sugerirFechas = sinVacio && Boolean(busqueda.destino && busqueda.desde && busqueda.hasta);

  useEffect(() => {
    setCargando(true);
    getProductos(page, seleccion, busqueda)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [page, seleccion, busqueda]);

  return (
    <section aria-label="Catálogo completo">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900">{buscando ? 'Resultados de tu búsqueda' : 'Todos los alojamientos'}</h2>
        {!cargando && !error && (
          <p className="text-sm text-slate-500" aria-live="polite">
            {filtrado
              ? `${data.totalElements} de ${totalCatalogo} alojamientos coinciden${resumenBusqueda(busqueda)}`
              : `${data.totalElements} alojamientos`}
          </p>
        )}
      </div>
      {sugerirFechas ? (
        <SinDisponibilidad busqueda={busqueda} seleccion={seleccion} onElegirFechas={onElegirFechas} />
      ) : (
        <Estado cargando={cargando} error={error}
          vacio={sinVacio}
          mensajeVacio={filtrado ? 'Ningún alojamiento coincide con los filtros elegidos. Prueba con otro destino, fechas o categorías.' : 'Aún no hay alojamientos publicados.'} />
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.content.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={data.totalPages}
        onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </section>
  );
}

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [cargandoCat, setCargandoCat] = useState(true);
  const [errorCat, setErrorCat] = useState('');
  const [seleccion, setSeleccion] = useState([]);
  const [busqueda, setBusqueda] = useState({ destino: '', desde: '', hasta: '' });
  const busquedaActiva = Boolean(busqueda.destino || (busqueda.desde && busqueda.hasta));

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch((e) => setErrorCat(e.message))
      .finally(() => setCargandoCat(false));
  }, []);

  const toggle = (id) =>
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const totalCatalogo = categorias.reduce((acc, c) => acc + c.cantidadProductos, 0);

  const catalogo = (
    // Se remonta al cambiar filtros o búsqueda: vuelve a la página 1
    <Catalogo
      key={`${seleccion.join(',')}|${busqueda.destino}|${busqueda.desde}|${busqueda.hasta}`}
      seleccion={seleccion}
      busqueda={busqueda}
      totalCatalogo={totalCatalogo}
      onElegirFechas={setBusqueda}
    />
  );
  const categoriasEl = (
    <Categorias
      categorias={categorias}
      seleccion={seleccion}
      onToggle={toggle}
      onLimpiar={() => setSeleccion([])}
      cargando={cargandoCat}
      error={errorCat}
    />
  );

  return (
    <div className="space-y-10">
      <BuscadorAvanzado
        activo={busquedaActiva}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        onLimpiar={() => setBusqueda({ destino: '', desde: '', hasta: '' })}
      />

      {busquedaActiva ? (
        <>
          {/* Con búsqueda activa: sin recomendaciones, los resultados quedan justo bajo el buscador */}
          {catalogo}
          {categoriasEl}
        </>
      ) : (
        <>
          {categoriasEl}
          <Recomendaciones />
          {catalogo}
        </>
      )}
    </div>
  );
}
