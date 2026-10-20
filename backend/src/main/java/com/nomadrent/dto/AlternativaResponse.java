package com.nomadrent.dto;

import java.time.LocalDate;

/**
 * Ventana libre más cercana a la búsqueda original, con la misma cantidad de noches.
 * desplazamientoDias: positivo = empieza N días DESPUÉS de la entrada pedida; negativo = N días ANTES.
 */
public record AlternativaResponse(
        Long productoId,
        String nombre,
        String ciudad,
        String imagen,
        Double precio,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        long noches,
        long desplazamientoDias,
        double total
) {}
