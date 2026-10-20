package com.nomadrent.dto;

public record ResumenPuntuacion(double media, long total) {
    public static final ResumenPuntuacion VACIO = new ResumenPuntuacion(0.0, 0);
}
