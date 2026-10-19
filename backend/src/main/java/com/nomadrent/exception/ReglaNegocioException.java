package com.nomadrent.exception;

/** Error de regla de negocio: se responde con HTTP 400. */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) { super(mensaje); }
}
