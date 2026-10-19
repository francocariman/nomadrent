import { Link } from 'react-router-dom';
import logoPersonalizado from '../assets/logo.png'; // Asegurate de que la ruta a tu logo sea correcta

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="NomadRent, ir al inicio">
          {/* Logo blanco resaltado sobre el fondo oscuro */}
          <img src={logoPersonalizado} alt="NomadRent Logo" className="h-12 w-auto object-contain" />
          <div className="min-w-0 leading-tight">
            <span className="block text-lg font-bold tracking-tight text-white">NomadRent</span>
            <span className="hidden truncate text-xs text-slate-400 sm:block">Tu próximo hogar, donde sea.</span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          <Link
            to="/administracion"
            className="mr-1 hidden text-sm text-slate-300 hover:text-white lg:inline"
          >
            Administración
          </Link>
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Crear cuenta
          </button>
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Iniciar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}