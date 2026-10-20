package com.nomadrent.config;

import com.nomadrent.entity.*;
import com.nomadrent.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Datos de ejemplo SOLO para desarrollo.
 * Usuarios: admin@nomadrent.com / Admin1234 · user@nomadrent.com / User1234
 * Reseñadores de demo: marta@/julian@/sofia@nomadrent.com / Demo1234
 */
@Configuration
public class DataLoader {

    private static final String NORMAS =
            "Check-in: desde las 14:00\nCheck-out: hasta las 10:00\nNo se permiten fiestas ni eventos\nProhibido fumar en el interior";
    private static final String SEGURIDAD =
            "Detector de humo instalado\nBotiquín de primeros auxilios disponible\nProtocolo de limpieza reforzado\nExtintor en la propiedad";
    private static final String CANCELACION =
            "Cancelación gratuita hasta 48 horas antes del check-in\nLuego de ese plazo se cobra la primera noche\nLas modificaciones de fecha dependen de la disponibilidad";

    private static final String[] COMENTARIOS = {
            "Excelente ubicación y muy limpio. Volvería sin dudarlo.",
            "Todo tal cual las fotos. La atención del anfitrión fue impecable.",
            "Muy cómodo para trabajar de forma remota, el wifi funciona perfecto.",
            "Linda estadía, aunque la cama podría ser un poco más cómoda.",
            "Superó mis expectativas, ideal para descansar unos días."
    };
    private static final int[] PUNTAJES = {5, 4, 5, 3, 4};

