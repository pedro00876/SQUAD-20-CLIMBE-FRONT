package com.squad20.sistema_climbe.domain.cargo.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoDTO {

    private Long id;

    @Size(max = 255)
    private String name;
    
}
