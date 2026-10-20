package com.nomadrent.controller;

import com.nomadrent.dto.RangoOcupado;
import com.nomadrent.dto.ReservaRequest;
import com.nomadrent.dto.ReservaResponse;
import com.nomadrent.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    /** Público: alimenta el calendario del detalle. */
    @GetMapping("/productos/{productoId}/disponibilidad")
    public List<RangoOcupado> disponibilidad(@PathVariable Long productoId) {
        return service.disponibilidad(productoId);
    }

    @PostMapping("/reservas")
    public ResponseEntity<ReservaResponse> crear(@Valid @RequestBody ReservaRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(auth.getName(), request));
    }

    @GetMapping("/reservas/mias")
    public List<ReservaResponse> mias(Authentication auth) {
        return service.listarMias(auth.getName());
    }
}
