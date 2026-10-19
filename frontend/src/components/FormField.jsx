export const inputCls =
  'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2';

export default function FormField({ label, name, error, hint, children, ...inputProps }) {
  const id = `campo-${name}`;
  const borde = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100';
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children ?? (
        <input
          id={id}
          name={name}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${inputCls} ${borde}`}
          {...inputProps}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
