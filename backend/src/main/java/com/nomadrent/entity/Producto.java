package com.nomadrent.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "producto", uniqueConstraints = @UniqueConstraint(name = "uk_producto_nombre", columnNames = "nombre"))
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String nombre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 80)
    private String ciudad;

    @Column(nullable = false)
    private Double precio;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "producto_imagenes", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "url", length = 1000)
    @OrderColumn(name = "posicion")
    private List<String> imagenes = new ArrayList<>();

    /** Many-to-Many: el producto es el dueño de la relación (tabla producto_caracteristica). */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "producto_caracteristica",
            joinColumns = @JoinColumn(name = "producto_id"),
            inverseJoinColumns = @JoinColumn(name = "caracteristica_id"))
    private Set<Caracteristica> caracteristicas = new LinkedHashSet<>();

    @Embedded
    private Politica politicas = new Politica();

    public Producto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public List<String> getImagenes() { return imagenes; }
    public void setImagenes(List<String> imagenes) { this.imagenes = imagenes; }
    /** Hibernate deja el embebido en null si todas sus columnas son null: se normaliza aquí. */
    public Politica getPoliticas() { return politicas != null ? politicas : new Politica(); }
    public void setPoliticas(Politica politicas) { this.politicas = politicas; }
    public Set<Caracteristica> getCaracteristicas() { return caracteristicas; }
    public void setCaracteristicas(Set<Caracteristica> caracteristicas) { this.caracteristicas = caracteristicas; }
}
