const ESTILOS = {
  error: 'bg-red-50 text-red-700',
  ok: 'bg-emerald-50 text-emerald-800',
  info: 'bg-sky-50 text-sky-800',
};

export default function Notice({ tipo = 'error', children }) {
  if (!children) return null;
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={`mb-3 rounded-lg px-4 py-3 text-sm ${ESTILOS[tipo]}`}>
      {children}
    </p>
  );
}
