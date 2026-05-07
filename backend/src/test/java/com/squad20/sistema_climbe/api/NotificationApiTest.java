package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/notifications. GET lista e GET 404; POST exige userId. */
class NotificationApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/notifications";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            UserFixture user = createUser();
            return "{\"userId\":" + user.id() + ",\"message\":\"Notificacao de teste\",\"type\":\"INFO\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"message\":\"Notificacao atualizada\",\"type\":\"ALERTA\"}";
    }

    @Test
    @DisplayName("GET por usuário retorna notificações criadas")
    void getByUserReturnsCreatedNotification() throws Exception {
        UserFixture user = createUser();
        createResource(getBasePath(), "{\"userId\":" + user.id() + ",\"message\":\"Notificacao vinculada\",\"type\":\"INFO\"}");

        mockMvc.perform(get(getBasePath() + "/user/" + user.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(Integer.parseInt(user.id())));
    }

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        UserFixture user = createUser();
        String notificationId = createNotification(user.id());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + notificationId + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + notificationId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + notificationId))
            .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + notificationId + ")]").isEmpty());
    }
}
