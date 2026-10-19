import {
  Wifi, Tv, Snowflake, PawPrint, Car, Waves, CookingPot, WashingMachine,
  Dumbbell, Coffee, Flame, Bath, Bed, Sparkles, Star,
} from 'lucide-react';

/** Clave guardada en la BD (campo `icono`) → ícono visual. */
export const ICONOS = {
  cocina: { label: 'Cocina', Icon: CookingPot },
  tv: { label: 'Televisor', Icon: Tv },
  aire: { label: 'Aire acondicionado', Icon: Snowflake },
  mascotas: { label: 'Mascotas', Icon: PawPrint },
  estacionamiento: { label: 'Estacionamiento', Icon: Car },
  pileta: { label: 'Pileta', Icon: Waves },
  wifi: { label: 'Wifi', Icon: Wifi },
  lavarropas: { label: 'Lavarropas', Icon: WashingMachine },
  gimnasio: { label: 'Gimnasio', Icon: Dumbbell },
  desayuno: { label: 'Desayuno', Icon: Coffee },
  calefaccion: { label: 'Calefacción', Icon: Flame },
  bano: { label: 'Baño privado', Icon: Bath },
  cama: { label: 'Cama', Icon: Bed },
  limpieza: { label: 'Limpieza', Icon: Sparkles },
};

export function Icono({ nombre, className = 'h-5 w-5' }) {
  const Cmp = ICONOS[nombre]?.Icon ?? Star;
  return <Cmp className={className} aria-hidden="true" />;
}
