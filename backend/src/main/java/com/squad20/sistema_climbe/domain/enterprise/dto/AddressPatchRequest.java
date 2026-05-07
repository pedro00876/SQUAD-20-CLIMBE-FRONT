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
public class AddressPatchRequest {

    @Size(min = 1, max = 255)
    private String street;

    @Size(min = 1, max = 255)
    private String number;

    @Size(min = 1, max = 255)
    private String neighborhood;

    @Size(min = 1, max = 255)
    private String city;

    @Size(min = 2, max = 2)
    private String state;

    @Size(min = 1, max = 10)
    private String zipCode;
}
