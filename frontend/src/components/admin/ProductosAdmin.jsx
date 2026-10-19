import { useCallback, useEffect, useState } from 'react';
import { getProductos, deleteProducto } from '../../api.js';
import AddProductForm from '../AddProductForm.jsx';
import Pagination from '../Pagination.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import Notice from '../Notice.jsx';

export default function ProductosAdmin() {
  const [vista, setVista] = useState('lista'); // 'lista' | 'form'
  const [editando, setEditando] = useState(null);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async (p) => {
    setCargando(true);
    try {
      const d = await getProductos(p);
      if (d.content.length === 0 && p > 0) return setPage(p - 1); // página vacía tras eliminar
      setData(d);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (vista === 'lista') cargar(page);
  }, [vista, page, cargar]);

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

  if (vista === 'form') {
    return (
      <div className="mx-auto max-w-3xl">
        <AddProductForm
          producto={editando}
          onCancel={() => setVista('lista')}
          onSaved={(msg) => { setAviso(msg); if (!editando) setPage(0); setVista('lista'); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Lista de productos</h2>
        <button
          type="button"
          onClick={() => { setAviso(''); setEditando(null); setVista('form'); }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Agregar producto
        </button>
      </div>

      <Notice tipo="ok">{aviso}</Notice>
      <Notice>{error}</Notice>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="w-20 px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="w-56 px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>}
            {!cargando && data.content.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No hay productos. Agrega el primero.</td></tr>
            )}
            {!cargando && data.content.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{p.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{p.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{p.categoria}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setAviso(''); setEditando(p); setVista('form'); }}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAEliminar(p)}
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

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />

      {aEliminar && (
        <ConfirmModal titulo="¿Eliminar este producto?" cargando={eliminando}
          onCancel={() => setAEliminar(null)} onConfirm={confirmarEliminar}>
          Vas a eliminar <strong>{aEliminar.nombre}</strong> (ID {aEliminar.id}). Esta acción no se puede deshacer.
        </ConfirmModal>
      )}
    </div>
  );
}
