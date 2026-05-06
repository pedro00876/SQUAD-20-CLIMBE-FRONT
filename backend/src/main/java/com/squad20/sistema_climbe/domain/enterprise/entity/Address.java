package com.squad20.sistema_climbe.domain.enterprise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Column(name = "logradouro", length = 255)
    private String street;

    @Column(name = "numero", length = 255)
    private String number;

    @Column(name = "bairro", length = 255)
    private String neighborhood;

    @Column(name = "cidade", length = 255)
    private String city;

    @Column(name = "uf", length = 2)
    private String state;

    @Column(name = "cep", length = 10)
    private String zipCode;
}
