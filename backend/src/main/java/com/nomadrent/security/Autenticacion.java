package com.nomadrent.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

public final class Autenticacion {
    private Autenticacion() {}

    /** Email del usuario autenticado o null si la petición es anónima. */
    public static String emailDe(Authentication auth) {
        if (auth == null || auth instanceof AnonymousAuthenticationToken || !auth.isAuthenticated()) return null;
        return auth.getName();
    }
}
