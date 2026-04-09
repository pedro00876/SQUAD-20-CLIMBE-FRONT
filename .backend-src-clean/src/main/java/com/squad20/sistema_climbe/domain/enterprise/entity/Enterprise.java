package com.squad20.sistema_climbe.domain.enterprise.entity;

import com.squad20.sistema_climbe.domain.service.entity.OfferedService;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enterprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long id;

    @Column(name = "razao_social", nullable = false)
    private String legalName;

    @Column(name = "nome_fantasia")
    private String tradeName;

    @Column(unique = true, nullable = false)
    private String cnpj;

    @Embedded
    private Address address;

    @Column(name = "telefone")
    private String phone;

    @Column(unique = true, nullable = false)
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
