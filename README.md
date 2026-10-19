# NomadRent · Sprint 1

## Backend (Java 17 + Spring Boot 3.3)
```bash
cd backend
mvn spring-boot:run        # http://localhost:8080
```
- Consola H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:nomadrentdb`, user `sa`, sin password)
- Se cargan 12 productos de ejemplo al iniciar (`DataLoader`).

## Frontend (React 18 + Vite + Tailwind 3)
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxy /api -> :8080)
```

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/productos/random | Hasta 10 productos aleatorios sin repetir |
| GET | /api/productos?page=0 | Lista paginada (10 por página) |
| GET | /api/productos/{id} | Detalle |
| POST | /api/productos | Crea; 400 `{"mensaje": "..."}` si el nombre existe |
| DELETE | /api/productos/{id} | Elimina (204) |
