package com.nomadrent.dto;

import com.nomadrent.entity.Reserva;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record ReservaResponse(Long id, Long productoId, String productoNombre,
                              LocalDate fechaInicio, LocalDate fechaFin, long noches, double total) {
    public static ReservaResponse from(Reserva r) {
        long noches = ChronoUnit.DAYS.between(r.getFechaInicio(), r.getFechaFin());
        return new ReservaResponse(r.getId(), r.getProducto().getId(), r.getProducto().getNombre(),
                r.getFechaInicio(), r.getFechaFin(), noches, noches * r.getProducto().getPrecio());
    }
}
