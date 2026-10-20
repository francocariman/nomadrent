package com.nomadrent.service;

import com.nomadrent.dto.FavoritoResponse;
import com.nomadrent.dto.FavoritoToggleResponse;
import com.nomadrent.dto.ProductoResponse;
import com.nomadrent.entity.Favorito;
import com.nomadrent.entity.Producto;
import com.nomadrent.entity.Usuario;
import com.nomadrent.exception.AccesoDenegadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.repository.FavoritoRepository;
import com.nomadrent.repository.ProductoRepository;
import com.nomadrent.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritos;
    private final UsuarioRepository usuarios;
    private final ProductoRepository productos;
    private final ProductoService productoService;

    public FavoritoService(FavoritoRepository favoritos, UsuarioRepository usuarios,
                           ProductoRepository productos, ProductoService productoService) {
        this.favoritos = favoritos;
        this.usuarios = usuarios;
        this.productos = productos;
        this.productoService = productoService;
    }

    /** Solo el propio usuario puede ver su lista. */
    @Transactional(readOnly = true)
    public List<FavoritoResponse> listar(Long usuarioId, String email) {
        Usuario u = usuario(email);
        if (!u.getId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Solo puedes ver tus propios favoritos.");
        }
        List<Favorito> lista = favoritos.findByUsuarioIdOrderByIdDesc(usuarioId);
        List<ProductoResponse> prods = productoService.toResponses(lista.stream().map(Favorito::getProducto).toList());
        return IntStream.range(0, lista.size())
                .mapToObj(i -> new FavoritoResponse(lista.get(i).getId(), prods.get(i)))
                .toList();
    }

    /** Añade el favorito si no existía; si ya existía, lo quita. */
    @Transactional
    public FavoritoToggleResponse alternar(String email, Long productoId) {
        Usuario u = usuario(email);
        Optional<Favorito> existente = favoritos.findByUsuarioIdAndProductoId(u.getId(), productoId);
        if (existente.isPresent()) {
            favoritos.delete(existente.get());
            return new FavoritoToggleResponse(false, null);
        }
        Producto p = productos.findById(productoId).orElseThrow(() -> new ProductoNoEncontradoException(productoId));
        Favorito nuevo = favoritos.save(new Favorito(u, p));
        return new FavoritoToggleResponse(true, nuevo.getId());
    }

    @Transactional
    public void eliminar(Long favoritoId, String email) {
        Usuario u = usuario(email);
        Favorito f = favoritos.findById(favoritoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró el favorito con id " + favoritoId + "."));
        if (!f.getUsuario().getId().equals(u.getId())) {
            throw new AccesoDenegadoException("No puedes modificar los favoritos de otro usuario.");
        }
        favoritos.delete(f);
    }

    private Usuario usuario(String email) {
        return usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccesoDenegadoException("Debes iniciar sesión."));
    }
}
