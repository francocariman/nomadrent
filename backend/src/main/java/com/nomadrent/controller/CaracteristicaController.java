package com.nomadrent.controller;

import com.nomadrent.dto.CaracteristicaRequest;
import com.nomadrent.dto.CaracteristicaResponse;
import com.nomadrent.service.CaracteristicaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caracteristicas")
public class CaracteristicaController {

    private final CaracteristicaService service;

    public CaracteristicaController(CaracteristicaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CaracteristicaResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<CaracteristicaResponse> crear(@Valid @RequestBody CaracteristicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @PutMapping("/{id}")
    public CaracteristicaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CaracteristicaRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
