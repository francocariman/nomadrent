package com.nomadrent.dto;

import com.nomadrent.entity.Resena;
import java.time.LocalDateTime;

public record ResenaResponse(Long id, int puntuacion, String comentario, LocalDateTime fecha, String autor) {
    public static ResenaResponse from(Resena r) {
        String ap = r.getUsuario().getApellido();
        String autor = r.getUsuario().getNombre() + (ap == null || ap.isBlank() ? "" : " " + ap.charAt(0) + ".");
        return new ResenaResponse(r.getId(), r.getPuntuacion(), r.getComentario(), r.getFecha(), autor);
    }
}
