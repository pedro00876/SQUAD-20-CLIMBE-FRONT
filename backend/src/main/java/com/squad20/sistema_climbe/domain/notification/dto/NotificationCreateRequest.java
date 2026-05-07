package com.squad20.sistema_climbe.domain.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class NotificationCreateRequest {

    @NotNull(message = "ID do usuário é obrigatório")
    private Long userId;

    @NotBlank(message = "Mensagem da notificação é obrigatória")
    @Size(max = 1000)
    private String message;

    private LocalDateTime sentAt;

    @Size(max = 50)
    private String type;
}
