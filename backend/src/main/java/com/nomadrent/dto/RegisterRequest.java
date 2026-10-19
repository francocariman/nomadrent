package com.nomadrent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Pattern(regexp = "^[\\p{L}][\\p{L} '\\-]{1,59}$", message = "El nombre debe tener entre 2 y 60 letras, sin números")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Pattern(regexp = "^[\\p{L}][\\p{L} '\\-]{1,59}$", message = "El apellido debe tener entre 2 y 60 letras, sin números")
        String apellido,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Ingresa un correo electrónico válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "La contraseña debe incluir al menos una letra y un número")
        String password
) {}
