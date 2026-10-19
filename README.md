# NomadRent · Sprint 1 + Sprint 2

## Backend (Java 17 + Spring Boot 3.3 + Spring Security + JWT)
```bash
cd backend
mvn spring-boot:run        # http://localhost:8080
```
- Consola H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:nomadrentdb`, user `sa`, sin password)
- Datos de ejemplo al iniciar (`DataLoader`): 5 categorías, 10 características, 12 productos y 2 usuarios:

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | admin@nomadrent.com | Admin1234 |
| USER | user@nomadrent.com | User1234 |

- Secreto JWT: variable de entorno `NOMADRENT_JWT_SECRET` (mínimo 32 caracteres). Hay un valor por defecto **solo para desarrollo**.

## Frontend (React 18 + Vite + Tailwind 3)
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxy /api -> :8080)
```

## Endpoints
`Público` = sin token · `ADMIN` = requiere `Authorization: Bearer <token>` de un administrador.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /api/auth/register | Público | Registro (rol USER). Devuelve `{ token, usuario }` |
| POST | /api/auth/login | Público | Login. 401 con mensaje claro si las credenciales son incorrectas |
| GET | /api/usuarios | ADMIN | Lista de usuarios |
| PATCH | /api/usuarios/{id}/rol | ADMIN | Body `{ "rol": "ADMIN" \| "USER" }` |
| GET | /api/productos/random | Público | Hasta 10 aleatorios sin repetir |
| GET | /api/productos?page=0&categorias=1,2 | Público | Paginado (10) con filtro múltiple opcional |
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
- #19 (correo de confirmación) es opcional según el documento y no está incluido.