    @Bean
    CommandLineRunner seed(ProductoRepository productos, CategoriaRepository categorias,
                           CaracteristicaRepository caracteristicas, UsuarioRepository usuarios,
                           ReservaRepository reservas, ResenaRepository resenas, PasswordEncoder encoder) {
        return args -> {
            if (usuarios.count() == 0) {
                usuarios.save(usuario("Ada", "Admin", "admin@nomadrent.com", "Admin1234", Rol.ADMIN, encoder));
                usuarios.save(usuario("Ulises", "Usuario", "user@nomadrent.com", "User1234", Rol.USER, encoder));
                usuarios.save(usuario("Marta", "Gómez", "marta@nomadrent.com", "Demo1234", Rol.USER, encoder));
                usuarios.save(usuario("Julián", "Pérez", "julian@nomadrent.com", "Demo1234", Rol.USER, encoder));
                usuarios.save(usuario("Sofía", "Ledesma", "sofia@nomadrent.com", "Demo1234", Rol.USER, encoder));
            }
            if (productos.count() > 0) return;

            // Categorías
            Map<String, Categoria> cats = new LinkedHashMap<>();
            String[][] catData = {
                    {"Departamentos", "Ideales para estadías urbanas, cerca de todo."},
                    {"Casas", "Espacio y privacidad para toda la familia."},
                    {"Cabañas", "Naturaleza, calma y vistas increíbles."},
                    {"Hoteles", "Servicios completos y atención personalizada."},
                    {"Hostels", "Económicos y perfectos para conocer gente."}
            };
            for (String[] c : catData) {
                Categoria cat = new Categoria();
                cat.setTitulo(c[0]);
                cat.setDescripcion(c[1]);
                cat.setImagen("https://picsum.photos/seed/cat" + c[0] + "/600/400");
                cats.put(c[0], categorias.save(cat));
            }

            // Características (la clave de ícono la resuelve el frontend)
            String[][] carData = {
                    {"Cocina", "cocina"}, {"Televisor", "tv"}, {"Aire acondicionado", "aire"},
                    {"Apto mascotas", "mascotas"}, {"Estacionamiento gratuito", "estacionamiento"},
                    {"Pileta", "pileta"}, {"Wifi", "wifi"}, {"Lavarropas", "lavarropas"},
                    {"Gimnasio", "gimnasio"}, {"Desayuno incluido", "desayuno"}
            };
            List<Caracteristica> cars = new ArrayList<>();
            for (String[] c : carData) {
                Caracteristica car = new Caracteristica();
                car.setNombre(c[0]);
                car.setIcono(c[1]);
                cars.add(caracteristicas.save(car));
            }

            Usuario ulises = usuarios.findByEmailIgnoreCase("user@nomadrent.com").orElseThrow();
            List<Usuario> reseniadores = List.of(
                    usuarios.findByEmailIgnoreCase("marta@nomadrent.com").orElseThrow(),
                    usuarios.findByEmailIgnoreCase("julian@nomadrent.com").orElseThrow(),
                    usuarios.findByEmailIgnoreCase("sofia@nomadrent.com").orElseThrow());
            LocalDate hoy = LocalDate.now();

            // Productos
            String[][] data = {
                    {"Loft luminoso en Palermo", "Departamentos", "Buenos Aires", "78"},
                    {"Cabaña frente al lago", "Cabañas", "San Martín de los Andes", "120"},
                    {"Casa de campo con pileta", "Casas", "Mendoza", "145"},
                    {"Suite con vista al río", "Hoteles", "Rosario", "95"},
                    {"Dúplex céntrico", "Departamentos", "Córdoba", "64"},
                    {"Refugio de montaña", "Cabañas", "Bariloche", "132"},
                    {"Casa de playa minimalista", "Casas", "Mar del Plata", "160"},
                    {"Habitación compartida premium", "Hostels", "Salta", "28"},
                    {"Estudio para nómadas digitales", "Departamentos", "Neuquén", "55"},
                    {"Bungalow entre viñedos", "Cabañas", "Cafayate", "110"},
                    {"Hotel boutique histórico", "Hoteles", "Ushuaia", "180"},
                    {"Casona colonial restaurada", "Casas", "Tucumán", "98"}
            };
            for (int i = 0; i < data.length; i++) {
                String[] d = data[i];
                Producto p = new Producto();
                p.setNombre(d[0]);
                p.setCategoria(cats.get(d[1]));
                p.setCiudad(d[2]);
                p.setPrecio(Double.parseDouble(d[3]));
                p.setDescripcion("Alojamiento ideal para estadías cortas y largas en " + d[2]
                        + ". Espacios cómodos, wifi rápido y todo listo para que te instales desde el primer día.");
                List<String> imgs = new ArrayList<>();
                for (int k = 1; k <= 5; k++) {
                    imgs.add("https://picsum.photos/seed/" + d[0].replaceAll("[^A-Za-z]", "") + k + "/900/650");
                }
                p.setImagenes(imgs);
                for (int j = 0; j < cars.size(); j++) {
                    if ((i * 7 + j * 3) % 4 != 0) p.getCaracteristicas().add(cars.get(j));
                }
                p.setPoliticas(new Politica(NORMAS, SEGURIDAD, CANCELACION));
                p = productos.save(p);

                // Fechas ocupadas (futuras) para que el calendario muestre bloqueos
                reservas.save(reserva(ulises, p, hoy.plusDays(4 + i), 3));
                reservas.save(reserva(reseniadores.get(i % 3), p, hoy.plusDays(25 + i * 2L), 4));

                // Reseñas de estadías ya finalizadas (el último producto queda sin reseñas)
                if (i < data.length - 1) {
                    int cantidad = 1 + (i % 3);
                    for (int j = 0; j < cantidad; j++) {
                        Usuario autor = reseniadores.get(j);
                        reservas.save(reserva(autor, p, hoy.minusDays(60L + j * 10L), 3));
                        Resena r = new Resena();
                        r.setUsuario(autor);
                        r.setProducto(p);
                        r.setPuntuacion(PUNTAJES[(i + j) % PUNTAJES.length]);
                        r.setComentario(COMENTARIOS[(i + j) % COMENTARIOS.length]);
                        r.setFecha(LocalDateTime.now().minusDays(20L + j * 5L));
                        resenas.save(r);
                    }
                }
            }
        };
    }

    private Reserva reserva(Usuario u, Producto p, LocalDate inicio, int noches) {
        Reserva r = new Reserva();
        r.setUsuario(u);
        r.setProducto(p);
        r.setFechaInicio(inicio);
        r.setFechaFin(inicio.plusDays(noches));
        return r;
    }

    private Usuario usuario(String nombre, String apellido, String email, String pass, Rol rol, PasswordEncoder enc) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setEmail(email);
        u.setPassword(enc.encode(pass));
        u.setRol(rol);
        return u;
    }
}
