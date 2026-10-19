package com.nomadrent.security;

import com.nomadrent.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el header "Authorization: Bearer ...", valida el token y carga el rol ACTUAL desde la BD,
 * de modo que añadir o quitar permisos de administrador se aplique de inmediato.
 * No es un @Component a propósito: se registra solo dentro de la cadena de Spring Security.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarios;

    public JwtAuthFilter(JwtService jwtService, UsuarioRepository usuarios) {
        this.jwtService = jwtService;
        this.usuarios = usuarios;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            jwtService.emailDe(header.substring(7))
                    .flatMap(usuarios::findByEmailIgnoreCase)
                    .ifPresent(u -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                u.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name())));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
        }
        chain.doFilter(request, response);
    }
}
