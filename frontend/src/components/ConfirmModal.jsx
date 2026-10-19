export default function ConfirmModal({ titulo, children, confirmLabel = 'Sí, eliminar', cargando, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {cargando ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
