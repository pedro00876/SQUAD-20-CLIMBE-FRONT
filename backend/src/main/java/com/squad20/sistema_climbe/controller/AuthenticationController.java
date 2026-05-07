package com.squad20.sistema_climbe.controller;


import com.squad20.sistema_climbe.dto.AuthenticationRequest;
import com.squad20.sistema_climbe.dto.AuthenticationResponse;
import com.squad20.sistema_climbe.dto.RegisterRequest;
import com.squad20.sistema_climbe.dto.RequestAccessRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
                .sameSite("Lax")
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

    @Operation(summary = "Solicitar acesso", description = "Solicita aprovação de acesso para um usuário pendente")
    @PostMapping("/request-access")
    public ResponseEntity<Void> requestAccess(@Valid @RequestBody RequestAccessRequest request) {
        service.requestAccess(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obter usuário logado", description = "Retorna os dados do usuário autenticado na sessão")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        UserDTO user = service.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    private org.springframework.http.HttpHeaders generateAuthCookies(String accessToken, String refreshToken) {
        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 60) // 30 minutes
                .sameSite("Lax")
                .build();

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
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
                .sameSite("Lax")
                .build();

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(0) 
                .sameSite("Lax")
                .build();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return headers;
    }
}
