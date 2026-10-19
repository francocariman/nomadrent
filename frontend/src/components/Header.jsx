import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logoPersonalizado from '../assets/logo.png'; // 📌 Importamos tu logo desde assets

export function iniciales(user) {
  const a = user?.nombre?.trim()?.[0] ?? '';
  const b = user?.apellido?.trim()?.[0] ?? '';
  return (a + b).toUpperCase();
}

function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    const cerrarEsc = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', cerrarFuera);
    document.addEventListener('keydown', cerrarEsc);
    return () => {
      document.removeEventListener('mousedown', cerrarFuera);
      document.removeEventListener('keydown', cerrarEsc);
    };
  }, [abierto]);

  function cerrarSesion() {
    setAbierto(false);
    logout();
    navigate('/'); // vuelve al flujo anónimo
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:pr-3"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {iniciales(user)}
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-200 sm:block">
          {user.nombre} {user.apellido}
        </span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-400" fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5-1.1-1.1L10 9.8 6.6 6.4z" />
        </svg>
      </button>

      {abierto && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl text-white">
          <div className="border-b border-slate-800 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{user.nombre} {user.apellido}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          {isAdmin && (
            <Link
              to="/administracion"
              role="menuitem"
              onClick={() => setAbierto(false)}
              className="hidden px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white lg:block"
            >
              Administración
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={cerrarSesion}
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="NomadRent, ir al inicio">
          {/* Logo reemplazando la N gigante */}
          <img src={logoPersonalizado} alt="NomadRent Logo" className="h-10 w-auto object-contain" />
          <div className="min-w-0 leading-tight">
            <span className="block text-lg font-bold tracking-tight text-white">NomadRent</span>
            <span className="hidden truncate text-xs text-slate-400 sm:block">Tu próximo hogar, donde sea.</span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/registro"
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Crear cuenta
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}