package com.squad20.sistema_climbe.service;

import com.squad20.sistema_climbe.dto.BrasilApiEmpresaDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BrasilApiService {

    private static final String BRASIL_API_URL = "https://brasilapi.com.br/api/cnpj/v1/{cnpj}";

    private final RestTemplate restTemplate;

    public BrasilApiService() {
        this.restTemplate = new RestTemplate();
    }

    public BrasilApiEmpresaDTO buscarCnpj(String cnpj) {
        String cleanCnpj = cnpj.replaceAll("[^0-9]", "");
        return restTemplate.getForObject(BRASIL_API_URL, BrasilApiEmpresaDTO.class, cleanCnpj);
    }
}
