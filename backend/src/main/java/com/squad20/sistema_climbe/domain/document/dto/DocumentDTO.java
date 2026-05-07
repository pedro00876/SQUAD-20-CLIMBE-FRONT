package com.squad20.sistema_climbe.domain.document.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {

    private Long id;

    private Long enterpriseId;

    private String enterpriseName;

    private Long proposalId;

    @Size(max = 100)
    private String documentType;

    @Size(max = 1000)
    private String url;

    private Boolean validated;

    private Long analystId;

    private String analystName;
}
