package com.squad20.sistema_climbe.domain.report.entity;

import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "relatorios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relatorio")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contract contract;

    @Column(name = "url_pdf", length = 1000)
    private String pdfUrl;

    @Column(name = "data_envio")
    private LocalDateTime sentAt;
}
