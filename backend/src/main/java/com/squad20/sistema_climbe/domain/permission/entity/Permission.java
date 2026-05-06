package com.squad20.sistema_climbe.domain.permission.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "permissoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permissao")
    private Long id;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(name = "descricao", nullable = false, length = 255)
    private String description;
}
