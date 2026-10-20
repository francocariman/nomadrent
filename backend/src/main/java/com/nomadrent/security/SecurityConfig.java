package com.nomadrent.security;

import com.nomadrent.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, UsuarioRepository usuarios) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)           // API stateless con JWT: no hay cookies de sesión
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Se usan AntPathRequestMatcher porque la consola H2 registra un servlet adicional.
            .authorizeHttpRequests(a -> a
                .requestMatchers(antMatcher(HttpMethod.OPTIONS, "/**")).permitAll()
                .requestMatchers(antMatcher("/h2-console/**")).permitAll()
                .requestMatchers(antMatcher("/api/auth/**")).permitAll()
                // Lectura pública del catálogo
                .requestMatchers(antMatcher(HttpMethod.GET, "/api/productos/**")).permitAll()
                .requestMatchers(antMatcher(HttpMethod.GET, "/api/caracteristicas/**")).permitAll()
                .requestMatchers(antMatcher(HttpMethod.GET, "/api/categorias/**")).permitAll()
                // Acciones de cualquier usuario autenticado (USER o ADMIN)
                .requestMatchers(antMatcher(HttpMethod.POST, "/api/productos/*/resenas")).authenticated()
                .requestMatchers(antMatcher("/api/favoritos/**")).authenticated()
                .requestMatchers(antMatcher("/api/reservas/**")).authenticated()
                // Todo lo demás de la API (crear/editar/eliminar, usuarios) es solo para administradores
                .requestMatchers(antMatcher("/api/**")).hasRole("ADMIN")
                .anyRequest().permitAll())
            .headers(h -> h.frameOptions(f -> f.sameOrigin())) // necesario para la consola H2
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> json(res, 401, "Debes iniciar sesión para realizar esta acción."))
                .accessDeniedHandler((req, res, ex) -> json(res, 403, "No tienes permisos para realizar esta acción.")))
            .addFilterBefore(new JwtAuthFilter(jwtService, usuarios), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private static void json(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"mensaje\":\"" + mensaje + "\"}");
    }
}
