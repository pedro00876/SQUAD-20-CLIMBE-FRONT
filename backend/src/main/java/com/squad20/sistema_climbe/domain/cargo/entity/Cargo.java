package com.squad20.sistema_climbe.domain.cargo.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "cargos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cargo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cargo")
    private Long id;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(name = "nome_cargo", nullable = false, length = 255)
    private String name;

}
