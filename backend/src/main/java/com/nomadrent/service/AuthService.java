package com.nomadrent.service;

import com.nomadrent.dto.AuthResponse;
import com.nomadrent.dto.LoginRequest;
import com.nomadrent.dto.RegisterRequest;
import com.nomadrent.dto.UsuarioResponse;
import com.nomadrent.entity.Rol;
import com.nomadrent.entity.Usuario;
import com.nomadrent.exception.CredencialesInvalidasException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.UsuarioRepository;
import com.nomadrent.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse registrar(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ReglaNegocioException("Ya existe una cuenta con ese correo electrónico. Inicia sesión o usa otro correo.");
        }
        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRol(Rol.USER); // el rol ADMIN solo lo otorga otro administrador
        u = usuarios.save(u);
        return new AuthResponse(jwt.generar(u), UsuarioResponse.from(u));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Usuario u = usuarios.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(CredencialesInvalidasException::new);
        // Mismo mensaje para email inexistente y contraseña errónea: no revela qué cuentas existen
        if (!encoder.matches(req.password(), u.getPassword())) {
            throw new CredencialesInvalidasException();
        }
        return new AuthResponse(jwt.generar(u), UsuarioResponse.from(u));
    }
}
