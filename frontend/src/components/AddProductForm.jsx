import { useState } from 'react';
import { createProducto } from '../api.js';

export const CATEGORIAS = ['Departamento', 'Casa', 'Cabaña', 'Hotel', 'Hostel'];

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function AddProductForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', categoria: CATEGORIAS[0], ciudad: '', precio: '',
  });
  const [imagenes, setImagenes] = useState(['']);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const setImagen = (i, v) => setImagenes((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const quitarImagen = (i) => setImagenes((arr) => (arr.length === 1 ? [''] : arr.filter((_, idx) => idx !== i)));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const urls = imagenes.map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return setError('Agrega al menos una URL de imagen.');
    if (!(Number(form.precio) > 0)) return setError('El precio debe ser mayor a 0.');

    setEnviando(true);
    try {
      await createProducto({ ...form, precio: Number(form.precio), imagenes: urls });
      onCreated();
    } catch (err) {
      setError(err.message); // Incluye el 400 por nombre duplicado
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Agregar producto</h2>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Campo label="Nombre">
        <input required value={form.nombre} onChange={set('nombre')} className={inputCls} />
      </Campo>

      <Campo label="Descripción">
        <textarea required rows={4} value={form.descripcion} onChange={set('descripcion')} className={inputCls} />
      </Campo>

      <div className="grid gap-4 md:grid-cols-3">
        <Campo label="Categoría">
          <select value={form.categoria} onChange={set('categoria')} className={inputCls}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo label="Ciudad">
          <input required value={form.ciudad} onChange={set('ciudad')} className={inputCls} />
        </Campo>
        <Campo label="Precio por noche (USD)">
          <input required type="number" min="1" step="0.01" value={form.precio} onChange={set('precio')} className={inputCls} />
        </Campo>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">
          Imágenes (URLs) <span className="font-normal text-slate-500">· recomendado: 5</span>
        </legend>
        {imagenes.map((url, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              placeholder="https://…"
              aria-label={`URL de imagen ${i + 1}`}
              value={url}
              onChange={(e) => setImagen(i, e.target.value)}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => quitarImagen(i)}
              className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImagenes((arr) => [...arr, ''])}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          + Agregar otra imagen
        </button>
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {enviando ? 'Guardando…' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}
