package com.squad20.sistema_climbe.domain.enterprise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
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
public class EnterprisePatchRequest {

    @Size(min = 1, max = 255, message = "A razão social deve ter entre 1 e 255 caracteres")
    private String legalName;

    @Size(max = 255)
    private String tradeName;

    @Pattern(regexp = "\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}", message = "CNPJ inválido")
    @Size(max = 18)
    private String cnpj;

    @Valid
    private AddressPatchRequest address;

    @Size(max = 50)
    private String phone;

    @Email(message = "E-mail inválido")
    @Size(max = 255)
    private String email;

    @Size(max = 255)
    private String representativeName;

    @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "CPF do representante inválido")
    @Size(max = 14)
    private String representativeCpf;

    @Size(max = 50)
    private String representativePhone;
}
