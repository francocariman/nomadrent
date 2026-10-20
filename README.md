# NomadRent · Sprint 1 + 2 + 3

## Backend (Java 17 + Spring Boot 3.3 + Spring Security + JWT)
```bash
cd backend
mvn spring-boot:run        # http://localhost:8080
```
- Consola H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:nomadrentdb`, user `sa`, sin password)
- Datos de ejemplo al iniciar (`DataLoader`): 5 categorías, 10 características, 12 productos (con políticas, reservas futuras que bloquean fechas y reseñas) y 5 usuarios:

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | admin@nomadrent.com | Admin1234 |
| USER | user@nomadrent.com | User1234 |
| USER | marta@ · julian@ · sofia@nomadrent.com | Demo1234 |

- Secreto JWT: variable de entorno `NOMADRENT_JWT_SECRET` (mínimo 32 caracteres). Hay un valor por defecto **solo para desarrollo**.

## Frontend (React 18 + Vite + Tailwind 3)
```bash
cd frontend
# Requiere tu logo en src/assets/logo.png (lo usan Header.jsx y Footer.jsx; no está incluido en este zip)
npm install
npm run dev                # http://localhost:5173 (proxy /api -> :8080)
```

## Endpoints
`Público` = sin token · `ADMIN` = requiere `Authorization: Bearer <token>` de un administrador.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /api/auth/register | Público | Registro (rol USER). Devuelve `{ token, usuario }` |
| POST | /api/auth/login | Público | Login. 401 con mensaje claro si las credenciales son incorrectas |
| GET | /api/productos/{id}/disponibilidad | Público | Rangos de noches ocupadas `[{desde, hasta}]` (hasta = día de salida) |
| POST | /api/reservas | Autenticado | Body `{productoId, fechaInicio, fechaFin}`. 400 si hay solapamiento, fechas pasadas o > 90 noches |
| GET | /api/reservas/mias | Autenticado | Reservas del usuario |
| POST | /api/favoritos | Autenticado | Body `{productoId}`. Alterna: añade o quita. Devuelve `{favorito, favoritoId}` |
| DELETE | /api/favoritos/{id} | Autenticado | Elimina un favorito propio (403 si es de otro usuario) |
| GET | /api/favoritos/usuario/{usuarioId} | Autenticado | Favoritos del usuario; 403 si `usuarioId` no es el del token |
| GET | /api/productos/{id}/resenas | Público | `{media, total, resenas[]}` (media calculada dinámicamente) |
| GET | /api/productos/{id}/resenas/elegibilidad | Público* | `{puedeResenar, motivo}` según la sesión |
| POST | /api/productos/{id}/resenas | Autenticado | Body `{puntuacion 1-5, comentario}`. Requiere reserva previa; una reseña por usuario y producto |
| GET | /api/usuarios | ADMIN | Lista de usuarios |
| PATCH | /api/usuarios/{id}/rol | ADMIN | Body `{ "rol": "ADMIN" \| "USER" }` |
| GET | /api/productos/random | Público | Hasta 10 aleatorios sin repetir |
| GET | /api/productos?page=0&categorias=1,2&destino=cordoba&desde=2026-11-01&hasta=2026-11-05 | Público | Paginado (10). Todos los filtros son opcionales y combinables; con fechas solo devuelve alojamientos sin reservas en ese rango |
| GET | /api/productos/sugerencias?q=cor | Público | Autocompletado: ciudades y nombres (mín. 2 letras) |
| GET | /api/productos/{id} | Público | Detalle (incluye categoría y características) |
| POST / PUT / DELETE | /api/productos[/{id}] | ADMIN | Alta / edición / baja. 400 si el nombre está duplicado |
| GET | /api/caracteristicas | Público | Lista |
| POST / PUT / DELETE | /api/caracteristicas[/{id}] | ADMIN | CRUD (al borrar se desvincula de los productos) |
| GET | /api/categorias | Público | Lista con `cantidadProductos` |
| POST / PUT / DELETE | /api/categorias[/{id}] | ADMIN | CRUD (no se borra si tiene productos) |

## Notas de diseño
- Contraseñas con BCrypt; el rol se lee de la BD en cada request, así que quitar/otorgar ADMIN aplica de inmediato.
- Un admin no puede cambiarse su propio rol ni dejar al sistema sin administradores.
- Los íconos se guardan como clave (`wifi`, `pileta`…); el catálogo visual está en `frontend/src/icons.jsx`.
- Reservas: se ocupan las *noches* `[entrada, salida)`; el día de salida puede coincidir con la entrada de otra reserva. Verificación de solapamiento en el servicio; para alta concurrencia en producción conviene sumar bloqueo de fila o una restricción de exclusión en la BD.
- Reseñas: puede reseñar quien tenga al menos una reserva del producto (incluye futuras, para poder probar el flujo). Para exigir estadía finalizada, filtrar por `fechaFin <= hoy` en `ResenaService`.
- Políticas: tres textos incrustados en `producto` (una regla por línea → viñetas en el frontend), editables desde el formulario de producto.
- Eliminar un producto borra sus favoritos, reseñas y reservas pasadas; se rechaza si tiene reservas vigentes o futuras.
- #19 (correo de confirmación) es opcional según el documento y no está incluido.
