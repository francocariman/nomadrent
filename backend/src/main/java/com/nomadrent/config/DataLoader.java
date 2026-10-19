package com.nomadrent.config;

import com.nomadrent.entity.*;
import com.nomadrent.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Datos de ejemplo SOLO para desarrollo.
 * Usuarios de prueba: admin@nomadrent.com / Admin1234  ·  user@nomadrent.com / User1234
 */
@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner seed(ProductoRepository productos, CategoriaRepository categorias,
                           CaracteristicaRepository caracteristicas, UsuarioRepository usuarios,
                           PasswordEncoder encoder) {
        return args -> {
            if (usuarios.count() == 0) {
                usuarios.save(usuario("Ada", "Admin", "admin@nomadrent.com", "Admin1234", Rol.ADMIN, encoder));
                usuarios.save(usuario("Ulises", "Usuario", "user@nomadrent.com", "User1234", Rol.USER, encoder));
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
                productos.save(p);
            }
        };
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
