package com.squad20.sistema_climbe.domain.cargo.dto;

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
public class CargoPatchRequest {

    @Size(min = 1, max = 255, message = "O nome do cargo deve ter entre 1 e 255 caracteres")
    private String name;
}
