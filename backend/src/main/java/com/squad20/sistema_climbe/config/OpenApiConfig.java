package com.squad20.sistema_climbe.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sistemaClimbeOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        final String cookieAuthName = "cookieAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Sistema Climbe - API")
                        .description("Documentação da API REST do Sistema Climbe")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Squad20")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName).addList(cookieAuthName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Faça o login e cole o token JWT aqui (sem o prefixo Bearer)."))
                        .addSecuritySchemes(cookieAuthName, new SecurityScheme()
                                .name("accessToken")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .description("Token JWT armazenado automaticamente como Cookie após login Oauth2 ou Auth normal.")));
    }
}