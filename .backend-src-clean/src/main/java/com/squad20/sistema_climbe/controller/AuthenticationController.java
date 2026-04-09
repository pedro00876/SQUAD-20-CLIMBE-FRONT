package com.squad20.sistema_climbe.controller;


import com.squad20.sistema_climbe.dto.AuthenticationRequest;
import com.squad20.sistema_climbe.dto.AuthenticationResponse;
import com.squad20.sistema_climbe.dto.RegisterRequest;
import com.squad20.sistema_climbe.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@Tag(name = "Auth", description = "Authenticação do sistema")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @Operation(summary = "Register", description = "Rota para registra Usuarios")
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthenticationResponse response = service.register(request);
        return ResponseEntity.ok()
                .headers(generateAuthCookies(response.getToken(), response.getRefreshToken()))
                .body(response);
    }

    @Operation(summary = "Login", description = "Rota para logar Usuarios")
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody AuthenticationRequest request
    ) {
        AuthenticationResponse response = service.authenticate(request);
        return ResponseEntity.ok()
                .headers(generateAuthCookies(response.getToken(), response.getRefreshToken()))
                .body(response);
    }

    @Operation(summary = "Refresh Token", description = "Gera um novo Access Token a partir de um Refresh Token no Cookie")
    @PostMapping("/refresh")
    public ResponseEntity<com.squad20.sistema_climbe.dto.TokenRefreshResponse> refreshToken(
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken") String refreshToken
    ) {
        com.squad20.sistema_climbe.dto.TokenRefreshResponse response = service.refreshToken(refreshToken);
        
        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from("accessToken", response.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 60) // 30 minutes
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(response);
    }

    @Operation(summary = "Logout", description = "Desloga o usuário e limpa o Refresh Token")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .headers(clearAuthCookies())
                .build();
    }

    private org.springframework.http.HttpHeaders generateAuthCookies(String accessToken, String refreshToken) {
        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 60) // 30 minutes
                .sameSite("Strict")
                .build();

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return headers;
    }

    private org.springframework.http.HttpHeaders clearAuthCookies() {
        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) 
                .sameSite("Strict")
                .build();

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(0) 
                .sameSite("Strict")
                .build();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return headers;
    }
}
