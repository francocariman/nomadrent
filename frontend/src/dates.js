// Fechas como cadenas ISO "YYYY-MM-DD" (sin zona horaria) para evitar desfasajes de un día.
const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const hoyISO = () => toISO(new Date());

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Noches entre dos fechas ISO (hasta - desde). */
export const diffDays = (desde, hasta) => Math.round((fromISO(hasta) - fromISO(desde)) / 86400000);

export const formatCorto = (iso) =>
  fromISO(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

export const formatLargo = (iso) =>
  fromISO(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatFechaHora = (isoDateTime) =>
  new Date(isoDateTime).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Expande rangos [desde, hasta) en un Set con cada noche ocupada. */
export function nochesOcupadas(rangos) {
  const set = new Set();
  rangos.forEach(({ desde, hasta }) => {
    for (let d = desde; d < hasta; d = addDays(d, 1)) set.add(d);
  });
  return set;
}
