package com.squad20.sistema_climbe.domain.report.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {

    private Long id;

    @NotNull(message = "ID do contrato é obrigatório")
    private Long contractId;

    @Size(max = 1000)
    private String pdfUrl;

    private LocalDateTime sentAt;
}
