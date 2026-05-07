package com.squad20.sistema_climbe.domain.security.service;

import com.squad20.sistema_climbe.domain.security.entity.RefreshToken;
import com.squad20.sistema_climbe.domain.security.repository.RefreshTokenRepository;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import com.squad20.sistema_climbe.exception.TokenRefreshException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = findUserOrThrow(userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token expirou. Por favor, faça login novamente.");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        User user = findUserOrThrow(userId);
        return refreshTokenRepository.deleteByUser(user);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + userId));
    }
}
