package com.nomadrent.controller;

import com.nomadrent.dto.FavoritoRequest;
import com.nomadrent.dto.FavoritoResponse;
import com.nomadrent.dto.FavoritoToggleResponse;
import com.nomadrent.service.FavoritoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Requiere usuario autenticado (regla en SecurityConfig). */
@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService service;

    public FavoritoController(FavoritoService service) {
        this.service = service;
    }

    /** Añade o quita (toggle) el producto de los favoritos del usuario autenticado. */
    @PostMapping
    public FavoritoToggleResponse alternar(@Valid @RequestBody FavoritoRequest request, Authentication auth) {
        return service.alternar(auth.getName(), request.productoId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication auth) {
        service.eliminar(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<FavoritoResponse> listar(@PathVariable Long usuarioId, Authentication auth) {
        return service.listar(usuarioId, auth.getName());
    }
}
