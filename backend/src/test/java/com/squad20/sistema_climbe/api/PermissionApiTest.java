package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/permissions (Permissões). */
class PermissionApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/permissions";
    }

    @Override
    protected String getMinimalPostBody() {
        return "{\"description\":\"Permissão Test " + System.nanoTime() + "\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"description\":\"Permissão Atualizada " + System.nanoTime() + "\"}";
    }

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        String body = "{\"description\":\"Permissao Listagem " + System.nanoTime() + "\"}";
        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + id + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + id))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + id))
            .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    @DisplayName("Soft delete permite criar nova permissão com mesma descrição")
    void softDeletePermiteDescricaoDuplicadaDepois() throws Exception {
        String desc = "Permissao Unica " + System.nanoTime();
        String body = "{\"description\":\"" + desc + "\"}";

        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);

        mockMvc.perform(delete(getBasePath() + "/" + id))
            .andExpect(status().isNoContent());

        mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());
    }
}
