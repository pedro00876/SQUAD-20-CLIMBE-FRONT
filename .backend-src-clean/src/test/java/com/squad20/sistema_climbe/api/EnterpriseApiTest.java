package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/enterprises (Empresas). */
class EnterpriseApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/enterprises";
    }

    @Override
    protected String getMinimalPostBody() {
        long n = Math.abs(System.nanoTime());
        String filial = String.format("%04d", n % 10000);
        String dv = String.format("%02d", (n / 10000) % 100);
        return "{\"legalName\":\"Empresa Test Ltda\",\"cnpj\":\"12.345.678/" + filial + "-" + dv + "\",\"email\":\"teste" + n + "@empresa.com\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"tradeName\":\"Empresa Atualizada " + System.nanoTime() + "\"}";
    }

    @Test
    @DisplayName("GET por e-mail retorna empresa criada")
    void getByEmailReturnsCreatedEnterprise() throws Exception {
        long n = Math.abs(System.nanoTime());
        String filial = String.format("%04d", n % 10000);
        String dv = String.format("%02d", (n / 10000) % 100);
        String email = "empresa" + n + "@teste.com";
        String cnpj = "12.345.678/" + filial + "-" + dv;

        createResource(getBasePath(), "{\"legalName\":\"Empresa Busca\",\"cnpj\":\"" + cnpj + "\",\"email\":\"" + email + "\"}");

        mockMvc.perform(get(getBasePath() + "/email/" + email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("GET por CNPJ retorna empresa criada")
    void getByCnpjReturnsCreatedEnterprise() throws Exception {
        long n = Math.abs(System.nanoTime());
        String email = "cnpj" + n + "@teste.com";
        String cnpj = String.format("%014d", n % 100000000000000L);

        createResource(getBasePath(), "{\"legalName\":\"Empresa CNPJ\",\"cnpj\":\"" + cnpj + "\",\"email\":\"" + email + "\"}");

        mockMvc.perform(get(getBasePath() + "/cnpj/" + cnpj))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cnpj").value(cnpj));
    }
}
