import { Link } from 'react-router-dom';

export default function ProductCard({ producto }) {
  const { id, nombre, categoria, ciudad, precio, imagenes } = producto;
  return (
    <Link
      to={`/producto/${id}`}
      className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="h-32 w-36 shrink-0 bg-slate-200 sm:h-36 sm:w-44">
        {imagenes?.[0] && (
          <img src={imagenes[0]} alt={nombre} loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-xs font-medium text-brand-600">{categoria}</p>
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-brand-700">{nombre}</h3>
          <p className="truncate text-sm text-slate-500">{ciudad}</p>
        </div>
        <p className="text-sm text-slate-700">
          <span className="text-lg font-bold text-slate-900">USD {precio}</span> / noche
        </p>
      </div>
    </Link>
  );
}
