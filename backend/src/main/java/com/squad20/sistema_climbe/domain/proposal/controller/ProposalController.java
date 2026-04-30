package com.squad20.sistema_climbe.domain.proposal.controller;

import com.squad20.sistema_climbe.domain.proposal.dto.ProposalCreateRequest;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalDTO;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalPatchRequest;
import com.squad20.sistema_climbe.domain.proposal.service.ProposalService;
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

@Tag(name = "Propostas", description = "Gestão de propostas")
@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @Operation(summary = "Listar propostas", description = "Retorna propostas paginadas (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<ProposalDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(proposalService.findAll(pageable));
    }

    @Operation(summary = "Listar por empresa", description = "Retorna as propostas da empresa informada")
    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<List<ProposalDTO>> findByEnterpriseId(
            @Parameter(description = "ID da empresa") @PathVariable Long enterpriseId) {
        return ResponseEntity.ok(proposalService.findByEnterpriseId(enterpriseId));
    }

    @Operation(summary = "Listar por usuário", description = "Retorna as propostas do usuário informado")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProposalDTO>> findByUserId(
            @Parameter(description = "ID do usuário") @PathVariable Long userId) {
        return ResponseEntity.ok(proposalService.findByUserId(userId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma proposta pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<ProposalDTO> findById(
            @Parameter(description = "ID da proposta") @PathVariable Long id) {
        return ResponseEntity.ok(proposalService.findById(id));
    }

    @Operation(summary = "Criar proposta", description = "Cadastra uma nova proposta")
    @PostMapping
    public ResponseEntity<ProposalDTO> save(@Valid @RequestBody ProposalCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proposalService.save(request));
    }

    @Operation(summary = "Atualizar proposta", description = "Atualiza uma proposta existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<ProposalDTO> update(
            @Parameter(description = "ID da proposta") @PathVariable Long id,
            @Valid @RequestBody ProposalPatchRequest patch) {
        return ResponseEntity.ok(proposalService.update(id, patch));
    }

    @Operation(summary = "Excluir proposta", description = "Remove uma proposta pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da proposta") @PathVariable Long id) {
        proposalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

