package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/spreadsheets. GET lista e GET 404; POST exige contractId. */
class SpreadsheetApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/spreadsheets";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            ContractFixture contract = createContract();
            return "{\"contractId\":" + contract.id() + ",\"googleSheetsUrl\":\"https://docs.google.com/spreadsheets/d/teste\",\"locked\":false,\"viewPermission\":\"TIME\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"locked\":true,\"viewPermission\":\"GESTAO\"}";
    }

    @Test
    @DisplayName("GET por contrato retorna planilhas criadas")
    void getByContractReturnsCreatedSpreadsheet() throws Exception {
        ContractFixture contract = createContract();
        createResource(getBasePath(), "{\"contractId\":" + contract.id() + ",\"googleSheetsUrl\":\"https://docs.google.com/spreadsheets/d/teste\"}");

        mockMvc.perform(get(getBasePath() + "/contract/" + contract.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contractId").value(Integer.parseInt(contract.id())));
    }
}
