# 🏡 NomadRent — Plataforma de Alquiler Temporal y Reservas

> Plataforma web integral desarrollada para la gestión, búsqueda, visualización detallada y reserva de alojamientos temporales, equipada con panel de administración para el control del catálogo y sistema completo de autenticación de usuarios y reseñas.

---

## 🚀 Tecnologías Utilizadas

### ☕ Backend

* **Java:** Versión 17 o 21
* **Spring Boot:** 3.x
* **Librerías / Módulos:** 
  * Spring Web (REST APIs)
  * Spring Data JPA (Persistencia de datos)
  * H2 Database (Base de datos en memoria para entorno de desarrollo)
  * Lombok (Optimización de código repetitivo)


### ⚛️ Frontend

* **React:** Versión 18+ (Vite)
* **React Router DOM:** Manejo de rutas y navegación
* **Tailwind CSS:** Framework de estilos UX/UI
* **Lucide React:** Iconografía optimizada

---

## 🛠️ Instalación y Configuración Local

Seguí estos pasos para clonar y poner a correr el proyecto en tu máquina de forma limpia:

### Prerrequisitos
* Tener instalado **Node.js** (versión 18 o superior) y **npm**.
* Tener instalado **Java JDK** (versión 17 o 21) y **Maven**.

### Configurar base de datos:

como el proyecto esta creado con H2 (en memoria), para correrlo con una base de datos persistente hay que realizar los siguientes pasos:

Instalar MySQL > Crear una base de datos llamada "nomadrent" > modificar el archivo application.properities de la siguiente manera:

Eliminar lo que el fragmento

>>
# H2 en memoria
spring.datasource.url=jdbc:h2:mem:nomadrentdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.open-in-view=false

# Consola H2: http://localhost:8080/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
>>

y reemplazar por:

>>
# Conexión a tu base de datos MySQL local
spring.datasource.url=jdbc:mysql://localhost:3306/nomadrent?useSSL=false&serverTimezone=UTC
spring.datasource.username=UsuarioBD
spring.datasource.password=PasswordBD

# Configuración de Hibernate para crear y actualizar las tablas automáticamente
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
>>

### 1. Clonar el repositorio


git clone [https://github.com/francocariman/nomadrent.git](https://github.com/francocariman/nomadrent.git)
cd nomadrent

2. Configurar y levantar el Backend (Spring Boot):

Entrá a la carpeta del backend, compilá y ejecutá la aplicación:

cd backend
./mvnw spring-boot:run

(En Windows también podes usar mvnw.cmd spring-boot:run). El servidor correrá por defecto en http://localhost:8080.

3. Configurar y levantar el Frontend (React):

Abrí otra terminal, parate en la carpeta raíz y entrá a la carpeta del frontend:

cd frontend
npm install
npm run dev

La aplicación web se abrirá en http://localhost:5173 (o el puerto que indique Vite).

⚙️ Configurar variables de entorno:
Crea un archivo .env en la raíz de la carpeta frontend/:

# .env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=NomadRent



🔌 Endpoints Principales de la API

Funcionalidad      Método       Endpoint                 Descripción         Requiere Auth

   Auth	            POST      /api/auth/login                Inicio                ❌
                                                           de sesión

   Auth     	      POST      /api/auth/register          Registro de              ❌
                                                           nuevo usuario	

  Productos 	      GET	     /api/productos                 Obtener la             ❌
                                                          lista completa
                                                             paginada

  Productos	        GET	    /api/productos/random         Obtener productos        ❌
                                                         aleatorios (home)
  
  Productos         GET     /api/productos{id}            Obtener detalle          ❌
                                                          de un producto

  Administración    POST    /api/productos               Crear nuevo               ✅
                                                      alojamiento (admin)

  Administración    DELETE  /api/productos{id}       Eliminar alojamiento          ✅
                                                           (admin)

  Reservas          POST    /api/reservas                 Registrar nueva          ✅
                                                        reservas con fecha

  Reservas          GET    /api/reservas/usuario{id}    Historial de reservas      ✅
                                                          del usuario




🗄️ Diagrama de Base de Datos

La estructura relacional del sistema conecta las entidades principales (Usuario, Producto, Reserva, Caracteristica, Categoria, Reseña) gestionadas mediante Spring Data JPA.

🧪 Testing y QA

Tipos de Pruebas: Pruebas unitarias de controladores, validaciones de formularios y control de rutas protegidas mediante roles (USER / ADMIN).

Ejecución de Tests (Backend): 

./mvnw test


🌐 Deploy

Backend: Desplegado y conectado en entorno cloud compatible (Railway / Render).

Frontend: Desplegado mediante plataforma de integración continua en Vercel.



📸 Capturas del Sistema / Vistas Principales

Adjuntadas en carpeta raiz del proyecto

nomadrent/imagen1.jpg
nomadrent/imagen2.jpg
nomadrent/imagen3.jpg
nomadrent/imagen4.jpg
nomadrent/imagen5.jpg

📞 Soporte
¿Encontraste un bug o tienes una sugerencia?

🐛 Reportar bug
💡 Solicitar feature
📧 Email: francocariman98@gmail.com