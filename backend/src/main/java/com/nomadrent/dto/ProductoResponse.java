package com.nomadrent.dto;

import com.nomadrent.entity.Producto;
import java.util.List;

public record ProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        String categoria,
        String ciudad,
        Double precio,
        List<String> imagenes
) {
    public static ProductoResponse from(Producto p) {
        return new ProductoResponse(p.getId(), p.getNombre(), p.getDescripcion(), p.getCategoria(),
                p.getCiudad(), p.getPrecio(), List.copyOf(p.getImagenes()));
    }
}
