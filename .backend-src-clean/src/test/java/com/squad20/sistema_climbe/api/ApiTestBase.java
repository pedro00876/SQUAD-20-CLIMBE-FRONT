package com.squad20.sistema_climbe.api;

import com.squad20.sistema_climbe.SistemaClimbeApplication;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base para testes por API: GET lista, GET 404, e (se houver payload mínimo) POST, PATCH, DELETE.
 */
@SpringBootTest(classes = SistemaClimbeApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
abstract class ApiTestBase {

    /** Lista única de paths das APIs — usar no smoke e para garantir que nenhum recurso fique de fora. */
    public static final String[] API_BASE_PATHS = {
        "/api/roles", "/api/users", "/api/enterprises", "/api/permissions", "/api/services",
        "/api/notifications", "/api/meetings", "/api/proposals", "/api/contracts",
        "/api/spreadsheets", "/api/reports", "/api/documents"
    };

    @Autowired
    protected MockMvc mockMvc;

    protected abstract String getBasePath();

    /**
     * Payload mínimo para POST. Se null, só rodam testes de GET lista e GET por id inexistente.
     */
    protected String getMinimalPostBody() {
        return null;
    }

    @Test
    @DisplayName("GET lista retorna 200")
    void getListaRetorna200() throws Exception {
        mockMvc.perform(get(getBasePath())).andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET por ID inexistente retorna 404")
    void getPorIdInexistenteRetorna404() throws Exception {
        mockMvc.perform(get(getBasePath() + "/999999")).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST retorna 201")
    void postRetorna201() throws Exception {
        Assumptions.assumeTrue(getMinimalPostBody() != null, "Recurso exige FK, sem payload mínimo");
        mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(getMinimalPostBody()))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("PATCH retorna 200")
    void patchRetorna200() throws Exception {
        Assumptions.assumeTrue(getMinimalPostBody() != null, "Recurso exige FK, sem payload mínimo");
        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(getMinimalPostBody()))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);
        String patchBody = getPatchBody();
        mockMvc.perform(patch(getBasePath() + "/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patchBody))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE retorna 204")
    void deleteRetorna204() throws Exception {
        Assumptions.assumeTrue(getMinimalPostBody() != null, "Recurso exige FK, sem payload mínimo");
        String createRes = mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content(getMinimalPostBody()))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String id = extractIdFromJson(createRes);
        mockMvc.perform(delete(getBasePath() + "/" + id)).andExpect(status().isNoContent());
    }

    protected String getPatchBody() {
        return getMinimalPostBody();
    }

    protected static String extractIdFromJson(String json) {
        if (json == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(json);
        return m.find() ? m.group(1) : null;
    }

    protected String createEnterprise() throws Exception {
        long n = Math.abs(System.nanoTime());
        String filial = String.format("%04d", n % 10000);
        String dv = String.format("%02d", (n / 10000) % 100);

        String body = "{\"legalName\":\"Empresa Test Ltda\",\"tradeName\":\"Empresa " + n
                + "\",\"cnpj\":\"12.345.678/" + filial + "-" + dv
                + "\",\"email\":\"empresa" + n + "@teste.com\"}";

        return createResource("/api/enterprises", body);
    }

    protected UserFixture createUser() throws Exception {
        long n = Math.abs(System.nanoTime());
        String email = "user" + n + "@teste.com";
        String cpf = generateValidCpf(n);
        String body = "{\"fullName\":\"Usuario Teste " + n + "\",\"cpf\":\"" + cpf
                + "\",\"email\":\"" + email + "\"}";

        String id = createResource("/api/users", body);
        return new UserFixture(id, email, cpf);
    }

    protected ProposalFixture createProposal() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture user = createUser();
        long n = Math.abs(System.nanoTime());
        String body = "{\"enterpriseId\":" + enterpriseId + ",\"userId\":" + user.id()
                + ",\"status\":\"ABERTA\",\"createdAt\":\"2026-03-20T10:15:30\"}";

        String proposalId = createResource("/api/proposals", body);
        return new ProposalFixture(proposalId, enterpriseId, user.id());
    }

    protected ContractFixture createContract() throws Exception {
        ProposalFixture proposal = createProposal();
        String body = "{\"proposalId\":" + proposal.id()
                + ",\"startDate\":\"2026-03-20\",\"endDate\":\"2026-12-20\",\"status\":\"ATIVO\"}";

        String contractId = createResource("/api/contracts", body);
        return new ContractFixture(contractId, proposal.id(), proposal.enterpriseId(), proposal.userId());
    }

    protected String createResource(String path, String body) throws Exception {
        MvcResult result = mockMvc.perform(post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        String id = extractIdFromJson(result.getResponse().getContentAsString());
        if (id == null) {
            throw new AssertionError("Nao foi possivel extrair o id de " + path);
        }
        return id;
    }

    protected String extractCookie(MvcResult result, String cookieName) {
        jakarta.servlet.http.Cookie cookie = result.getResponse().getCookie(cookieName);
        if (cookie == null) {
            throw new AssertionError("Cookie nao encontrado: " + cookieName);
        }
        return cookie.getValue();
    }

    protected static String generateValidCpf(long seed) {
        int[] digits = new int[11];
        long value = seed;

        for (int i = 0; i < 9; i++) {
            digits[i] = (int) (value % 10);
            value /= 10;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += digits[i] * (10 - i);
        }
        int remainder = sum % 11;
        digits[9] = remainder < 2 ? 0 : 11 - remainder;

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += digits[i] * (11 - i);
        }
        remainder = sum % 11;
        digits[10] = remainder < 2 ? 0 : 11 - remainder;

        StringBuilder cpf = new StringBuilder(11);
        for (int digit : digits) {
            cpf.append(digit);
        }
        return cpf.toString();
    }

    protected record UserFixture(String id, String email, String cpf) {}

    protected record ProposalFixture(String id, String enterpriseId, String userId) {}

    protected record ContractFixture(String id, String proposalId, String enterpriseId, String userId) {}
}
