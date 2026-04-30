package com.squad20.sistema_climbe.domain.report.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPatchRequest {

    private Long contractId;

    @Size(max = 1000)
    private String pdfUrl;

    private LocalDateTime sentAt;
}
