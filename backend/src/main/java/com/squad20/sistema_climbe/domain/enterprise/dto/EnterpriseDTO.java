package com.squad20.sistema_climbe.domain.enterprise.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseDTO {

    private Long id;

    @Size(max = 255)
    private String legalName;

    @Size(max = 255)
    private String tradeName;

    @Size(max = 18)
    private String cnpj;

    private AddressDTO address;

    @Size(max = 50)
    private String phone;

    @Size(max = 255)
    private String email;

    @Size(max = 255)
    private String representativeName;

    @Size(max = 14)
    private String representativeCpf;

    @Size(max = 50)
    private String representativePhone;
}
