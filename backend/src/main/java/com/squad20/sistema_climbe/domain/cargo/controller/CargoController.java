package com.squad20.sistema_climbe.domain.cargo.controller;

import com.squad20.sistema_climbe.domain.cargo.dto.CargoCreateRequest;
import com.squad20.sistema_climbe.domain.cargo.dto.CargoPatchRequest;
import com.squad20.sistema_climbe.domain.cargo.dto.CargoDTO;
import com.squad20.sistema_climbe.domain.cargo.service.CargoService;
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

@Tag(name = "Cargos", description = "Gestão de cargos (funções) dos usuários")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class CargoController {

    private final CargoService cargoService;

    @Operation(summary = "Listar cargos", description = "Retorna cargos paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<CargoDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(cargoService.findAll(pageable));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um cargo pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<CargoDTO> findById(
            @Parameter(description = "ID do cargo") @PathVariable Long id) {
        return ResponseEntity.ok(cargoService.findById(id));
    }

    @Operation(summary = "Criar cargo", description = "Cadastra um novo cargo")
    @PostMapping
    public ResponseEntity<CargoDTO> save(@Valid @RequestBody CargoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cargoService.save(request));
    }

    @Operation(summary = "Atualizar cargo", description = "Atualiza um cargo existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<CargoDTO> update(
            @Parameter(description = "ID do cargo") @PathVariable Long id,
            @Valid @RequestBody CargoPatchRequest patch) {
        return ResponseEntity.ok(cargoService.update(id, patch));
    }

    @Operation(summary = "Excluir cargo", description = "Remove um cargo pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do cargo") @PathVariable Long id) {
        cargoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
