package com.nomadrent.dto;

import com.nomadrent.entity.Categoria;

public record CategoriaResponse(Long id, String titulo, String descripcion, String imagen, long cantidadProductos) {
    public static CategoriaResponse from(Categoria c, long cantidadProductos) {
        return new CategoriaResponse(c.getId(), c.getTitulo(), c.getDescripcion(), c.getImagen(), cantidadProductos);
    }
}
