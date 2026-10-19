import { useEffect, useState } from 'react';
import { getRandomProductos, getProductos } from '../api.js';
import ProductCard from './ProductCard.jsx';
import Pagination from './Pagination.jsx';

const CATEGORIAS = [
  { nombre: 'Departamentos', emoji: '🏢' },
  { nombre: 'Casas', emoji: '🏡' },
  { nombre: 'Cabañas', emoji: '🛖' },
  { nombre: 'Hoteles', emoji: '🏨' },
  { nombre: 'Hostels', emoji: '🛏️' },
];

function Buscador() {
  return (
    <section aria-label="Buscador" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-slate-900">¿Dónde quieres quedarte?</h2>
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          type="text"
          placeholder="Ciudad o alojamiento"
          aria-label="Ciudad o alojamiento"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          type="date"
          aria-label="Desde"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          type="date"
          aria-label="Hasta"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Buscar
        </button>
      </form>
    </section>
  );
}

function Categorias() {
  return (
    <section aria-label="Categorías">
      <h2 className="mb-3 text-xl font-bold text-slate-900">Categorías</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIAS.map((c) => (
          <button
            key={c.nombre}
            type="button"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
            {c.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}

function Estado({ cargando, error, vacio }) {
  if (cargando) return <p className="py-8 text-center text-slate-500">Cargando alojamientos…</p>;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (vacio) return <p className="py-8 text-center text-slate-500">Aún no hay alojamientos publicados.</p>;
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
      <Estado cargando={cargando} error={error} vacio={!cargando && !error && productos.length === 0} />
      {/* Máximo 2 columnas × 5 filas = 10 productos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {productos.slice(0, 10).map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}

function Catalogo() {
  const [data, setData] = useState({ content: [], page: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCargando(true);
    getProductos(page)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [page]);

  return (
    <section aria-label="Catálogo completo">
      <h2 className="mb-3 text-xl font-bold text-slate-900">Todos los alojamientos</h2>
      <Estado cargando={cargando} error={error} vacio={!cargando && !error && data.content.length === 0} />
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
  return (
    <div className="space-y-10">
      <Buscador />
      <Categorias />
      <Recomendaciones />
      <Catalogo />
    </div>
  );
}
