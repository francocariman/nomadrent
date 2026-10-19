package com.nomadrent.dto;

import com.nomadrent.entity.Caracteristica;

public record CaracteristicaResponse(Long id, String nombre, String icono) {
    public static CaracteristicaResponse from(Caracteristica c) {
        return new CaracteristicaResponse(c.getId(), c.getNombre(), c.getIcono());
    }
}
