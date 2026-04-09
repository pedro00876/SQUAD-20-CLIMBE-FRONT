package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/proposals. GET lista e GET 404; POST exige enterpriseId e userId. */
class ProposalApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/proposals";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            String enterpriseId = createEnterprise();
            UserFixture user = createUser();
            return "{\"enterpriseId\":" + enterpriseId + ",\"userId\":" + user.id() + ",\"status\":\"ABERTA\",\"createdAt\":\"2026-03-20T10:15:30\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"status\":\"APROVADA\"}";
    }

    @Test
    @DisplayName("GET por empresa retorna propostas criadas")
    void getByEnterpriseReturnsCreatedProposal() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "/enterprise/" + proposal.enterpriseId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enterpriseId").value(Integer.parseInt(proposal.enterpriseId())));
    }

    @Test
    @DisplayName("GET por usuário retorna propostas criadas")
    void getByUserReturnsCreatedProposal() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "/user/" + proposal.userId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(Integer.parseInt(proposal.userId())));
    }
}
