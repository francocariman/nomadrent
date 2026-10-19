import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProducto } from '../api.js';

function Galeria({ imagenes, nombre }) {
  const [abierta, setAbierta] = useState(false);
  const slots = Array.from({ length: 5 }, (_, i) => imagenes[i] ?? null);

  const Img = ({ src, alt, className }) =>
    src ? (
      <img src={src} alt={alt} className={`h-full w-full object-cover ${className ?? ''}`} />
    ) : (
      <div className={`flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-400 ${className ?? ''}`}>
        Sin imagen
      </div>
    );

  return (
    <>
      <div className="relative grid gap-2 overflow-hidden rounded-2xl md:h-[26rem] md:grid-cols-2">
        <div className="h-64 md:h-full">
          <Img src={slots[0]} alt={`${nombre} — imagen principal`} />
        </div>
        <div className="grid h-64 grid-cols-2 grid-rows-2 gap-2 md:h-full">
          {slots.slice(1).map((src, i) => (
            <div key={i} className="overflow-hidden">
              <Img src={src} alt={`${nombre} — imagen ${i + 2}`} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="absolute bottom-3 right-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Ver más
        </button>
      </div>

      {abierta && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
          onClick={() => setAbierta(false)}
        >
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Todas las imágenes ({imagenes.length})</h3>
              <button
                type="button"
                onClick={() => setAbierta(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {imagenes.map((src, i) => (
                <img key={i} src={src} alt={`${nombre} — imagen ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    getProducto(id)
      .then((p) => { setProducto(p); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          {producto && <p className="text-xs font-medium text-brand-600">{producto.categoria}</p>}
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {producto ? producto.nombre : 'Detalle del alojamiento'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      {cargando && <p className="py-12 text-center text-slate-500">Cargando…</p>}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {producto && (
        <div className="space-y-6">
          <Galeria imagenes={producto.imagenes} nombre={producto.nombre} />
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">{producto.descripcion}</p>
            </section>
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{producto.ciudad}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                USD {producto.precio} <span className="text-sm font-normal text-slate-500">/ noche</span>
              </p>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
