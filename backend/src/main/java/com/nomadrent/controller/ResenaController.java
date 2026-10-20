package com.nomadrent.controller;

import com.nomadrent.dto.*;
import com.nomadrent.security.Autenticacion;
import com.nomadrent.service.ResenaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos/{productoId}/resenas")
public class ResenaController {

    private final ResenaService service;

    public ResenaController(ResenaService service) {
        this.service = service;
    }

    /** Público: reseñas + media calculada + total. */
    @GetMapping
    public ResenasResponse listar(@PathVariable Long productoId) {
        return service.listar(productoId);
    }

    /** Público (responde distinto si hay sesión): indica si el usuario puede dejar reseña. */
    @GetMapping("/elegibilidad")
    public ElegibilidadResenaResponse elegibilidad(@PathVariable Long productoId, Authentication auth) {
        return service.elegibilidad(Autenticacion.emailDe(auth), productoId);
    }

    /** Requiere sesión y una reserva previa en ese producto. */
    @PostMapping
    public ResponseEntity<ResenaResponse> crear(@PathVariable Long productoId,
                                                @Valid @RequestBody ResenaRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(auth.getName(), productoId, request));
    }
}
