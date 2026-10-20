package com.nomadrent.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Políticas del alojamiento, incrustadas en la tabla `producto`.
 * Cada campo es un texto con una regla por línea (el frontend las muestra como viñetas).
 */
@Embeddable
public class Politica {

    @Column(name = "politica_normas", columnDefinition = "TEXT")
    private String normas;

    @Column(name = "politica_salud_seguridad", columnDefinition = "TEXT")
    private String saludSeguridad;

    @Column(name = "politica_cancelacion", columnDefinition = "TEXT")
    private String cancelacion;

    public Politica() {}

    public Politica(String normas, String saludSeguridad, String cancelacion) {
        this.normas = normas;
        this.saludSeguridad = saludSeguridad;
        this.cancelacion = cancelacion;
    }

    public String getNormas() { return normas; }
    public void setNormas(String normas) { this.normas = normas; }
    public String getSaludSeguridad() { return saludSeguridad; }
    public void setSaludSeguridad(String saludSeguridad) { this.saludSeguridad = saludSeguridad; }
    public String getCancelacion() { return cancelacion; }
    public void setCancelacion(String cancelacion) { this.cancelacion = cancelacion; }
}
