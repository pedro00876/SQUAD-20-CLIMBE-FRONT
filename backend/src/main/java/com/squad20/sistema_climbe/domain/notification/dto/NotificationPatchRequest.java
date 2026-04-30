package com.squad20.sistema_climbe.domain.notification.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPatchRequest {

    private Long userId;

    @Size(min = 1, max = 1000, message = "A mensagem deve ter entre 1 e 1000 caracteres")
    private String message;

    private LocalDateTime sentAt;

    @Size(max = 50)
    private String type;
}
