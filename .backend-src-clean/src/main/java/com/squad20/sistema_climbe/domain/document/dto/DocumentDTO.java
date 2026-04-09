package com.squad20.sistema_climbe.domain.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {

    private Long id;

    @NotNull(message = "ID da empresa é obrigatório")
    private Long enterpriseId;

    private String enterpriseName;

    @Size(max = 100)
    private String documentType;

    @Size(max = 1000)
    private String url;

    private Boolean validated;

    private Long analystId;

    private String analystName;
}
