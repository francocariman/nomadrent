import logoPersonalizado from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-30 w-full border-t border-slate-800 bg-slate-900 text-slate-400">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-sm sm:px-6">
        <div className="flex items-center gap-2">
          <img src={logoPersonalizado} alt="NomadRent Logo" className="h-6 w-auto object-contain" />
          <span className="font-semibold text-white">NomadRent</span>
        </div>
        <p>© 2026 NomadRent. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}