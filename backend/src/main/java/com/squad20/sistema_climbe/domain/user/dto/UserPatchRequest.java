package com.squad20.sistema_climbe.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPatchRequest {

    @Size(min = 1, max = 255, message = "O nome deve ter entre 1 e 255 caracteres")
    private String fullName;

    @CPF(message = "CPF inválido")
    @Size(min = 11, max = 14)
    private String cpf;

    @Email(message = "E-mail inválido")
    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 255)
    private String status;
}
