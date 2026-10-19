import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validarCampo, validarFormulario } from '../validation.js';
import FormField from './FormField.jsx';
import Notice from './Notice.jsx';

const CAMPOS = ['nombre', 'apellido', 'email', 'password', 'confirmar'];

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [valores, setValores] = useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [mostrar, setMostrar] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => {
    const { name, value } = e.target;
    const nuevos = { ...valores, [name]: value };
    setValores(nuevos);
    // Si el campo ya mostraba error, se revalida mientras el usuario corrige
    setErrores((er) => {
      const next = { ...er };
      if (er[name]) next[name] = validarCampo(name, value, nuevos);
      if (name === 'password' && er.confirmar) next.confirmar = validarCampo('confirmar', nuevos.confirmar, nuevos);
      return next;
    });
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrores((er) => ({ ...er, [name]: validarCampo(name, value, valores) }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setErrorServidor('');
    const errs = validarFormulario(CAMPOS, valores);
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setEnviando(true);
    try {
      await register({
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        email: valores.email.trim(),
        password: valores.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setErrorServidor(err.message); // ej: correo ya registrado
    } finally {
      setEnviando(false);
    }
  }

  const campo = (name, label, extra = {}) => (
    <FormField
      label={label}
      name={name}
      value={valores[name]}
      onChange={onChange}
      onBlur={onBlur}
      error={errores[name]}
      {...extra}
    />
  );

  return (
    <div className="mx-auto mt-6 w-full max-w-lg">
      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">Regístrate para acceder a funcionalidades extras.</p>
        </div>

        <Notice>{errorServidor}</Notice>

        <div className="grid gap-4 sm:grid-cols-2">
          {campo('nombre', 'Nombre', { type: 'text', autoComplete: 'given-name' })}
          {campo('apellido', 'Apellido', { type: 'text', autoComplete: 'family-name' })}
        </div>
        {campo('email', 'Correo electrónico', { type: 'email', autoComplete: 'email' })}
        {campo('password', 'Contraseña', {
          type: mostrar ? 'text' : 'password',
          autoComplete: 'new-password',
          hint: 'Mínimo 8 caracteres, con al menos una letra y un número.',
        })}
        {campo('confirmar', 'Repetir contraseña', {
          type: mostrar ? 'text' : 'password',
          autoComplete: 'new-password',
        })}

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} />
          Mostrar contraseñas
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}
