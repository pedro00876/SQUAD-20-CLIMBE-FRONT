package com.squad20.sistema_climbe.domain.spreadsheet.entity;

import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "planilhas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Spreadsheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_planilha")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contract contract;

    @Column(name = "url_google_sheets", length = 1000)
    private String googleSheetsUrl;

    @Column(name = "bloqueada")
    private Boolean locked;

    @Column(name = "permissao_visualizacao", length = 100)
    private String viewPermission;
}

