package com.nomadrent.dto;

import com.nomadrent.entity.Rol;
import jakarta.validation.constraints.NotNull;

public record RolRequest(@NotNull(message = "El rol es obligatorio") Rol rol) {}
