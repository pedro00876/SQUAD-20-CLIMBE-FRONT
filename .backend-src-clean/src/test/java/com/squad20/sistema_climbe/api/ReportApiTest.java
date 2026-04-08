package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/reports. GET lista e GET 404; POST exige contractId. */
class ReportApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/reports";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            ContractFixture contract = createContract();
            return "{\"contractId\":" + contract.id() + ",\"pdfUrl\":\"https://teste.com/report.pdf\",\"sentAt\":\"2026-03-20T10:15:30\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"pdfUrl\":\"https://teste.com/report-atualizado.pdf\"}";
    }

    @Test
    @DisplayName("GET por contrato retorna relatórios criados")
    void getByContractReturnsCreatedReport() throws Exception {
        ContractFixture contract = createContract();
        createResource(getBasePath(), "{\"contractId\":" + contract.id() + ",\"pdfUrl\":\"https://teste.com/report.pdf\"}");

        mockMvc.perform(get(getBasePath() + "/contract/" + contract.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contractId").value(Integer.parseInt(contract.id())));
    }
}
