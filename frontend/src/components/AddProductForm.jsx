import { useEffect, useState } from 'react';
import { createProducto, updateProducto, getCategorias, getCaracteristicas } from '../api.js';
import { Icono } from '../icons.jsx';
import Notice from './Notice.jsx';

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

/** Sirve para "Registrar producto" (sin `producto`) y "Editar producto" (con `producto`). */
export default function AddProductForm({ producto = null, onCancel, onSaved }) {
  const editando = Boolean(producto);

  const [categorias, setCategorias] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [cargandoOpc, setCargandoOpc] = useState(true);

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: producto?.categoriaId ?? '',
    ciudad: producto?.ciudad ?? '',
    precio: producto?.precio ?? '',
  });
  const [imagenes, setImagenes] = useState(producto?.imagenes?.length ? producto.imagenes : ['']);
  const [seleccionadas, setSeleccionadas] = useState(producto?.caracteristicas?.map((c) => c.id) ?? []);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([getCategorias(), getCaracteristicas()])
      .then(([cats, cars]) => {
        setCategorias(cats);
        setCaracteristicas(cars);
        // En alta, preselecciona la primera categoría disponible
        setForm((f) => (f.categoriaId === '' && cats.length ? { ...f, categoriaId: cats[0].id } : f));
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargandoOpc(false));
  }, []);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const setImagen = (i, v) => setImagenes((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const quitarImagen = (i) => setImagenes((arr) => (arr.length === 1 ? [''] : arr.filter((_, idx) => idx !== i)));
  const toggleCar = (id) =>
    setSeleccionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const urls = imagenes.map((u) => u.trim()).filter(Boolean);
    if (!form.categoriaId) return setError('Selecciona una categoría. Si no hay ninguna, créala primero en la pestaña Categorías.');
    if (urls.length === 0) return setError('Agrega al menos una URL de imagen.');
    if (!(Number(form.precio) > 0)) return setError('El precio debe ser mayor a 0.');

    const payload = {
      ...form,
      categoriaId: Number(form.categoriaId),
      precio: Number(form.precio),
      imagenes: urls,
      caracteristicaIds: seleccionadas,
    };

    setEnviando(true);
    try {
      if (editando) await updateProducto(producto.id, payload);
      else await createProducto(payload);
      onSaved(editando ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    } catch (err) {
      setError(err.message); // incluye el 400 por nombre duplicado
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{editando ? 'Editar producto' : 'Registrar producto'}</h2>

      <Notice>{error}</Notice>

      <Campo label="Nombre">
        <input required value={form.nombre} onChange={set('nombre')} className={inputCls} />
      </Campo>

      <Campo label="Descripción">
        <textarea required rows={4} value={form.descripcion} onChange={set('descripcion')} className={inputCls} />
      </Campo>

      <div className="grid gap-4 md:grid-cols-3">
        <Campo label="Categoría">
          <select
            required
            value={form.categoriaId}
            onChange={set('categoriaId')}
            disabled={cargandoOpc || categorias.length === 0}
            className={inputCls}
          >
            {categorias.length === 0 && <option value="">Sin categorías</option>}
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </Campo>
        <Campo label="Ciudad">
          <input required value={form.ciudad} onChange={set('ciudad')} className={inputCls} />
        </Campo>
        <Campo label="Precio por noche (USD)">
          <input required type="number" min="1" step="0.01" value={form.precio} onChange={set('precio')} className={inputCls} />
        </Campo>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Características</legend>
        {cargandoOpc ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : caracteristicas.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay características. Créalas en “Administrar características”.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {caracteristicas.map((c) => {
              const activa = seleccionadas.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    activa ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input type="checkbox" checked={activa} onChange={() => toggleCar(c.id)} className="sr-only" />
                  <Icono nombre={c.icono} className="h-4 w-4" />
                  {c.nombre}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

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
          disabled={enviando || cargandoOpc}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}
