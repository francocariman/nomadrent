const API = '/api';
export const SESSION_KEY = 'nomadrent.session';
export const EVENTO_SESION_EXPIRADA = 'nomadrent:sesion-expirada';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))?.token ?? null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let mensaje = 'Ocurrió un error inesperado. Intenta nuevamente.';
    try {
      const data = await res.json();
      if (data?.mensaje) mensaje = data.mensaje;
    } catch { /* sin cuerpo JSON */ }
    // Token vencido o inválido: se avisa a la app para cerrar la sesión local
    if (res.status === 401 && token) window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    const err = new Error(mensaje);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

// ---- Auth
export const login = (data) => request('/auth/login', { method: 'POST', body: data });
export const register = (data) => request('/auth/register', { method: 'POST', body: data });

// ---- Productos
export const getRandomProductos = () => request('/productos/random');
export const getProductos = (page = 0, categoriaIds = []) => {
  const params = new URLSearchParams({ page });
  if (categoriaIds.length) params.set('categorias', categoriaIds.join(','));
  return request(`/productos?${params}`);
};
export const getProducto = (id) => request(`/productos/${id}`);
export const createProducto = (data) => request('/productos', { method: 'POST', body: data });
export const updateProducto = (id, data) => request(`/productos/${id}`, { method: 'PUT', body: data });
export const deleteProducto = (id) => request(`/productos/${id}`, { method: 'DELETE' });

// ---- Características
export const getCaracteristicas = () => request('/caracteristicas');
export const createCaracteristica = (data) => request('/caracteristicas', { method: 'POST', body: data });
export const updateCaracteristica = (id, data) => request(`/caracteristicas/${id}`, { method: 'PUT', body: data });
export const deleteCaracteristica = (id) => request(`/caracteristicas/${id}`, { method: 'DELETE' });

// ---- Categorías
export const getCategorias = () => request('/categorias');
export const createCategoria = (data) => request('/categorias', { method: 'POST', body: data });
export const updateCategoria = (id, data) => request(`/categorias/${id}`, { method: 'PUT', body: data });
export const deleteCategoria = (id) => request(`/categorias/${id}`, { method: 'DELETE' });

// ---- Usuarios (solo ADMIN)
export const getUsuarios = () => request('/usuarios');
export const setRolUsuario = (id, rol) => request(`/usuarios/${id}/rol`, { method: 'PATCH', body: { rol } });
