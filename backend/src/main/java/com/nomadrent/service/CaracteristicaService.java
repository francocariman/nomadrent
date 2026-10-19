package com.nomadrent.service;

import com.nomadrent.dto.CaracteristicaRequest;
import com.nomadrent.dto.CaracteristicaResponse;
import com.nomadrent.entity.Caracteristica;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.CaracteristicaRepository;
import com.nomadrent.repository.ProductoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CaracteristicaService {

    private final CaracteristicaRepository repository;
    private final ProductoRepository productos;

    public CaracteristicaService(CaracteristicaRepository repository, ProductoRepository productos) {
        this.repository = repository;
        this.productos = productos;
    }

    @Transactional(readOnly = true)
    public List<CaracteristicaResponse> listar() {
        return repository.findAll(Sort.by("nombre").ascending()).stream().map(CaracteristicaResponse::from).toList();
    }

    @Transactional
    public CaracteristicaResponse crear(CaracteristicaRequest req) {
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new ReglaNegocioException("Ya existe una característica llamada \"" + nombre + "\".");
        }
        Caracteristica c = new Caracteristica();
        c.setNombre(nombre);
        c.setIcono(req.icono().trim());
        return CaracteristicaResponse.from(repository.save(c));
    }

    @Transactional
    public CaracteristicaResponse actualizar(Long id, CaracteristicaRequest req) {
        Caracteristica c = buscar(id);
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ReglaNegocioException("Ya existe una característica llamada \"" + nombre + "\".");
        }
        c.setNombre(nombre);
        c.setIcono(req.icono().trim());
        return CaracteristicaResponse.from(repository.save(c));
    }

    /** Antes de borrar, la desvincula de los productos que la usan (tabla puente). */
    @Transactional
    public void eliminar(Long id) {
        buscar(id);
        productos.findByCaracteristicas_Id(id)
                .forEach(p -> p.getCaracteristicas().removeIf(c -> c.getId().equals(id)));
        productos.flush();
        repository.deleteById(id);
    }

    private Caracteristica buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró la característica con id " + id + "."));
    }
}
