const NOMBRE_RE = /^[\p{L}][\p{L} '\-]{1,59}$/u;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validarCampo(campo, valor, valores = {}) {
  const v = (valor ?? '').trim();
  switch (campo) {
    case 'nombre':
    case 'apellido': {
      const etiqueta = campo === 'nombre' ? 'El nombre' : 'El apellido';
      if (!v) return `${etiqueta} es obligatorio.`;
      if (!NOMBRE_RE.test(v)) return `${etiqueta} debe tener entre 2 y 60 letras, sin números.`;
      return '';
    }
    case 'email':
      if (!v) return 'El correo electrónico es obligatorio.';
      if (!EMAIL_RE.test(v)) return 'Ingresa un correo válido, por ejemplo nombre@dominio.com.';
      return '';
    case 'password':
      if (!valor) return 'La contraseña es obligatoria.';
      if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (valor.length > 72) return 'La contraseña no puede superar los 72 caracteres.';
      if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) return 'Incluye al menos una letra y un número.';
      return '';
    case 'confirmar':
      if (!valor) return 'Repite tu contraseña.';
      if (valor !== valores.password) return 'Las contraseñas no coinciden.';
      return '';
    default:
      return '';
  }
}

export function validarFormulario(campos, valores) {
  const errores = {};
  campos.forEach((c) => {
    const msg = validarCampo(c, valores[c], valores);
    if (msg) errores[c] = msg;
  });
  return errores;
}
