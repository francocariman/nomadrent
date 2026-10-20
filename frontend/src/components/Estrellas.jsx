import { useState } from 'react';
import { Star } from 'lucide-react';

/** Estrellas de solo lectura; admite valores decimales (ej. 4.3) con relleno parcial. */
export function Estrellas({ valor = 0, className = 'h-4 w-4' }) {
  const pct = (Math.max(0, Math.min(5, valor)) / 5) * 100;
  const cinco = (cls) =>
    [0, 1, 2, 3, 4].map((i) => <Star key={i} className={`${className} shrink-0 ${cls}`} fill="currentColor" strokeWidth={1} />);
  return (
    <span className="relative inline-flex" role="img" aria-label={`${valor} de 5 estrellas`}>
      <span className="flex text-slate-300">{cinco('')}</span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
        {cinco('')}
      </span>
    </span>
  );
}

/** Resumen compacto para tarjetas y encabezados: ★ 4.6 (12 reseñas). */
export function ResumenPuntuacion({ media, total, className = '' }) {
  if (!total) return <span className={`text-xs text-slate-400 ${className}`}>Sin reseñas</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-slate-600 ${className}`}>
      <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1} aria-hidden="true" />
      <span className="font-semibold text-slate-800">{media.toFixed(1)}</span>
      <span className="text-slate-500">({total} {total === 1 ? 'reseña' : 'reseñas'})</span>
    </span>
  );
}

/** Selector interactivo de 1 a 5 estrellas. */
export function EntradaEstrellas({ valor, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const activo = hover || valor;
  return (
    <div role="radiogroup" aria-label="Puntuación" className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
        >
          <Star
            className={`h-8 w-8 transition-colors ${n <= activo ? 'text-amber-400' : 'text-slate-300'}`}
            fill="currentColor"
            strokeWidth={1}
          />
        </button>
      ))}
    </div>
  );
}
