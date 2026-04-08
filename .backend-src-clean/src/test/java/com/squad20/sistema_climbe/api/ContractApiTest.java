package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/contracts. GET lista e GET 404; POST exige proposalId. */
class ContractApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/contracts";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            ProposalFixture proposal = createProposal();
            return "{\"proposalId\":" + proposal.id() + ",\"startDate\":\"2026-03-20\",\"endDate\":\"2026-12-20\",\"status\":\"ATIVO\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"status\":\"ENCERRADO\"}";
    }

    @Test
    @DisplayName("GET por proposta retorna contratos criados")
    void getByProposalReturnsCreatedContract() throws Exception {
        ContractFixture contract = createContract();

        mockMvc.perform(get(getBasePath() + "/proposal/" + contract.proposalId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].proposalId").value(Integer.parseInt(contract.proposalId())));
    }
}
