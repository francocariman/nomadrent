package com.nomadrent.controller;

import com.nomadrent.dto.*;
import com.nomadrent.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    /** Autocompletado del buscador: ciudades y nombres que coinciden con `q`. */
    @GetMapping("/sugerencias")
    public List<SugerenciaResponse> sugerencias(@RequestParam(defaultValue = "") String q) {
        return service.sugerencias(q);
    }

    /**
     * Fechas libres más cercanas para un destino sin disponibilidad en el rango pedido.
     * GET /api/productos/alternativas?destino=cordoba&desde=2026-11-01&hasta=2026-11-05[&categorias=1,2]
     */
    @GetMapping("/alternativas")
    public List<AlternativaResponse> alternativas(
            @RequestParam String destino,
            @RequestParam(required = false) List<Long> categorias,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.alternativas(destino, categorias, desde, hasta);
    }

    /** GET /api/productos?page=0&categorias=1,2&destino=cordoba&desde=2026-11-01&hasta=2026-11-05 */
    @GetMapping
    public PaginaResponse<ProductoResponse> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) List<Long> categorias,
            @RequestParam(required = false) String destino,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.listarPaginado(page, categorias, destino, desde, hasta);
    }

    @GetMapping("/{id}")
    public ProductoResponse detalle(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @PutMapping("/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
