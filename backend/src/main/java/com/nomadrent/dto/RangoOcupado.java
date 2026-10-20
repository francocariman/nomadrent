package com.nomadrent.dto;

import java.time.LocalDate;

/** Noches ocupadas desde `desde` (incluida) hasta `hasta` (excluida: es el día de salida). */
public record RangoOcupado(LocalDate desde, LocalDate hasta) {}
