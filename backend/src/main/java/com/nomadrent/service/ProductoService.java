package com.nomadrent.service;

import com.nomadrent.dto.PaginaResponse;
import com.nomadrent.dto.ProductoRequest;
import com.nomadrent.dto.ProductoResponse;
import com.nomadrent.entity.Caracteristica;
import com.nomadrent.entity.Categoria;
import com.nomadrent.entity.Producto;
import com.nomadrent.exception.NombreDuplicadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.CaracteristicaRepository;
import com.nomadrent.repository.CategoriaRepository;
import com.nomadrent.repository.ProductoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProductoService {

    public static final int PAGE_SIZE = 10;

    private final ProductoRepository repository;
    private final CategoriaRepository categorias;
    private final CaracteristicaRepository caracteristicas;

    public ProductoService(ProductoRepository repository, CategoriaRepository categorias,
                           CaracteristicaRepository caracteristicas) {
        this.repository = repository;
        this.categorias = categorias;
        this.caracteristicas = caracteristicas;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarAleatorios() {
        return repository.findRandom10().stream().map(ProductoResponse::from).toList();
    }

    /** Si se envían categorías, filtra por cualquiera de ellas (selección múltiple). */
    @Transactional(readOnly = true)
    public PaginaResponse<ProductoResponse> listarPaginado(int page, List<Long> categoriaIds) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), PAGE_SIZE, Sort.by("id").ascending());
        Page<Producto> result = (categoriaIds == null || categoriaIds.isEmpty())
                ? repository.findAll(pageable)
                : repository.findByCategoriaIdIn(categoriaIds, pageable);
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
        aplicar(p, req);
        return ProductoResponse.from(repository.save(p));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest req) {
        Producto p = repository.findById(id).orElseThrow(() -> new ProductoNoEncontradoException(id));
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new NombreDuplicadoException(nombre);
        }
        aplicar(p, req);
        return ProductoResponse.from(repository.save(p));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductoNoEncontradoException(id);
        }
        repository.deleteById(id);
    }

    /** Copia los datos del request a la entidad, resolviendo categoría y características. */
    private void aplicar(Producto p, ProductoRequest req) {
        Categoria categoria = categorias.findById(req.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("La categoría seleccionada no existe."));

        Set<Long> ids = req.caracteristicaIds() == null ? Set.of() : new LinkedHashSet<>(req.caracteristicaIds());
        List<Caracteristica> encontradas = caracteristicas.findAllById(ids);
        if (encontradas.size() != ids.size()) {
            throw new ReglaNegocioException("Alguna de las características seleccionadas no existe.");
        }

        p.setNombre(req.nombre().trim());
        p.setDescripcion(req.descripcion().trim());
        p.setCategoria(categoria);
        p.setCiudad(req.ciudad().trim());
        p.setPrecio(req.precio());
        p.getImagenes().clear();
        req.imagenes().forEach(u -> p.getImagenes().add(u.trim()));
        p.getCaracteristicas().clear();
        p.getCaracteristicas().addAll(encontradas);
    }
}
