package com.nomadrent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria", uniqueConstraints = @UniqueConstraint(name = "uk_categoria_titulo", columnNames = "titulo"))
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    /** URL de la imagen representativa. */
    @Column(nullable = false, length = 1000)
    private String imagen;

    public Categoria() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}
