package com.squad20.sistema_climbe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String token;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken;
}
