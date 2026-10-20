// Número de WhatsApp del proveedor, en formato internacional y solo dígitos (ej. 5492990000000).
// Configúralo en frontend/.env como VITE_WHATSAPP_NUMBER. El valor por defecto es un MARCADOR DE POSICIÓN.
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '5492990000000').replace(/\D/g, '');
