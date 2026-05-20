package com.squad20.sistema_climbe.domain.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {
    @NotBlank
    @Email
    private String para;
    
    @NotBlank
    private String assunto;
    
    @NotBlank
    private String corpo;
}
