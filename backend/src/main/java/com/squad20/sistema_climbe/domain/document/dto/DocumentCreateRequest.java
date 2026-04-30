package com.squad20.sistema_climbe.domain.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCreateRequest {

    @NotNull(message = "ID da empresa é obrigatório")
    private Long enterpriseId;

    private Long proposalId;

    @Size(max = 100)
    private String documentType;

    @Size(max = 1000)
    private String url;

    private Boolean validated;

    private Long analystId;
}
