package com.squad20.sistema_climbe.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Register cria usuário e devolve cookies de autenticação")
    void registerCreatesUserAndReturnsCookies() throws Exception {
        long n = Math.abs(System.nanoTime());

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(n)))
                .andExpect(status().isOk())
                .andReturn();

        assertCookiePresent(result, "accessToken");
        assertCookiePresent(result, "refreshToken");
    }

    @Test
    @DisplayName("Login com credenciais válidas devolve cookies de autenticação")
    void loginReturnsCookiesForValidCredentials() throws Exception {
        long n = Math.abs(System.nanoTime());
        String email = "auth" + n + "@teste.com";
        String password = "Senha123";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(n, email, password)))
                .andExpect(status().isOk());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        assertCookiePresent(result, "accessToken");
        assertCookiePresent(result, "refreshToken");
    }

    @Test
    @DisplayName("Register com e-mail duplicado retorna 409")
    void registerWithDuplicateEmailReturnsConflict() throws Exception {
        long n = Math.abs(System.nanoTime());
        String body = registerBody(n);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Refresh com cookie válido devolve novo cookie de access token")
    void refreshReturnsNewAccessTokenCookie() throws Exception {
        long n = Math.abs(System.nanoTime());

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(n)))
                .andExpect(status().isOk())
                .andReturn();

        String refreshToken = extractCookie(result, "refreshToken");

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andReturn();

        assertCookiePresent(refreshResult, "accessToken");
    }

    @Test
    @DisplayName("Logout limpa os cookies de autenticação")
    void logoutClearsCookies() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andReturn();

        assertCookieCleared(result, "accessToken");
        assertCookieCleared(result, "refreshToken");
    }

    private static String registerBody(long seed) {
        return registerBody(seed, "auth" + seed + "@teste.com", "Senha123");
    }

    private static String registerBody(long seed, String email, String password) {
        return "{\"fullName\":\"Auth Teste\",\"email\":\"" + email + "\",\"password\":\"" + password
                + "\",\"cpf\":\"" + generateValidCpf(seed) + "\",\"phone\":\"11999999999\"}";
    }

    private static String extractCookie(MvcResult result, String cookieName) {
        Cookie cookie = result.getResponse().getCookie(cookieName);
        if (cookie == null) {
            throw new AssertionError("Cookie não encontrado: " + cookieName);
        }
        return cookie.getValue();
    }

    private static void assertCookiePresent(MvcResult result, String cookieName) {
        Cookie cookie = result.getResponse().getCookie(cookieName);
        if (cookie == null || cookie.getValue() == null || cookie.getValue().isBlank()) {
            throw new AssertionError("Cookie ausente ou vazio: " + cookieName);
        }
    }

    private static void assertCookieCleared(MvcResult result, String cookieName) {
        Cookie cookie = result.getResponse().getCookie(cookieName);
        if (cookie == null) {
            throw new AssertionError("Cookie não encontrado: " + cookieName);
        }
        if (cookie.getMaxAge() != 0) {
            throw new AssertionError("Cookie não foi limpo: " + cookieName);
        }
    }

    private static String generateValidCpf(long seed) {
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
}
