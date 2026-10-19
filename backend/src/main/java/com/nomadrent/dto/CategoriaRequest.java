package com.nomadrent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El título de la categoría es obligatorio")
        @Size(max = 80, message = "El título no puede superar los 80 caracteres") String titulo,
        @NotBlank(message = "La descripción de la categoría es obligatoria")
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres") String descripcion,
        @NotBlank(message = "La imagen representativa es obligatoria") String imagen
) {}
