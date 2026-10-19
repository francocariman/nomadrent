package com.nomadrent.service;

import com.nomadrent.dto.UsuarioResponse;
import com.nomadrent.entity.Rol;
import com.nomadrent.entity.Usuario;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;

    public UsuarioService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarios.findAll(Sort.by("id")).stream().map(UsuarioResponse::from).toList();
    }

    @Transactional
    public UsuarioResponse cambiarRol(Long id, Rol nuevoRol, String emailActual) {
        Usuario u = usuarios.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró el usuario con id " + id + "."));
        if (u.getEmail().equalsIgnoreCase(emailActual)) {
            throw new ReglaNegocioException("No puedes modificar tu propio rol.");
        }
        if (u.getRol() == Rol.ADMIN && nuevoRol != Rol.ADMIN && usuarios.countByRol(Rol.ADMIN) <= 1) {
            throw new ReglaNegocioException("Debe existir al menos un administrador.");
        }
        u.setRol(nuevoRol);
        return UsuarioResponse.from(usuarios.save(u));
    }
}
