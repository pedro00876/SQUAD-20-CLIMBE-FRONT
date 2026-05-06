package com.squad20.sistema_climbe.domain.user.controller;

import com.squad20.sistema_climbe.domain.user.dto.UserCreateRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserPatchRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;

@Tag(name = "Usuários", description = "Cadastro e consulta de usuários do sistema")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Listar usuários", description = "Retorna usuários paginados (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<UserDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um usuário pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(
            @Parameter(description = "ID do usuário") @PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @Operation(summary = "Buscar por e-mail", description = "Retorna o usuário com o e-mail informado")
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> findByEmail(
            @Parameter(description = "E-mail do usuário") @PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @Operation(summary = "Buscar por CPF", description = "Retorna o usuário com o CPF informado")
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<UserDTO> findByCpf(
            @Parameter(description = "CPF do usuário") @PathVariable String cpf) {
        return ResponseEntity.ok(userService.findByCpf(cpf));
    }

    @Operation(summary = "Criar usuário", description = "Cadastra um novo usuário")
    @PreAuthorize("hasRole('CEO') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> save(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.save(request));
    }

    @Operation(summary = "Atualizar usuário", description = "Atualiza um usuário existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> update(
            @Parameter(description = "ID do usuário") @PathVariable Long id,
            @Valid @RequestBody UserPatchRequest patch) {
        return ResponseEntity.ok(userService.update(id, patch));
    }

    @Operation(summary = "Aprovar usuário pendente", description = "Aprova um usuário que veio via OAuth e dispara email de boas-vindas")
    @PreAuthorize("hasRole('CEO')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Void> approveUser(
            @Parameter(description = "ID do usuário a ser aprovado") @PathVariable Long id) {
        userService.approveUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Excluir usuário", description = "Remove um usuário pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do usuário") @PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
