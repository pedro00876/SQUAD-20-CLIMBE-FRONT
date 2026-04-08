package com.squad20.sistema_climbe.domain.permission.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permissao")
    private Long id;

    @Column(name = "descricao", unique = true, nullable = false, length = 255)
    private String description;
}

