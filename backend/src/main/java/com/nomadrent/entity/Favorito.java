package com.nomadrent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "favorito",
        uniqueConstraints = @UniqueConstraint(name = "uk_favorito_usuario_producto", columnNames = {"usuario_id", "producto_id"}))
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    public Favorito() {}

    public Favorito(Usuario usuario, Producto producto) {
        this.usuario = usuario;
        this.producto = producto;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
}
