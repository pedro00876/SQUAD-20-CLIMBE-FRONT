package com.squad20.sistema_climbe.domain.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {

    private Long id;

    @NotBlank(message = "Nome do serviço é obrigatório")
    @Size(max = 255)
    private String name;
}

