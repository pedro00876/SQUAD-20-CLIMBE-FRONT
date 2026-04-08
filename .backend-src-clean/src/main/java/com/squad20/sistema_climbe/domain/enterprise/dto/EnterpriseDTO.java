package com.squad20.sistema_climbe.domain.enterprise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseDTO {

    private Long id;

    @NotBlank(message = "Razão social é obrigatória")
    @Size(max = 255)
    private String legalName;

    @Size(max = 255)
    private String tradeName;

    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}", message = "CNPJ inválido")
    @Size(max = 18)
    private String cnpj;

    @Valid
    private AddressDTO address;

    @Size(max = 50)
    private String phone;

    @NotBlank(message = "E-mail é obrigatório")
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
