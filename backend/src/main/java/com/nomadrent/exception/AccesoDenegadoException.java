package com.nomadrent.exception;

/** El usuario autenticado no puede acceder a ese recurso: HTTP 403. */
public class AccesoDenegadoException extends RuntimeException {
    public AccesoDenegadoException(String mensaje) { super(mensaje); }
}
