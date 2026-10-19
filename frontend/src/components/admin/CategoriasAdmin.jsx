import { useCallback, useEffect, useState } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../api.js';
import ConfirmModal from '../ConfirmModal.jsx';
import Notice from '../Notice.jsx';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

function FormCategoria({ inicial, onCancel, onSaved }) {
  const editando = Boolean(inicial.id);
  const [v, setV] = useState({ titulo: inicial.titulo, descripcion: inicial.descripcion, imagen: inicial.imagen });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      if (editando) await updateCategoria(inicial.id, v);
      else await createCategoria(v);
      onSaved(editando ? 'Categoría actualizada.' : 'Categoría creada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">{editando ? 'Editar categoría' : 'Agregar categoría'}</h3>
      <Notice>{error}</Notice>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Título</span>
        <input required maxLength={80} value={v.titulo} onChange={set('titulo')} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Descripción</span>
        <textarea required rows={3} maxLength={500} value={v.descripcion} onChange={set('descripcion')} className={inputCls} />
      </label>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Imagen representativa (URL)</span>
          <input required type="url" placeholder="https://…" value={v.imagen} onChange={set('imagen')} className={inputCls} />
        </label>
        {v.imagen && (
          <img src={v.imagen} alt="Vista previa" className="h-20 w-32 rounded-lg bg-slate-200 object-cover" />
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
          {enviando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function CategoriasAdmin() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setItems(await getCategorias());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function confirmarEliminar() {
    setEliminando(true);
    try {
      await deleteCategoria(aEliminar.id);
      setAviso(`Se eliminó "${aEliminar.titulo}".`);
      setAEliminar(null);
      await cargar();
    } catch (e) {
      setError(e.message); // ej: la categoría tiene productos
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Categorías</h2>
        {!form && (
          <button
            type="button"
            onClick={() => { setAviso(''); setForm({ titulo: '', descripcion: '', imagen: '' }); }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Agregar categoría
          </button>
        )}
      </div>

      <Notice tipo="ok">{aviso}</Notice>
      <Notice>{error}</Notice>

      {form && (
        <FormCategoria
          key={form.id ?? 'nueva'}
          inicial={form}
          onCancel={() => setForm(null)}
          onSaved={(msg) => { setAviso(msg); setForm(null); cargar(); }}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="w-20 px-4 py-3 font-medium">Imagen</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="w-24 px-4 py-3 font-medium">Productos</th>
              <th className="w-48 px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>}
            {!cargando && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No hay categorías. Agrega la primera.</td></tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><img src={c.imagen} alt="" className="h-10 w-14 rounded bg-slate-200 object-cover" /></td>
                <td className="px-4 py-3 font-medium text-slate-900">{c.titulo}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600">{c.descripcion}</td>
                <td className="px-4 py-3 text-slate-600">{c.cantidadProductos}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setAviso(''); setForm({ ...c }); }}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAEliminar(c)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aEliminar && (
        <ConfirmModal titulo="¿Eliminar esta categoría?" cargando={eliminando}
          onCancel={() => setAEliminar(null)} onConfirm={confirmarEliminar}>
          Vas a eliminar <strong>{aEliminar.titulo}</strong>. Solo es posible si ningún producto la usa.
        </ConfirmModal>
      )}
    </div>
  );
}
