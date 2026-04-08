package com.squad20.sistema_climbe.domain.document.controller;

import com.squad20.sistema_climbe.domain.document.dto.DocumentDTO;
import com.squad20.sistema_climbe.domain.document.service.DocumentService;
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

@Tag(name = "Documentos", description = "Gestão de documentos das empresas")
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Listar documentos", description = "Retorna documentos paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<DocumentDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(documentService.findAll(pageable));
    }

    @Operation(summary = "Listar por empresa", description = "Retorna os documentos da empresa informada")
    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<List<DocumentDTO>> findByEnterpriseId(
            @Parameter(description = "ID da empresa") @PathVariable Long enterpriseId) {
        return ResponseEntity.ok(documentService.findByEnterpriseId(enterpriseId));
    }

    @Operation(summary = "Listar por analista", description = "Retorna os documentos validados pelo analista informado")
    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<DocumentDTO>> findByAnalystId(
            @Parameter(description = "ID do analista") @PathVariable Long analystId) {
        return ResponseEntity.ok(documentService.findByAnalystId(analystId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um documento pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> findById(
            @Parameter(description = "ID do documento") @PathVariable Long id) {
        return ResponseEntity.ok(documentService.findById(id));
    }

    @Operation(summary = "Criar documento", description = "Cadastra um novo documento")
    @PostMapping
    public ResponseEntity<DocumentDTO> save(@Valid @RequestBody DocumentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.save(dto));
    }

    @Operation(summary = "Atualizar documento", description = "Atualiza um documento existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<DocumentDTO> update(
            @Parameter(description = "ID do documento") @PathVariable Long id,
            @RequestBody DocumentDTO dto) {
        return ResponseEntity.ok(documentService.update(id, dto));
    }

    @Operation(summary = "Excluir documento", description = "Remove um documento pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do documento") @PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

