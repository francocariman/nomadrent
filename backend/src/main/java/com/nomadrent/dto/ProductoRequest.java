package com.nomadrent.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ProductoRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 150, message = "El nombre no puede superar los 150 caracteres") String nombre,
        @NotBlank(message = "La descripción es obligatoria") String descripcion,
        @NotNull(message = "La categoría es obligatoria") Long categoriaId,
        @NotBlank(message = "La ciudad es obligatoria") String ciudad,
        @NotNull(message = "El precio es obligatorio") @Positive(message = "El precio debe ser mayor a 0") Double precio,
        @NotEmpty(message = "Debes cargar al menos una imagen") List<@NotBlank(message = "Las URLs de imágenes no pueden estar vacías") String> imagenes,
        List<Long> caracteristicaIds,
        @Valid PoliticaDto politicas
) {}
