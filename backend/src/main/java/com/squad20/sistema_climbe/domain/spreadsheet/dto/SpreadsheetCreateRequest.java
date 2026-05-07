package com.squad20.sistema_climbe.domain.spreadsheet.dto;

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
public class SpreadsheetCreateRequest {

    @NotNull(message = "ID do contrato é obrigatório")
    private Long contractId;

    @Size(max = 1000)
    private String googleSheetsUrl;

    private Boolean locked;

    @Size(max = 100)
    private String viewPermission;
}
