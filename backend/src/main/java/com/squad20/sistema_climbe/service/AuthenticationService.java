package com.squad20.sistema_climbe.service;
import com.squad20.sistema_climbe.dto.AuthenticationRequest;
import com.squad20.sistema_climbe.dto.AuthenticationResponse;
import com.squad20.sistema_climbe.dto.RegisterRequest;
import com.squad20.sistema_climbe.dto.TokenRefreshResponse;
import com.squad20.sistema_climbe.exception.ConflictException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import com.squad20.sistema_climbe.exception.TokenRefreshException;
import com.squad20.sistema_climbe.exception.BadRequestException;
import com.squad20.sistema_climbe.exception.PendingApprovalException;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import com.squad20.sistema_climbe.domain.security.entity.RefreshToken;
import com.squad20.sistema_climbe.domain.security.service.RefreshTokenService;
import com.squad20.sistema_climbe.domain.notification.service.NotificationService;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationCreateRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.domain.user.mapper.UserMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final NotificationService notificationService;
    private final UserMapper userMapper;

    public AuthenticationResponse register(RegisterRequest request) {

        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Este e-mail já está em uso.");
        }
        if (repository.findByCpf(request.getCpf()).isPresent()) {
            throw new ConflictException("Este CPF já está cadastrado.");
        }

        var user = User.builder()
                .fullName(request.getFullName())
                .cpf(request.getCpf())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status("PENDENTE")
                .build();

        repository.save(user);
        repository.findByRole(Role.CEO).forEach(ceo -> {
            notificationService.save(NotificationCreateRequest.builder()
                    .userId(ceo.getId())
                    .type("NEW_USER_PENDING")
                    .message("O usuário " + user.getFullName() + " (" + user.getEmail() + ") se cadastrou e aguarda aprovação de acesso.")
                    .build());
        });

        throw new PendingApprovalException("PENDING_APPROVAL");
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws AuthenticationException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!"ATIVO".equalsIgnoreCase(user.getStatus())) {
            throw new PendingApprovalException("PENDING_APPROVAL");
        }

        var jwtToken = jwtService.generateToken(user);

        refreshTokenService.deleteByUserId(user.getId());
        var refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public TokenRefreshResponse refreshToken(String refreshToken) {
        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    if (!"ATIVO".equalsIgnoreCase(user.getStatus())) {
                        throw new PendingApprovalException("PENDING_APPROVAL");
                    }
                    String token = jwtService.generateToken(user);
                    return TokenRefreshResponse.builder()
                            .accessToken(token)
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token não encontrado no banco."));
    }

    public void requestAccess(String email) {
        User user = repository.findByEmail(email)
                .orElseGet(() -> createPendingFirstAccessUser(email));

        if ("ATIVO".equals(user.getStatus())) {
            throw new BadRequestException("Este usuário já possui acesso ativo. Por favor, faça login.");
        }

        if (!"PENDENTE".equals(user.getStatus())) {
            throw new BadRequestException("Este usuário não possui uma solicitação de acesso pendente.");
        }

        // Notificar administradores
        repository.findByRole(Role.CEO).forEach(ceo -> {
            notificationService.save(NotificationCreateRequest.builder()
                    .userId(ceo.getId())
                    .type("ACCESS_REQUEST_REMINDER")
                    .message("O usuário " + user.getFullName() + " (" + user.getEmail() + ") solicitou novamente a aprovação do seu acesso.")
                    .build());
        });
    }

    private User createPendingFirstAccessUser(String email) {
        String numericCpf = UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 11);
        String fallbackName = email != null && email.contains("@")
                ? email.substring(0, email.indexOf("@"))
                : "Usuário";

        User pendingUser = User.builder()
                .fullName(fallbackName)
                .email(email)
                .cpf(numericCpf)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .status("PENDENTE")
                .build();

        return repository.save(pendingUser);
    }

    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null; // Ou lançar exceção customizada
        }

        String email = authentication.getName();
        return repository.findByEmail(email)
                .map(userMapper::toDTO)
                .orElse(null);
    }
}
