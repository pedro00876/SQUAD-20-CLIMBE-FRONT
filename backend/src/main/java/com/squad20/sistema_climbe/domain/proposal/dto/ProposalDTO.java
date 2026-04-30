package com.squad20.sistema_climbe.domain.proposal.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposalDTO {

    private Long id;

    private Long enterpriseId;

    private String enterpriseName;

    private Long userId;

    private String userName;

    private Long responsibleAnalystId;

    private String responsibleAnalystName;

    @Size(max = 50)
    private String status;

    private LocalDateTime createdAt;
}
