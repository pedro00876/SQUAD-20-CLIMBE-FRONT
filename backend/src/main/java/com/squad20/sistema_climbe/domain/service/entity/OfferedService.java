package com.squad20.sistema_climbe.domain.service.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "servicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferedService extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servico")
    private Long id;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(name = "nome", nullable = false, length = 255)
    private String name;
}
