package com.squad20.sistema_climbe.domain.spreadsheet.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpreadsheetDTO {

    private Long id;

    private Long contractId;

    @Size(max = 1000)
    private String googleSheetsUrl;

    private Boolean locked;

    @Size(max = 100)
    private String viewPermission;
}

