package com.nomadrent.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Reseña con puntuación de 1 a 5. Un usuario puede reseñar un producto una sola vez. */
@Entity
@Table(name = "resena",
        uniqueConstraints = @UniqueConstraint(name = "uk_resena_usuario_producto", columnNames = {"usuario_id", "producto_id"}))
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int puntuacion;

    @Column(nullable = false, length = 1000)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    public Resena() {}

    public Long getId() { return id; }
    public int getPuntuacion() { return puntuacion; }
    public void setPuntuacion(int puntuacion) { this.puntuacion = puntuacion; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
}
