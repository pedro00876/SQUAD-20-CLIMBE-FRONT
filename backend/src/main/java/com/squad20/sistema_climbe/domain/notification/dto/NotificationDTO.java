package com.squad20.sistema_climbe.domain.notification.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;

    private Long userId;

    private String userName;

    @Size(max = 1000)
    private String message;

    private LocalDateTime sentAt;

    @Size(max = 50)
    private String type;
}

