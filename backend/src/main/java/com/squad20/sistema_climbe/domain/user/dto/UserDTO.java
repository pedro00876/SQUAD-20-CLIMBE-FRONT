package com.squad20.sistema_climbe.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.*;
import com.squad20.sistema_climbe.domain.user.entity.Role;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    @Size(max = 255)
    private String fullName;

    @Size(min = 11, max = 14)
    private String cpf;

    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 255)
    private String status;

    private Role role;
}
