package com.nomadrent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CaracteristicaRequest(
        @NotBlank(message = "El nombre de la característica es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar los 80 caracteres") String nombre,
        @NotBlank(message = "Selecciona un ícono para la característica")
        @Size(max = 60, message = "El ícono no puede superar los 60 caracteres") String icono
) {}
