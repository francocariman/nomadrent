package com.nomadrent.controller;

import com.nomadrent.dto.PaginaResponse;
import com.nomadrent.dto.ProductoRequest;
import com.nomadrent.dto.ProductoResponse;
import com.nomadrent.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping("/random")
    public List<ProductoResponse> random() {
        return service.listarAleatorios();
    }

    @GetMapping
    public PaginaResponse<ProductoResponse> listar(@RequestParam(defaultValue = "0") int page) {
        return service.listarPaginado(page);
    }

    @GetMapping("/{id}")
    public ProductoResponse detalle(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
