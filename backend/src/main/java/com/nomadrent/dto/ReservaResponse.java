package com.nomadrent.dto;

import com.nomadrent.entity.Reserva;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public record ReservaResponse(
        Long id,
        Long productoId,
        String productoNombre,
        String productoCiudad,
        String productoImagen,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        long noches,
        double total,
        LocalTime horaLlegada,
        String comentarios,
        String emailContacto,
        LocalDateTime creadaEn
) {
    public static ReservaResponse from(Reserva r) {
        long noches = ChronoUnit.DAYS.between(r.getFechaInicio(), r.getFechaFin());
        var p = r.getProducto();
        String imagen = p.getImagenes().isEmpty() ? null : p.getImagenes().get(0);
        String contacto = r.getEmailContacto() != null ? r.getEmailContacto() : r.getUsuario().getEmail();
        return new ReservaResponse(r.getId(), p.getId(), p.getNombre(), p.getCiudad(), imagen,
                r.getFechaInicio(), r.getFechaFin(), noches, noches * p.getPrecio(),
                r.getHoraLlegada(), r.getComentarios(), contacto, r.getCreadaEn());
    }
}
