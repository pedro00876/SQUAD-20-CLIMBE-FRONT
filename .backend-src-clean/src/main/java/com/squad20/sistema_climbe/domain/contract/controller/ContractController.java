package com.squad20.sistema_climbe.domain.contract.controller;

import com.squad20.sistema_climbe.domain.contract.dto.ContractDTO;
import com.squad20.sistema_climbe.domain.contract.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Contratos", description = "Gestão de contratos")
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @Operation(summary = "Listar contratos", description = "Retorna contratos paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<ContractDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(contractService.findAll(pageable));
    }

    @Operation(summary = "Listar por proposta", description = "Retorna os contratos da proposta informada")
    @GetMapping("/proposal/{proposalId}")
    public ResponseEntity<List<ContractDTO>> findByProposalId(
            @Parameter(description = "ID da proposta") @PathVariable Long proposalId) {
        return ResponseEntity.ok(contractService.findByProposalId(proposalId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um contrato pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<ContractDTO> findById(
            @Parameter(description = "ID do contrato") @PathVariable Long id) {
        return ResponseEntity.ok(contractService.findById(id));
    }

    @Operation(summary = "Criar contrato", description = "Cadastra um novo contrato")
    @PostMapping
    public ResponseEntity<ContractDTO> save(@Valid @RequestBody ContractDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.save(dto));
    }

    @Operation(summary = "Atualizar contrato", description = "Atualiza um contrato existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<ContractDTO> update(
            @Parameter(description = "ID do contrato") @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        return ResponseEntity.ok(contractService.update(id, dto));
    }

    @Operation(summary = "Excluir contrato", description = "Remove um contrato pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do contrato") @PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

