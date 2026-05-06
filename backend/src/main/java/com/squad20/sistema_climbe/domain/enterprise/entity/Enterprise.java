package com.squad20.sistema_climbe.domain.enterprise.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import com.squad20.sistema_climbe.domain.service.entity.OfferedService;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.Set;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enterprise extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long id;

    @Column(name = "razao_social", nullable = false)
    private String legalName;

    @Column(name = "nome_fantasia")
    private String tradeName;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(nullable = false)
    private String cnpj;

    @Embedded
    private Address address;

    @Column(name = "telefone")
    private String phone;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(nullable = false)
    private String email;

    @Column(name = "representante_nome")
    private String representativeName;

    @Column(name = "representante_cpf", length = 14)
    private String representativeCpf;

    @Column(name = "representante_contato")
    private String representativePhone;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "empresa_servico",
            joinColumns = @JoinColumn(name = "id_empresa"),
            inverseJoinColumns = @JoinColumn(name = "id_servico")
    )
    private Set<OfferedService> services;
}
