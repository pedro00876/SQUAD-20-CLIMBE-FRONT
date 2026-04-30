package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
        long n = nextSeed();
        String filial = String.format("%04d", n % 10000);
        String dv = String.format("%02d", (n / 10000) % 100);
        return "{\"legalName\":\"Empresa Test Ltda\",\"cnpj\":\"12.345.678/" + filial + "-" + dv + "\",\"email\":\"teste" + n + "@empresa.com\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"tradeName\":\"Empresa Atualizada " + nextSeed() + "\"}";
    }

    @Test
    @DisplayName("GET por e-mail retorna empresa criada")
    void getByEmailReturnsCreatedEnterprise() throws Exception {
        long n = nextSeed();
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
        long n = nextSeed();
        String email = "cnpj" + n + "@teste.com";
        String cnpj = String.format("%014d", n % 100000000000000L);

        createResource(getBasePath(), "{\"legalName\":\"Empresa CNPJ\",\"cnpj\":\"" + cnpj + "\",\"email\":\"" + email + "\"}");

        mockMvc.perform(get(getBasePath() + "/cnpj/" + cnpj))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cnpj").value(cnpj));
    }

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        String enterpriseId = createEnterprise();

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + enterpriseId + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + enterpriseId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + enterpriseId))
            .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.id == " + enterpriseId + ")]").isEmpty());
    }

    @Test
    @DisplayName("Soft delete em empresa oculta reunião associada")
    void softDeleteCascataMeetingOcultaAposDelete() throws Exception {
        String enterpriseId = createEnterprise();
        String meetingId = createResource("/api/meetings",
            "{\"enterpriseId\":" + enterpriseId + ",\"title\":\"Reuniao Cascade " + nextSeed() + "\"}");

        mockMvc.perform(delete(getBasePath() + "/" + enterpriseId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/meetings/" + meetingId))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete em empresa oculta proposta associada")
    void softDeleteCascataPropostaOcultaAposDelete() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(delete(getBasePath() + "/" + proposal.enterpriseId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/proposals/" + proposal.id()))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete permite criar nova empresa com mesmo CNPJ")
    void softDeletePermiteMesmoCnpjDepois() throws Exception {
        long n = nextSeed();
        String filial = String.format("%04d", n % 10000);
        String dv = String.format("%02d", (n / 10000) % 100);
        String cnpj = "12.345.678/" + filial + "-" + dv;
        String email1 = "cnpj1." + n + "@teste.com";
        String email2 = "cnpj2." + n + "@teste.com";
        String body1 = "{\"legalName\":\"Empresa CNPJ1\",\"cnpj\":\"" + cnpj + "\",\"email\":\"" + email1 + "\"}";
        String body2 = "{\"legalName\":\"Empresa CNPJ2\",\"cnpj\":\"" + cnpj + "\",\"email\":\"" + email2 + "\"}";

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
    @DisplayName("Soft delete permite criar nova empresa com mesmo e-mail")
    void softDeletePermiteMesmoEmailDepois() throws Exception {
        long n = nextSeed();
        String email = "empresa.dup." + n + "@teste.com";
        String cnpj1 = String.format("%014d", n % 100000000000000L);
        String cnpj2 = String.format("%014d", (nextSeed()) % 100000000000000L);
        String body1 = "{\"legalName\":\"Empresa Email1\",\"cnpj\":\"" + cnpj1 + "\",\"email\":\"" + email + "\"}";
        String body2 = "{\"legalName\":\"Empresa Email2\",\"cnpj\":\"" + cnpj2 + "\",\"email\":\"" + email + "\"}";

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
}
