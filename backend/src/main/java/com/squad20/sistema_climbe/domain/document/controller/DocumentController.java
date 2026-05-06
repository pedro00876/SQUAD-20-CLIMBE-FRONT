package com.squad20.sistema_climbe.domain.document.controller;

import com.squad20.sistema_climbe.domain.document.dto.DocumentCreateRequest;
import com.squad20.sistema_climbe.domain.document.dto.DocumentDTO;
import com.squad20.sistema_climbe.domain.document.dto.DocumentPatchRequest;
import com.squad20.sistema_climbe.domain.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Operation(summary = "Criar documento", description = "Cadastra um novo documento subindo o arquivo para o GCP Bucket")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDTO> save(
            @RequestPart("data") @Valid DocumentCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.saveWithFile(request, file));
    }

    @Operation(summary = "Visualizar documento", description = "Gera um link temporário seguro para visualização do documento")
    @GetMapping("/{id}/view")
    public ResponseEntity<String> getViewUrl(
            @Parameter(description = "ID do documento") @PathVariable Long id) {
        return ResponseEntity.ok(documentService.generateViewUrl(id));
    }

    @Operation(summary = "Atualizar documento", description = "Atualiza um documento existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<DocumentDTO> update(
            @Parameter(description = "ID do documento") @PathVariable Long id,
            @Valid @RequestBody DocumentPatchRequest patch) {
        return ResponseEntity.ok(documentService.update(id, patch));
    }

    @Operation(summary = "Excluir documento", description = "Remove um documento pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do documento") @PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

