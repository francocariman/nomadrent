import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormField from './FormField.jsx';
import Notice from './Notice.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from ?? '/';

  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => {
    setValores((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrores((er) => ({ ...er, [e.target.name]: '' }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setErrorServidor('');
    const errs = {};
    if (!valores.email.trim()) errs.email = 'Ingresa tu correo electrónico.';
    if (!valores.password) errs.password = 'Ingresa tu contraseña.';
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setEnviando(true);
    try {
      await login(valores.email.trim(), valores.password);
      navigate(destino, { replace: true });
    } catch (err) {
      setErrorServidor(err.message); // mensaje claro del backend (credenciales incorrectas)
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-md">
      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Accede para ver tu información y reservar más fácil.</p>
        </div>

        <Notice>{errorServidor}</Notice>

        <FormField label="Correo electrónico" name="email" type="email" autoComplete="email"
          value={valores.email} onChange={onChange} error={errores.email} />
        <FormField label="Contraseña" name="password" type="password" autoComplete="current-password"
          value={valores.password} onChange={onChange} error={errores.password} />

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-brand-600 hover:text-brand-700">Crear cuenta</Link>
        </p>
      </form>
    </div>
  );
}
