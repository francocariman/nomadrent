package com.nomadrent.dto;

import jakarta.validation.constraints.NotNull;

public record FavoritoRequest(@NotNull(message = "El producto es obligatorio") Long productoId) {}
