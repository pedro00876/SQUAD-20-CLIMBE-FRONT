package com.squad20.sistema_climbe.exception;

/**
 * Exceção para regras de negócio que devem retornar HTTP 400 (Bad Request).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
