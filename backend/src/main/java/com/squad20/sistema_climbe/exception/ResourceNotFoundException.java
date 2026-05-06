package com.squad20.sistema_climbe.exception;

/**
 * Exceção para recurso não encontrado (ex.: entidade por ID).
 * Mapeada para HTTP 404 no GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
