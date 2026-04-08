package com.squad20.sistema_climbe.exception;

/**
 * Exceção para conflito (ex.: e-mail ou CPF já cadastrado). Retorna HTTP 409 (Conflict).
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
