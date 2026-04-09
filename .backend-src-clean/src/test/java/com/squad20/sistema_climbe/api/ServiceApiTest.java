package com.squad20.sistema_climbe.api;

/** Testes da API /api/services (Serviços oferecidos). */
class ServiceApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/services";
    }

    @Override
    protected String getMinimalPostBody() {
        return "{\"name\":\"Serviço Test " + System.nanoTime() + "\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"name\":\"Serviço Atualizado " + System.nanoTime() + "\"}";
    }
}
