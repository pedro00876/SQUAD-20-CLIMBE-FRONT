package com.squad20.sistema_climbe.domain.enterprise.controller;

import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseDTO;
import com.squad20.sistema_climbe.domain.enterprise.service.EnterpriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Tag(name = "Empresas", description = "Cadastro e consulta de empresas")
@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @Operation(summary = "Listar empresas", description = "Retorna empresas paginadas (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<EnterpriseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(enterpriseService.findAll(pageable));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma empresa pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<EnterpriseDTO> findById(
            @Parameter(description = "ID da empresa") @PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.findById(id));
    }

    @Operation(summary = "Buscar por e-mail", description = "Retorna a empresa com o e-mail informado")
    @GetMapping("/email/{email}")
    public ResponseEntity<EnterpriseDTO> findByEmail(
            @Parameter(description = "E-mail da empresa") @PathVariable String email) {
        return ResponseEntity.ok(enterpriseService.findByEmail(email));
    }

    @Operation(summary = "Buscar por CNPJ", description = "Retorna a empresa com o CNPJ informado")
    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<EnterpriseDTO> findByCnpj(
            @Parameter(description = "CNPJ da empresa") @PathVariable String cnpj) {
        return ResponseEntity.ok(enterpriseService.findByCnpj(cnpj));
    }

    @Operation(summary = "Criar empresa", description = "Cadastra uma nova empresa")
    @PostMapping
    public ResponseEntity<EnterpriseDTO> save(@Valid @RequestBody EnterpriseDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enterpriseService.save(dto));
    }

    @Operation(summary = "Atualizar empresa", description = "Atualiza uma empresa existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<EnterpriseDTO> update(
            @Parameter(description = "ID da empresa") @PathVariable Long id,
            @RequestBody EnterpriseDTO dto) {
        return ResponseEntity.ok(enterpriseService.update(id, dto));
    }

    @Operation(summary = "Excluir empresa", description = "Remove uma empresa pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da empresa") @PathVariable Long id) {
        enterpriseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
