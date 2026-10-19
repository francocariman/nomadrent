package com.nomadrent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "caracteristica", uniqueConstraints = @UniqueConstraint(name = "uk_caracteristica_nombre", columnNames = "nombre"))
public class Caracteristica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    /** Clave del ícono (ej. "wifi", "pileta"). El frontend la traduce al ícono visual. */
    @Column(nullable = false, length = 60)
    private String icono;

    public Caracteristica() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }
}
