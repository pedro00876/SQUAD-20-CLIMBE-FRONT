package com.squad20.sistema_climbe.domain.notification.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import com.squad20.sistema_climbe.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

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
