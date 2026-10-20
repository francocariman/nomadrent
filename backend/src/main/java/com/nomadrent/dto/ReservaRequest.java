package com.nomadrent.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ReservaRequest(
        @NotNull(message = "El alojamiento es obligatorio") Long productoId,
        @NotNull(message = "Indica la fecha de entrada") LocalDate fechaInicio,
        @NotNull(message = "Indica la fecha de salida") LocalDate fechaFin
) {}
