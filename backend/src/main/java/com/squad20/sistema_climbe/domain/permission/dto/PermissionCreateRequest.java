package com.squad20.sistema_climbe.domain.permission.dto;

import jakarta.validation.constraints.NotBlank;
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
public class PermissionCreateRequest {

    @NotBlank(message = "Descrição da permissão é obrigatória")
    @Size(max = 255)
    private String description;
}
