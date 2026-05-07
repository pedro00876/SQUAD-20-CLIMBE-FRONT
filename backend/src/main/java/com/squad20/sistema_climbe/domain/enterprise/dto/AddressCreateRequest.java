package com.squad20.sistema_climbe.domain.enterprise.dto;

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
public class AddressCreateRequest {

    @Size(max = 255)
    private String street;

    @Size(max = 255)
    private String number;

    @Size(max = 255)
    private String neighborhood;

    @Size(max = 255)
    private String city;

    @Size(max = 2)
    private String state;

    @Size(max = 10)
    private String zipCode;
}
