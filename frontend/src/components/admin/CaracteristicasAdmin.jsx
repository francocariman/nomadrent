import { useCallback, useEffect, useState } from 'react';
import {
  getCaracteristicas, createCaracteristica, updateCaracteristica, deleteCaracteristica,
} from '../../api.js';
import { ICONOS, Icono } from '../../icons.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import Notice from '../Notice.jsx';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

function FormCaracteristica({ inicial, onCancel, onSaved }) {
  const editando = Boolean(inicial.id);
  const [nombre, setNombre] = useState(inicial.nombre);
  const [icono, setIcono] = useState(inicial.icono);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) return setError('El nombre es obligatorio.');
    if (!icono) return setError('Selecciona un ícono.');
    setEnviando(true);
    try {
      const body = { nombre: nombre.trim(), icono };
      if (editando) await updateCaracteristica(inicial.id, body);
      else await createCaracteristica(body);
      onSaved(editando ? 'Característica actualizada.' : 'Característica creada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">{editando ? 'Editar característica' : 'Añadir nueva característica'}</h3>
      <Notice>{error}</Notice>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Nombre</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} className={inputCls} placeholder="Ej: Wifi" />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Ícono asociado</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {Object.entries(ICONOS).map(([clave, { label }]) => (
            <button
              key={clave}
              type="button"
              aria-pressed={icono === clave}
              onClick={() => setIcono(clave)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs ${
                icono === clave ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icono nombre={clave} className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

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

export default function CaracteristicasAdmin() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(null); // null | { id?, nombre, icono }
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setItems(await getCaracteristicas());
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
      await deleteCaracteristica(aEliminar.id);
      setAviso(`Se eliminó "${aEliminar.nombre}".`);
      setAEliminar(null);
      await cargar();
    } catch (e) {
      setError(e.message);
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Características registradas</h2>
        {!form && (
          <button
            type="button"
            onClick={() => { setAviso(''); setForm({ nombre: '', icono: '' }); }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Añadir nueva
          </button>
        )}
      </div>

      <Notice tipo="ok">{aviso}</Notice>
      <Notice>{error}</Notice>

      {form && (
        <FormCaracteristica
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
              <th className="w-20 px-4 py-3 font-medium">ID</th>
              <th className="w-20 px-4 py-3 font-medium">Ícono</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="w-48 px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>}
            {!cargando && items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No hay características. Usa “Añadir nueva”.</td></tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{c.id}</td>
                <td className="px-4 py-3 text-brand-600"><Icono nombre={c.icono} /></td>
                <td className="px-4 py-3 font-medium text-slate-900">{c.nombre}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setAviso(''); setForm({ id: c.id, nombre: c.nombre, icono: c.icono }); }}
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
        <ConfirmModal titulo="¿Eliminar esta característica?" cargando={eliminando}
          onCancel={() => setAEliminar(null)} onConfirm={confirmarEliminar}>
          Vas a eliminar <strong>{aEliminar.nombre}</strong>. Se quitará también de todos los productos que la tengan asociada.
        </ConfirmModal>
      )}
    </div>
  );
}
