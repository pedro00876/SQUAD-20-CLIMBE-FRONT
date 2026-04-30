package com.squad20.sistema_climbe.domain.service.dto;

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
public class ServiceCreateRequest {

    @NotBlank(message = "Nome do serviço é obrigatório")
    @Size(max = 255)
    private String name;
}
