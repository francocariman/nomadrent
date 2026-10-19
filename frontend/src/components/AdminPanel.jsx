import { useCallback, useEffect, useState } from 'react';
import { getProductos, deleteProducto } from '../api.js';
import AddProductForm from './AddProductForm.jsx';
import Pagination from './Pagination.jsx';

/** Desktop = ancho >= 1024px (breakpoint `lg` de Tailwind). */
function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function ConfirmModal({ producto, onCancel, onConfirm, eliminando }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">¿Eliminar este producto?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Vas a eliminar <strong>{producto.nombre}</strong> (ID {producto.id}). Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={eliminando}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const isDesktop = useIsDesktop();
  const [vista, setVista] = useState('lista'); // 'lista' | 'agregar'
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async (p) => {
    setCargando(true);
    try {
      const d = await getProductos(p);
      // Si la página quedó vacía tras eliminar, retrocede una
      if (d.content.length === 0 && p > 0) return setPage(p - 1);
      setData(d);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (isDesktop && vista === 'lista') cargar(page);
  }, [isDesktop, vista, page, cargar]);

  async function confirmarEliminar() {
    setEliminando(true);
    try {
      await deleteProducto(aEliminar.id);
      setAviso(`Se eliminó "${aEliminar.nombre}".`);
      setAEliminar(null);
      await cargar(page);
    } catch (e) {
      setError(e.message);
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  if (!isDesktop) {
    return (
      <div role="alert" className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
        <p className="text-lg font-semibold text-amber-900">Administración no disponible</p>
        <p className="mt-2 text-sm text-amber-800">
          El panel de administración no está disponible en dispositivos móviles. Ingresa desde una computadora.
        </p>
      </div>
    );
  }

  if (vista === 'agregar') {
    return (
      <div className="mx-auto max-w-3xl">
        <AddProductForm
          onCancel={() => setVista('lista')}
          onCreated={() => { setAviso('Producto creado correctamente.'); setPage(0); setVista('lista'); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Lista de productos</h1>
        <button
          type="button"
          onClick={() => { setAviso(''); setVista('agregar'); }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Agregar producto
        </button>
      </div>

      {aviso && <p className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{aviso}</p>}
      {error && <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="w-24 px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="w-40 px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>
            )}
            {!cargando && data.content.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No hay productos. Agrega el primero.</td></tr>
            )}
            {!cargando && data.content.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{p.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{p.nombre}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setAEliminar(p)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />

      {aEliminar && (
        <ConfirmModal
          producto={aEliminar}
          eliminando={eliminando}
          onCancel={() => setAEliminar(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </div>
  );
}
