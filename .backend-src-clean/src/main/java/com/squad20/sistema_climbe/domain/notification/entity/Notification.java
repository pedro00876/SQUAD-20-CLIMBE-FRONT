package com.squad20.sistema_climbe.domain.notification.entity;

import com.squad20.sistema_climbe.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacao")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private User user;

    @Column(name = "mensagem", nullable = false, length = 1000)
    private String message;

    @Column(name = "data_envio")
    private LocalDateTime sentAt;

    @Column(name = "tipo", length = 50)
    private String type;
}

