package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Smoke: GET lista em todos os recursos de uma vez.
 * Testes por endpoint (GET 404, POST, PATCH, DELETE) ficam nas classes *ApiTest.
 */
@SpringBootTest(classes = com.squad20.sistema_climbe.SistemaClimbeApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET lista em todos os recursos retorna 200")
    void getListaEmTodosRetorna200() throws Exception {
        for (String path : ApiTestBase.API_BASE_PATHS) {
            mockMvc.perform(get(path)).andExpect(status().isOk());
        }
    }
}
