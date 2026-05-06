package com.squad20.sistema_climbe.controller;

import com.google.api.services.calendar.model.Event;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.service.GoogleCalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Tag(name = "Google Calendar", description = "Endpoints para integração com Google Calendar")
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {

    private final GoogleCalendarService calendarService;
    private final UserRepository userRepository;

    @Operation(summary = "Listar eventos", description = "Lista os próximos eventos do Google Calendar do usuário logado")
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getGoogleRefreshToken() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Note: In a real app, you might want to exchange refresh token for access token if needed,
            // or use a service account. Here we assume the service handles it.
            // For listing, we might need a valid access token.
            // If the user logged in via Google, we might have the token in the session or need to refresh it.
            List<Event> events = calendarService.listUpcomingEvents(user.getGoogleRefreshToken());
            return ResponseEntity.ok(events);
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
