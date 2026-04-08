package com.squad20.sistema_climbe.domain.permission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDTO {

    private Long id;

    @NotBlank(message = "Descrição da permissão é obrigatória")
    @Size(max = 255)
    private String description;
}

