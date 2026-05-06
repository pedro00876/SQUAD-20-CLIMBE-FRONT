package com.squad20.sistema_climbe.domain.proposal.dto;

import jakarta.validation.constraints.NotNull;
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
public class ProposalCreateRequest {

    @NotNull(message = "ID da empresa é obrigatório")
    private Long enterpriseId;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long userId;

    private LocalDateTime createdAt;
}
