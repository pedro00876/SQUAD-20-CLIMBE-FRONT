package com.squad20.sistema_climbe.config;

import com.squad20.sistema_climbe.domain.security.service.RefreshTokenService;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final com.squad20.sistema_climbe.domain.notification.service.NotificationService notificationService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        System.out.println("OAuth2 Login Sucesso: " + email);

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            System.out.println("Criando novo usuário OAuth2...");
            String numericCpf = UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 11);

            User newUser = User.builder()
                    .fullName(name != null ? name : "User OAuth2")
                    .email(email)
                    .cpf(numericCpf)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .status("PENDENTE")
                    .build();

            System.out.println("Salvando usuário no banco...");
            User savedUser = userRepository.save(newUser);
            System.out.println("Usuário salvo! Notificando admins...");
            notifyAdmins(savedUser);
            return savedUser;
        });

        System.out.println("Processando Tokens...");

        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());
            if (client != null && client.getRefreshToken() != null) {
                user.setGoogleRefreshToken(client.getRefreshToken().getTokenValue());
                userRepository.save(user);
            }
        }

        String jwtToken = jwtService.generateToken(user);
        refreshTokenService.deleteByUserId(user.getId());
        var refreshToken = refreshTokenService.createRefreshToken(user.getId());

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", jwtToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        String redirectTarget = "http://localhost:5173/dashboard";
        if (!"ATIVO".equalsIgnoreCase(user.getStatus())) {
            redirectTarget = "http://localhost:5173/pending-approval";
        }

        getRedirectStrategy().sendRedirect(request, response, redirectTarget);
    }

    private void notifyAdmins(User newUser) {
        userRepository.findByRole(com.squad20.sistema_climbe.domain.user.entity.Role.CEO).forEach(ceo -> {
            notificationService.save(com.squad20.sistema_climbe.domain.notification.dto.NotificationCreateRequest.builder()
                    .userId(ceo.getId())
                    .type("NEW_USER_PENDING")
                    .message("O usuário " + newUser.getFullName() + " (" + newUser.getEmail() + ") se cadastrou e aguarda aprovação de acesso.")
                    .build());
        });
    }
}
