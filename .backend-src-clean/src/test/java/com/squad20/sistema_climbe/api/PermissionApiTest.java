package com.squad20.sistema_climbe.api;

/** Testes da API /api/permissions (Permissões). */
class PermissionApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/permissions";
    }

    @Override
    protected String getMinimalPostBody() {
        return "{\"description\":\"Permissão Test " + System.nanoTime() + "\"}";
    }

    @Override
    protected String getPatchBody() {
        return "{\"description\":\"Permissão Atualizada " + System.nanoTime() + "\"}";
    }
}
