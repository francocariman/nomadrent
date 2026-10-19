package com.nomadrent.security;

import com.nomadrent.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${nomadrent.jwt.secret}") String secret,
                      @Value("${nomadrent.jwt.expiration-minutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String generar(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    /** Devuelve el email del token si la firma y la expiración son válidas. */
    public Optional<String> emailDe(String token) {
        try {
            String sub = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Optional.ofNullable(sub);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
