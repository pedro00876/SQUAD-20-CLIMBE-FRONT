package com.squad20.sistema_climbe.domain.service.controller;

import com.squad20.sistema_climbe.domain.service.dto.ServiceDTO;
import com.squad20.sistema_climbe.domain.service.service.ServiceService;
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

@Tag(name = "Serviços", description = "Gestão dos serviços oferecidos pela Climbe")
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @Operation(summary = "Listar serviços", description = "Retorna serviços paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<ServiceDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(serviceService.findAll(pageable));
    }

    @Operation(summary = "Buscar serviço por ID", description = "Retorna um serviço pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> findById(
            @Parameter(description = "ID do serviço") @PathVariable Long id) {
        return ResponseEntity.ok(serviceService.findById(id));
    }

    @Operation(summary = "Criar serviço", description = "Cadastra um novo serviço")
    @PostMapping
    public ResponseEntity<ServiceDTO> save(@Valid @RequestBody ServiceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.save(dto));
    }

    @Operation(summary = "Atualizar serviço", description = "Atualiza um serviço existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<ServiceDTO> update(
            @Parameter(description = "ID do serviço") @PathVariable Long id,
            @RequestBody ServiceDTO dto) {
        return ResponseEntity.ok(serviceService.update(id, dto));
    }

    @Operation(summary = "Excluir serviço", description = "Remove um serviço pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do serviço") @PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

