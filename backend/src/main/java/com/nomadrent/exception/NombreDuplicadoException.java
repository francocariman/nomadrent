package com.nomadrent.exception;

public class NombreDuplicadoException extends RuntimeException {
    public NombreDuplicadoException(String nombre) {
        super("Ya existe un producto con el nombre \"" + nombre + "\". Elige un nombre diferente.");
    }
}
