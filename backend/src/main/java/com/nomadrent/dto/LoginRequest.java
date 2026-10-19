package com.nomadrent.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Ingresa tu correo electrónico") String email,
        @NotBlank(message = "Ingresa tu contraseña") String password
) {}
