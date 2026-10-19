package com.nomadrent.exception;

/** Login fallido: se responde con HTTP 401. */
public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException() {
        super("Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.");
    }
}
