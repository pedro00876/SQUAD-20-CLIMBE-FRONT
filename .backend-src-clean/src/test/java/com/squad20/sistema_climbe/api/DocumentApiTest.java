package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/documents. GET lista e GET 404; POST exige enterpriseId. */
class DocumentApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/documents";
    }

    @Override
    protected String getMinimalPostBody() throws RuntimeException {
        try {
            String enterpriseId = createEnterprise();
            UserFixture user = createUser();
            return "{\"enterpriseId\":" + enterpriseId + ",\"documentType\":\"CONTRATO\",\"url\":\"https://teste.com/doc.pdf\",\"validated\":true,\"analystId\":" + user.id() + "}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"documentType\":\"DOC_ATUALIZADO\",\"validated\":false}";
    }

    @Test
    @DisplayName("GET por empresa retorna documentos criados")
    void getByEnterpriseReturnsCreatedDocuments() throws Exception {
        String enterpriseId = createEnterprise();
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(getBasePath())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"enterpriseId\":" + enterpriseId + ",\"documentType\":\"RG\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get(getBasePath() + "/enterprise/" + enterpriseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enterpriseId").value(Integer.parseInt(enterpriseId)));
    }

    @Test
    @DisplayName("GET por analista retorna documentos criados")
    void getByAnalystReturnsCreatedDocuments() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture user = createUser();
        createResource(getBasePath(), "{\"enterpriseId\":" + enterpriseId + ",\"documentType\":\"CPF\",\"analystId\":" + user.id() + "}");

        mockMvc.perform(get(getBasePath() + "/analyst/" + user.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].analystId").value(Integer.parseInt(user.id())));
    }
}
