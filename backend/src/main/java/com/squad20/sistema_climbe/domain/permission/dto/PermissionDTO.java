package com.squad20.sistema_climbe.domain.permission.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDTO {

    private Long id;

    @Size(max = 255)
    private String description;
}

