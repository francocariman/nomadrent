package com.nomadrent.dto;

import com.nomadrent.entity.Rol;
import com.nomadrent.entity.Usuario;

public record UsuarioResponse(Long id, String nombre, String apellido, String email, Rol rol) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getApellido(), u.getEmail(), u.getRol());
    }
}
