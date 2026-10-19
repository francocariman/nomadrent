const BASE = '/api/productos';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let mensaje = 'Ocurrió un error inesperado. Intenta nuevamente.';
    try {
      const body = await res.json();
      if (body?.mensaje) mensaje = body.mensaje;
    } catch { /* respuesta sin cuerpo JSON */ }
    const err = new Error(mensaje);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const getRandomProductos = () => request(`${BASE}/random`);
export const getProductos = (page = 0) => request(`${BASE}?page=${page}`);
export const getProducto = (id) => request(`${BASE}/${id}`);
export const createProducto = (data) =>
  request(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
export const deleteProducto = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
