package com.squad20.sistema_climbe.dto;

import lombok.Data;

@Data
public class BrasilApiEmpresaDTO {
    private String cnpj;
    private String razao_social;
    private String nome_fantasia;
    private String logradouro;
    private String numero;
    private String bairro;
    private String municipio;
    private String uf;
    private String cep;
    private String ddd_telefone_1;
    private String descricao_situacao_cadastral;
}
