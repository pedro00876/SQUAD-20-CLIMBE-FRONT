package com.squad20.sistema_climbe.domain.contract.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDTO {

    private Long id;

    @NotNull(message = "ID da proposta é obrigatório")
    private Long proposalId;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 50)
    private String status;
}
