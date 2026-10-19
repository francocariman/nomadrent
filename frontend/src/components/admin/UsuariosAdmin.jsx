import { useCallback, useEffect, useState } from 'react';
import { getUsuarios, setRolUsuario } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Notice from '../Notice.jsx';

export default function UsuariosAdmin() {
  const { user: yo } = useAuth();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [procesando, setProcesando] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setItems(await getUsuarios());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function cambiarRol(u) {
    const nuevo = u.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    setProcesando(u.id);
    setAviso('');
    try {
      await setRolUsuario(u.id, nuevo);
      setError('');
      setAviso(nuevo === 'ADMIN'
        ? `${u.nombre} ${u.apellido} ahora es administrador.`
        : `Se quitó el permiso de administrador a ${u.nombre} ${u.apellido}.`);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Usuarios registrados</h2>
      <Notice tipo="ok">{aviso}</Notice>
      <Notice>{error}</Notice>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="w-20 px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="w-32 px-4 py-3 font-medium">Rol</th>
              <th className="w-56 px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>}
            {items.map((u) => {
              const esYo = u.email === yo?.email;
              const admin = u.rol === 'ADMIN';
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.nombre} {u.apellido} {esYo && <span className="ml-1 text-xs font-normal text-slate-500">(tú)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${admin ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                      {admin ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={esYo || procesando === u.id}
                      onClick={() => cambiarRol(u)}
                      title={esYo ? 'No puedes modificar tu propio rol' : undefined}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {admin ? 'Quitar administrador' : 'Hacer administrador'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
