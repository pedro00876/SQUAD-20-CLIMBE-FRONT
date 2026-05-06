package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
        long n = nextSeed();
        return "{\"fullName\":\"Usuario Teste\",\"cpf\":\"" + generateValidCpf(n) + "\",\"email\":\"user" + n + "@teste.com\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"fullName\":\"Usuario Atualizado " + nextSeed() + "\"}";
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

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        UserFixture user = createUser();

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + user.id() + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + user.id()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + user.id()))
            .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + user.id() + ")]").isEmpty());
    }

    @Test
    @DisplayName("Soft delete oculta usuário por e-mail")
    void softDeleteOcultaPorEmail() throws Exception {
        UserFixture user = createUser();

        mockMvc.perform(delete(getBasePath() + "/" + user.id()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/email/" + user.email()))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete oculta usuário por CPF")
    void softDeleteOcultaPorCpf() throws Exception {
        UserFixture user = createUser();

        mockMvc.perform(delete(getBasePath() + "/" + user.id()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/cpf/" + user.cpf()))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete permite criar novo usuário com mesmo e-mail")
    void softDeletePermiteMesmoEmailDepois() throws Exception {
        long n = nextSeed();
        String email = "dup.email" + n + "@teste.com";
        String cpf1 = generateValidCpf(n);
        String cpf2 = generateValidCpf(nextSeed());
        String body1 = "{\"fullName\":\"Usuario Dup1\",\"cpf\":\"" + cpf1 + "\",\"email\":\"" + email + "\"}";
        String body2 = "{\"fullName\":\"Usuario Dup2\",\"cpf\":\"" + cpf2 + "\",\"email\":\"" + email + "\"}";

        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body1))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);

        mockMvc.perform(delete(getBasePath() + "/" + id))
            .andExpect(status().isNoContent());

        mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body2))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Soft delete permite criar novo usuário com mesmo CPF")
    void softDeletePermiteMesmoCpfDepois() throws Exception {
        long n = nextSeed();
        String cpf = generateValidCpf(n);
        String email1 = "dup.cpf1." + n + "@teste.com";
        String email2 = "dup.cpf2." + n + "@teste.com";
        String body1 = "{\"fullName\":\"Usuario CPF1\",\"cpf\":\"" + cpf + "\",\"email\":\"" + email1 + "\"}";
        String body2 = "{\"fullName\":\"Usuario CPF2\",\"cpf\":\"" + cpf + "\",\"email\":\"" + email2 + "\"}";

        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body1))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);

        mockMvc.perform(delete(getBasePath() + "/" + id))
            .andExpect(status().isNoContent());

        mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body2))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Soft delete em usuário oculta notificação associada")
    void softDeleteCascataNotificacaoOcultaAposDelete() throws Exception {
        UserFixture user = createUser();
        String notificationId = createNotification(user.id());

        mockMvc.perform(delete(getBasePath() + "/" + user.id()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notifications/" + notificationId))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete em usuário oculta proposta associada")
    void softDeleteCascataPropostaOcultaAposDelete() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(delete(getBasePath() + "/" + proposal.userId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/proposals/" + proposal.id()))
            .andExpect(status().isNotFound());
    }
}
