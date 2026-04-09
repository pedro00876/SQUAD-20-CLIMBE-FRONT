package com.squad20.sistema_climbe.domain.meeting.controller;

import com.squad20.sistema_climbe.domain.meeting.dto.MeetingDTO;
import com.squad20.sistema_climbe.domain.meeting.service.MeetingService;
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

@Tag(name = "Reuniões", description = "Gestão de reuniões e participantes")
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @Operation(summary = "Listar reuniões", description = "Retorna reuniões paginadas (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<MeetingDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(meetingService.findAll(pageable));
    }

    @Operation(summary = "Listar por empresa", description = "Retorna as reuniões da empresa informada")
    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<List<MeetingDTO>> findByEnterpriseId(
            @Parameter(description = "ID da empresa") @PathVariable Long enterpriseId) {
        return ResponseEntity.ok(meetingService.findByEnterpriseId(enterpriseId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma reunião pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<MeetingDTO> findById(
            @Parameter(description = "ID da reunião") @PathVariable Long id) {
        return ResponseEntity.ok(meetingService.findById(id));
    }

    @Operation(summary = "Criar reunião", description = "Cadastra uma nova reunião")
    @PostMapping
    public ResponseEntity<MeetingDTO> save(@Valid @RequestBody MeetingDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.save(dto));
    }

    @Operation(summary = "Atualizar reunião", description = "Atualiza uma reunião existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<MeetingDTO> update(
            @Parameter(description = "ID da reunião") @PathVariable Long id,
            @RequestBody MeetingDTO dto) {
        return ResponseEntity.ok(meetingService.update(id, dto));
    }

    @Operation(summary = "Excluir reunião", description = "Remove uma reunião pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da reunião") @PathVariable Long id) {
        meetingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

