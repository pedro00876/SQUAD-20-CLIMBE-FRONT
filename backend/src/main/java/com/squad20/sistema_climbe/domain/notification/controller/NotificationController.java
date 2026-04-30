package com.squad20.sistema_climbe.domain.notification.controller;

import com.squad20.sistema_climbe.domain.notification.dto.NotificationCreateRequest;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationDTO;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationPatchRequest;
import com.squad20.sistema_climbe.domain.notification.service.NotificationService;
import com.squad20.sistema_climbe.domain.notification.service.EmailSenderService;
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

@Tag(name = "Notificações", description = "Gestão de notificações dos usuários")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailSenderService emailSenderService;

    @Operation(summary = "Listar notificações", description = "Retorna notificações paginadas (page, size, sort)")
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(notificationService.findAll(pageable));
    }

    @Operation(summary = "Listar por usuário", description = "Retorna as notificações do usuário informado")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> findByUserId(
            @Parameter(description = "ID do usuário") @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findByUserId(userId));
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma notificação pelo identificador")
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> findById(
            @Parameter(description = "ID da notificação") @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.findById(id));
    }

    @Operation(summary = "Criar notificação", description = "Cadastra uma nova notificação")
    @PostMapping
    public ResponseEntity<NotificationDTO> save(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.save(request));
    }

    @Operation(summary = "Atualizar notificação", description = "Atualiza uma notificação existente (parcial)")
    @PatchMapping("/{id}")
    public ResponseEntity<NotificationDTO> update(
            @Parameter(description = "ID da notificação") @PathVariable Long id,
            @Valid @RequestBody NotificationPatchRequest patch) {
        return ResponseEntity.ok(notificationService.update(id, patch));
    }

    @Operation(summary = "Excluir notificação", description = "Remove uma notificação pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da notificação") @PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Testar disparo E-mail Rápido", description = "Força um envio de e-mail p/ o endereço fornecido para você testar as credenciais SMTP localmente.")
    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(
            @RequestParam String paraEmail, 
            @RequestParam(defaultValue = "Teste do Sistema Climbe") String assunto) {
        
        emailSenderService.sendEmail(paraEmail, assunto, "Teste Email sistema clime! API FUNCIONANDO!");
        return ResponseEntity.ok("Disparo engatilhado! Verifique o console da IDE para monitoramento assíncrono e confira a caixa de entrada de: " + paraEmail);
    }
}

