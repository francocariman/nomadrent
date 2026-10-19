package com.nomadrent.dto;

import com.nomadrent.entity.Producto;
import java.util.Comparator;
import java.util.List;

public record ProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoria,
        String ciudad,
        Double precio,
        List<String> imagenes,
        List<CaracteristicaResponse> caracteristicas
) {
    public static ProductoResponse from(Producto p) {
        return new ProductoResponse(
                p.getId(), p.getNombre(), p.getDescripcion(),
                p.getCategoria().getId(), p.getCategoria().getTitulo(),
                p.getCiudad(), p.getPrecio(), List.copyOf(p.getImagenes()),
                p.getCaracteristicas().stream()
                        .map(CaracteristicaResponse::from)
                        .sorted(Comparator.comparing(CaracteristicaResponse::nombre, String.CASE_INSENSITIVE_ORDER))
                        .toList());
    }
}
