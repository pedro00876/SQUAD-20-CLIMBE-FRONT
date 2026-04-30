package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    @DisplayName("PATCH sem analystId preserva analista atual")
    void patchSemAnalystIdPreservaAnalistaAtual() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture analyst = createUser();

        String documentId = createResource(getBasePath(),
                "{\"enterpriseId\":" + enterpriseId + ",\"documentType\":\"RG\",\"analystId\":" + analyst.id() + "}");

        mockMvc.perform(patch(getBasePath() + "/" + documentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"documentType\":\"CPF\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("CPF"))
                .andExpect(jsonPath("$.analystId").value(Integer.parseInt(analyst.id())));
    }

    @Test
    @DisplayName("PATCH só com url (sem analystId) preserva analista e persiste no GET")
    void patchSomenteUrlSemAnalystIdPreservaAnalista() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture analyst = createUser();

        String documentId = createResource(getBasePath(),
                "{\"enterpriseId\":" + enterpriseId + ",\"documentType\":\"RG\",\"url\":\"https://teste.com/a.pdf\",\"analystId\":"
                        + analyst.id() + "}");

        mockMvc.perform(patch(getBasePath() + "/" + documentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"url\":\"https://teste.com/b.pdf\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://teste.com/b.pdf"))
                .andExpect(jsonPath("$.analystId").value(Integer.parseInt(analyst.id())));

        mockMvc.perform(get(getBasePath() + "/" + documentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.analystId").value(Integer.parseInt(analyst.id())));
    }

    @Test
    @DisplayName("GET por empresa retorna documentos criados")
    void getByEnterpriseReturnsCreatedDocuments() throws Exception {
        String enterpriseId = createEnterprise();
        mockMvc.perform(post(getBasePath())
                        .contentType(MediaType.APPLICATION_JSON)
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

    @Test
    @DisplayName("Soft delete não aparece em $.content da listagem geral")
    void softDeleteNaoApareceEmPageContent() throws Exception {
        String enterpriseId = createEnterprise();
        String documentId = createDocument(enterpriseId);

        mockMvc.perform(get(getBasePath() + "?size=200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + documentId + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + documentId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + documentId))
                .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + documentId + ")]").isEmpty());
    }
}
