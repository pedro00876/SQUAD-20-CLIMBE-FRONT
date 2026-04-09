package com.squad20.sistema_climbe.domain.report.controller;

import com.squad20.sistema_climbe.domain.report.dto.ReportDTO;
import com.squad20.sistema_climbe.domain.report.service.ReportService;
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

@Tag(name = "Relatórios", description = "Gestão de relatórios (PDF)")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Listar relatórios", description = "Retorna relatórios paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<ReportDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(reportService.findAll(pageable));
    }

    @Operation(summary = "Listar por contrato", description = "Retorna os relatórios do contrato informado")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<ReportDTO>> findByContractId(
            @Parameter(description = "ID do contrato") @PathVariable Long contractId) {
        return ResponseEntity.ok(reportService.findByContractId(contractId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um relatório pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<ReportDTO> findById(
            @Parameter(description = "ID do relatório") @PathVariable Long id) {
        return ResponseEntity.ok(reportService.findById(id));
    }

    @Operation(summary = "Criar relatório", description = "Cadastra um novo relatório")
    @PostMapping
    public ResponseEntity<ReportDTO> save(@Valid @RequestBody ReportDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.save(dto));
    }

    @Operation(summary = "Atualizar relatório", description = "Atualiza um relatório existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<ReportDTO> update(
            @Parameter(description = "ID do relatório") @PathVariable Long id,
            @RequestBody ReportDTO dto) {
        return ResponseEntity.ok(reportService.update(id, dto));
    }

    @Operation(summary = "Excluir relatório", description = "Remove um relatório pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do relatório") @PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

