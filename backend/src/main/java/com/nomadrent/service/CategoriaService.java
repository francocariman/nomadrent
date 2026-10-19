package com.nomadrent.service;

import com.nomadrent.dto.CategoriaRequest;
import com.nomadrent.dto.CategoriaResponse;
import com.nomadrent.entity.Categoria;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.CategoriaRepository;
import com.nomadrent.repository.ProductoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;
    private final ProductoRepository productos;

    public CategoriaService(CategoriaRepository repository, ProductoRepository productos) {
        this.repository = repository;
        this.productos = productos;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return repository.findAll(Sort.by("id").ascending()).stream()
                .map(c -> CategoriaResponse.from(c, productos.countByCategoriaId(c.getId())))
                .toList();
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest req) {
        String titulo = req.titulo().trim();
        if (repository.existsByTituloIgnoreCase(titulo)) {
            throw new ReglaNegocioException("Ya existe una categoría llamada \"" + titulo + "\".");
        }
        Categoria c = new Categoria();
        aplicar(c, req);
        return CategoriaResponse.from(repository.save(c), 0);
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest req) {
        Categoria c = buscar(id);
        String titulo = req.titulo().trim();
        if (repository.existsByTituloIgnoreCaseAndIdNot(titulo, id)) {
            throw new ReglaNegocioException("Ya existe una categoría llamada \"" + titulo + "\".");
        }
        aplicar(c, req);
        return CategoriaResponse.from(repository.save(c), productos.countByCategoriaId(id));
    }

    @Transactional
    public void eliminar(Long id) {
        buscar(id);
        long usados = productos.countByCategoriaId(id);
        if (usados > 0) {
            throw new ReglaNegocioException("No se puede eliminar: " + usados
                    + " producto(s) usan esta categoría. Reasígnalos primero.");
        }
        repository.deleteById(id);
    }

    private void aplicar(Categoria c, CategoriaRequest req) {
        c.setTitulo(req.titulo().trim());
        c.setDescripcion(req.descripcion().trim());
        c.setImagen(req.imagen().trim());
    }

    private Categoria buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró la categoría con id " + id + "."));
    }
}
