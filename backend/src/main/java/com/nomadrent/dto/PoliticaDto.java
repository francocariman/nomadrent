package com.nomadrent.dto;

import com.nomadrent.entity.Politica;
import jakarta.validation.constraints.Size;

public record PoliticaDto(
        @Size(max = 3000, message = "Las normas de la casa no pueden superar los 3000 caracteres") String normas,
        @Size(max = 3000, message = "Salud y seguridad no puede superar los 3000 caracteres") String saludSeguridad,
        @Size(max = 3000, message = "La política de cancelación no puede superar los 3000 caracteres") String cancelacion
) {
    public static PoliticaDto from(Politica p) {
        if (p == null) return new PoliticaDto("", "", "");
        return new PoliticaDto(nvl(p.getNormas()), nvl(p.getSaludSeguridad()), nvl(p.getCancelacion()));
    }

    public Politica toEntity() {
        return new Politica(limpiar(normas), limpiar(saludSeguridad), limpiar(cancelacion));
    }

    private static String nvl(String s) { return s == null ? "" : s; }
    private static String limpiar(String s) { return s == null ? "" : s.trim(); }
}
