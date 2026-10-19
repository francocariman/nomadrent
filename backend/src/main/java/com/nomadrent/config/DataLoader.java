package com.nomadrent.config;

import com.nomadrent.entity.Producto;
import com.nomadrent.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/** Datos de ejemplo para poder probar el catálogo desde el primer arranque. */
@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner seed(ProductoRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            String[][] data = {
                    {"Loft luminoso en Palermo", "Departamento", "Buenos Aires", "78"},
                    {"Cabaña frente al lago", "Cabaña", "San Martín de los Andes", "120"},
                    {"Casa de campo con pileta", "Casa", "Mendoza", "145"},
                    {"Suite con vista al río", "Hotel", "Rosario", "95"},
                    {"Dúplex céntrico", "Departamento", "Córdoba", "64"},
                    {"Refugio de montaña", "Cabaña", "Bariloche", "132"},
                    {"Casa de playa minimalista", "Casa", "Mar del Plata", "160"},
                    {"Habitación compartida premium", "Hostel", "Salta", "28"},
                    {"Estudio para nómadas digitales", "Departamento", "Neuquén", "55"},
                    {"Bungalow entre viñedos", "Cabaña", "Cafayate", "110"},
                    {"Hotel boutique histórico", "Hotel", "Ushuaia", "180"},
                    {"Casona colonial restaurada", "Casa", "Tucumán", "98"}
            };
            for (String[] d : data) {
                Producto p = new Producto();
                p.setNombre(d[0]);
                p.setCategoria(d[1]);
                p.setCiudad(d[2]);
                p.setPrecio(Double.parseDouble(d[3]));
                p.setDescripcion("Alojamiento ideal para estadías cortas y largas en " + d[2]
                        + ". Espacios cómodos, wifi rápido y todo listo para que te instales desde el primer día.");
                List<String> imgs = new ArrayList<>();
                for (int i = 1; i <= 5; i++) {
                    imgs.add("https://picsum.photos/seed/" + d[0].replaceAll("[^A-Za-z]", "") + i + "/900/650");
                }
                p.setImagenes(imgs);
                repo.save(p);
            }
        };
    }
}
