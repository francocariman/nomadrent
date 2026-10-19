package com.nomadrent.service;

import com.nomadrent.dto.PaginaResponse;
import com.nomadrent.dto.ProductoRequest;
import com.nomadrent.dto.ProductoResponse;
import com.nomadrent.entity.Producto;
import com.nomadrent.exception.NombreDuplicadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.repository.ProductoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductoService {

    public static final int PAGE_SIZE = 10;

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarAleatorios() {
        return repository.findRandom10().stream().map(ProductoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PaginaResponse<ProductoResponse> listarPaginado(int page) {
        int safePage = Math.max(page, 0);
        Page<Producto> result = repository.findAll(PageRequest.of(safePage, PAGE_SIZE, Sort.by("id").ascending()));
        return new PaginaResponse<>(
                result.getContent().stream().map(ProductoResponse::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalPages(), result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id) {
        return repository.findById(id).map(ProductoResponse::from)
                .orElseThrow(() -> new ProductoNoEncontradoException(id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new NombreDuplicadoException(nombre);
        }
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setDescripcion(req.descripcion().trim());
        p.setCategoria(req.categoria().trim());
        p.setCiudad(req.ciudad().trim());
        p.setPrecio(req.precio());
        p.setImagenes(new ArrayList<>(req.imagenes().stream().map(String::trim).toList()));
        return ProductoResponse.from(repository.save(p));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductoNoEncontradoException(id);
        }
        repository.deleteById(id);
    }
}
