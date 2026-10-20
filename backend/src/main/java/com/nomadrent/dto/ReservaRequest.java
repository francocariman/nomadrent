package com.nomadrent.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        @NotNull(message = "El alojamiento es obligatorio") Long productoId,
        @NotNull(message = "Indica la fecha de entrada") LocalDate fechaInicio,
        @NotNull(message = "Indica la fecha de salida") LocalDate fechaFin,
        // Opcionales
        LocalTime horaLlegada,
        @Size(max = 500, message = "Los comentarios no pueden superar los 500 caracteres") String comentarios,
        @Size(max = 120, message = "El correo de contacto no puede superar los 120 caracteres")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Ingresa un correo de contacto válido") String emailContacto
) {}
