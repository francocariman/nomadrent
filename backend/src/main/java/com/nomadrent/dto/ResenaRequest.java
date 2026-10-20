package com.nomadrent.dto;

import jakarta.validation.constraints.*;

public record ResenaRequest(
        @NotNull(message = "Elige una puntuación de 1 a 5 estrellas")
        @Min(value = 1, message = "La puntuación mínima es 1") @Max(value = 5, message = "La puntuación máxima es 5") Integer puntuacion,
        @NotBlank(message = "Escribe un comentario")
        @Size(max = 1000, message = "El comentario no puede superar los 1000 caracteres") String comentario
) {}
