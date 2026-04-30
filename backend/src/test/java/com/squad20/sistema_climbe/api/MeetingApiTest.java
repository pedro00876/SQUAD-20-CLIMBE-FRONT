package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/meetings. GET lista e GET 404; POST exige enterpriseId e título. */
class MeetingApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/meetings";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            String enterpriseId = createEnterprise();
            UserFixture user = createUser();
            return "{\"enterpriseId\":" + enterpriseId + ",\"title\":\"Reuniao teste\",\"date\":\"2026-03-20\",\"time\":\"10:30:00\",\"participantIds\":[" + user.id() + "]}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"title\":\"Reuniao atualizada\",\"status\":\"CONFIRMADA\"}";
    }

    @Test
    @DisplayName("GET por empresa retorna reuniões criadas")
    void getByEnterpriseReturnsCreatedMeeting() throws Exception {
        String enterpriseId = createEnterprise();
        createResource(getBasePath(), "{\"enterpriseId\":" + enterpriseId + ",\"title\":\"Reuniao empresa\"}");

        mockMvc.perform(get(getBasePath() + "/enterprise/" + enterpriseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enterpriseId").value(Integer.parseInt(enterpriseId)));
    }

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        String enterpriseId = createEnterprise();
        String meetingId = createResource(getBasePath(),
            "{\"enterpriseId\":" + enterpriseId + ",\"title\":\"Reuniao Listagem " + System.nanoTime() + "\"}");

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + meetingId + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + meetingId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + meetingId))
            .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + meetingId + ")]").isEmpty());
    }

    @Test
    @DisplayName("Participante deletado não aparece mais em participantIds da reunião")
    void softDeleteParticipanteRemovidoDaReuniao() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture user = createUser();
        String meetingId = createResource(getBasePath(),
            "{\"enterpriseId\":" + enterpriseId + ",\"title\":\"Reuniao M2M " + System.nanoTime() + "\",\"participantIds\":[" + user.id() + "]}");

        mockMvc.perform(get(getBasePath() + "/" + meetingId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.participantIds", hasItem(Integer.parseInt(user.id()))));

        mockMvc.perform(delete("/api/users/" + user.id()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + meetingId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.participantIds", not(hasItem(Integer.parseInt(user.id())))));
    }
}
