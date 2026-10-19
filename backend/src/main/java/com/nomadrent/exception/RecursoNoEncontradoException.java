package com.nomadrent.exception;

/** Recurso inexistente: se responde con HTTP 404. */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) { super(mensaje); }
}
