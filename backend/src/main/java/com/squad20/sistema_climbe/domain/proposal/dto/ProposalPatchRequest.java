package com.squad20.sistema_climbe.domain.proposal.dto;

import com.squad20.sistema_climbe.domain.proposal.entity.ProposalStatus;
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
public class ProposalPatchRequest {

    private Long enterpriseId;

    private Long userId;

    private Long responsibleAnalystId;

    private ProposalStatus status;
}
