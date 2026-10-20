import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config.js';

/**
 * Botón flotante (esquina inferior derecha, visible en todas las vistas).
 * Abre un chat directo con el proveedor vía wa.me: no requiere registro.
 * En la ficha de un alojamiento, el mensaje incluye el enlace a ese alojamiento.
 */
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  const enProducto = pathname.startsWith('/producto/');
  const texto = enProducto
    ? `Hola NomadRent! Quisiera consultar por este alojamiento: ${window.location.origin}${pathname}`
    : 'Hola NomadRent! Quisiera hacer una consulta.';
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp con el proveedor"
      title="Chatear por WhatsApp"
      // bottom-20 deja el botón por encima del footer fijo (h-14)
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5a] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" aria-hidden="true" />
    </a>
  );
}
