package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/users (Usuários). */
class UserApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/users";
    }

    @Override
    protected String getMinimalPostBody() {
        long n = Math.abs(System.nanoTime());
        return "{\"fullName\":\"Usuario Teste\",\"cpf\":\"" + generateValidCpf(n) + "\",\"email\":\"user" + n + "@teste.com\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"fullName\":\"Usuario Atualizado " + System.nanoTime() + "\"}";
    }

    @Test
    @DisplayName("GET por e-mail retorna usuário criado")
    void getByEmailReturnsCreatedUser() throws Exception {
        UserFixture user = createUser();

        mockMvc.perform(get(getBasePath() + "/email/" + user.email()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.email()));
    }

    @Test
    @DisplayName("GET por CPF retorna usuário criado")
    void getByCpfReturnsCreatedUser() throws Exception {
        UserFixture user = createUser();

        mockMvc.perform(get(getBasePath() + "/cpf/" + user.cpf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(user.cpf()));
    }
}
