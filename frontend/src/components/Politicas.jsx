import { CalendarX, ScrollText, ShieldCheck } from 'lucide-react';

const SECCIONES = [
  { clave: 'normas', titulo: 'Normas de la casa', Icon: ScrollText },
  { clave: 'saludSeguridad', titulo: 'Salud y seguridad', Icon: ShieldCheck },
  { clave: 'cancelacion', titulo: 'Cancelación', Icon: CalendarX },
];

const lineas = (texto) => (texto ?? '').split('\n').map((l) => l.trim()).filter(Boolean);

/** Bloque a ancho completo, título subrayado y tres columnas (una por política). */
export default function Politicas({ politicas }) {
  return (
    <section aria-label="Políticas del alojamiento" className="w-full rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="w-full border-b border-brand-100 pb-3 text-lg font-semibold text-slate-900 underline decoration-brand-500 decoration-2 underline-offset-8">
        Qué debes saber
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {SECCIONES.map(({ clave, titulo, Icon }) => {
          const items = lineas(politicas?.[clave]);
          return (
            <div key={clave}>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                {titulo}
              </h3>
              {items.length ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600 marker:text-brand-500">
                  {items.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Sin información cargada.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
