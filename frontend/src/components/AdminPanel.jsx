import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProductosAdmin from './admin/ProductosAdmin.jsx';
import CaracteristicasAdmin from './admin/CaracteristicasAdmin.jsx';
import CategoriasAdmin from './admin/CategoriasAdmin.jsx';
import UsuariosAdmin from './admin/UsuariosAdmin.jsx';

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

const TABS = [
  { id: 'productos', label: 'Productos', Vista: ProductosAdmin },
  { id: 'caracteristicas', label: 'Administrar características', Vista: CaracteristicasAdmin },
  { id: 'categorias', label: 'Categorías', Vista: CategoriasAdmin },
  { id: 'usuarios', label: 'Usuarios', Vista: UsuariosAdmin },
];

function Aviso({ titulo, children, tono = 'amber' }) {
  const tonos = {
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    slate: 'border-slate-200 bg-white text-slate-800',
  };
  return (
    <div role="alert" className={`mx-auto mt-10 max-w-md rounded-2xl border p-6 text-center ${tonos[tono]}`}>
      <p className="text-lg font-semibold">{titulo}</p>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

export default function AdminPanel() {
  const isDesktop = useIsDesktop();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState('productos');

  if (!isDesktop) {
    return (
      <Aviso titulo="Administración no disponible">
        El panel de administración no está disponible en dispositivos móviles. Ingresa desde una computadora.
      </Aviso>
    );
  }

  if (!user) {
    return (
      <Aviso titulo="Inicia sesión para continuar" tono="slate">
        <p>Necesitas una cuenta de administrador para ver esta sección.</p>
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
      </Aviso>
    );
  }

  if (!isAdmin) {
    return (
      <Aviso titulo="Acceso restringido" tono="slate">
        Tu cuenta no tiene permisos de administrador.
      </Aviso>
    );
  }

  const Actual = TABS.find((t) => t.id === tab).Vista;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Administración</h1>
      <div role="tablist" aria-label="Secciones de administración" className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Actual />
    </div>
  );
}
