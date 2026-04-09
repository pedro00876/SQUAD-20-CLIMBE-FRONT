package com.squad20.sistema_climbe.domain.proposal.dto;

import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "ID da empresa é obrigatório")
    private Long enterpriseId;

    private String enterpriseName;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long userId;

    private String userName;

    @Size(max = 50)
    private String status;

    private LocalDateTime createdAt;
}
