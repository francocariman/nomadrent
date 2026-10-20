package com.nomadrent.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static ResponseEntity<Map<String, String>> respuesta(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of("mensaje", mensaje));
    }

    @ExceptionHandler(NombreDuplicadoException.class)
    public ResponseEntity<Map<String, String>> duplicado(NombreDuplicadoException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, String>> regla(ReglaNegocioException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Red de seguridad ante condiciones de carrera sobre restricciones UNIQUE. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridad(DataIntegrityViolationException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "Ya existe un registro con esos datos.");
    }

    @ExceptionHandler({ProductoNoEncontradoException.class, RecursoNoEncontradoException.class})
    public ResponseEntity<Map<String, String>> noEncontrado(RuntimeException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, String>> credenciales(CredencialesInvalidasException ex) {
        return respuesta(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<Map<String, String>> accesoDenegado(AccesoDenegadoException ex) {
        return respuesta(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> parametroInvalido(MethodArgumentTypeMismatchException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "El valor del parámetro \"" + ex.getName() + "\" no es válido.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacion(MethodArgumentNotValidException ex) {
        String detalle = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getDefaultMessage())
                .collect(Collectors.joining(" · "));
        return respuesta(HttpStatus.BAD_REQUEST, detalle);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> cuerpoInvalido(HttpMessageNotReadableException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "La solicitud tiene un formato inválido.");
    }
}
