package com.nomadrent.controller;

import com.nomadrent.dto.RolRequest;
import com.nomadrent.dto.UsuarioResponse;
import com.nomadrent.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Solo ADMIN (regla en SecurityConfig). */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return service.listar();
    }

    @PatchMapping("/{id}/rol")
    public UsuarioResponse cambiarRol(@PathVariable Long id, @Valid @RequestBody RolRequest request,
                                      Authentication auth) {
        return service.cambiarRol(id, request.rol(), auth.getName());
    }
}
