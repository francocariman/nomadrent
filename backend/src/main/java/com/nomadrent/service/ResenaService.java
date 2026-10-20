package com.nomadrent.service;

import com.nomadrent.dto.*;
import com.nomadrent.entity.Producto;
import com.nomadrent.entity.Resena;
import com.nomadrent.entity.Usuario;
import com.nomadrent.exception.AccesoDenegadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.ProductoRepository;
import com.nomadrent.repository.ReservaRepository;
import com.nomadrent.repository.ResenaRepository;
import com.nomadrent.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResenaService {

    private final ResenaRepository resenas;
    private final ReservaRepository reservas;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;

    public ResenaService(ResenaRepository resenas, ReservaRepository reservas,
                         ProductoRepository productos, UsuarioRepository usuarios) {
        this.resenas = resenas;
        this.reservas = reservas;
        this.productos = productos;
        this.usuarios = usuarios;
    }

    /** Lista las reseñas y calcula la media dinámicamente a partir de las puntuaciones guardadas. */
    @Transactional(readOnly = true)
    public ResenasResponse listar(Long productoId) {
        if (!productos.existsById(productoId)) throw new ProductoNoEncontradoException(productoId);
        List<Resena> lista = resenas.findByProductoIdOrderByFechaDesc(productoId);
        double media = lista.stream().mapToInt(Resena::getPuntuacion).average().orElse(0.0);
        media = Math.round(media * 10.0) / 10.0;
        return new ResenasResponse(media, lista.size(), lista.stream().map(ResenaResponse::from).toList());
    }

    @Transactional(readOnly = true)
    public ElegibilidadResenaResponse elegibilidad(String email, Long productoId) {
        if (email == null) {
            return new ElegibilidadResenaResponse(false, "Inicia sesión para dejar tu opinión.");
        }
        Usuario u = usuarios.findByEmailIgnoreCase(email).orElse(null);
        if (u == null) {
            return new ElegibilidadResenaResponse(false, "Inicia sesión para dejar tu opinión.");
        }
        if (resenas.existsByUsuarioIdAndProductoId(u.getId(), productoId)) {
            return new ElegibilidadResenaResponse(false, "Ya dejaste tu reseña para este alojamiento. ¡Gracias!");
        }
        if (!reservas.existsByUsuarioIdAndProductoId(u.getId(), productoId)) {
            return new ElegibilidadResenaResponse(false, "Podrás dejar tu opinión cuando tengas una reserva en este alojamiento.");
        }
        return new ElegibilidadResenaResponse(true, "");
    }

    @Transactional
    public ResenaResponse crear(String email, Long productoId, ResenaRequest req) {
        Usuario u = usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccesoDenegadoException("Debes iniciar sesión."));
        Producto p = productos.findById(productoId).orElseThrow(() -> new ProductoNoEncontradoException(productoId));

        if (!reservas.existsByUsuarioIdAndProductoId(u.getId(), p.getId())) {
            throw new ReglaNegocioException("Solo puedes reseñar alojamientos que hayas reservado.");
        }
        if (resenas.existsByUsuarioIdAndProductoId(u.getId(), p.getId())) {
            throw new ReglaNegocioException("Ya dejaste una reseña para este alojamiento.");
        }

        Resena r = new Resena();
        r.setUsuario(u);
        r.setProducto(p);
        r.setPuntuacion(req.puntuacion());
        r.setComentario(req.comentario().trim());
        r.setFecha(LocalDateTime.now());
        return ResenaResponse.from(resenas.save(r));
    }
}
