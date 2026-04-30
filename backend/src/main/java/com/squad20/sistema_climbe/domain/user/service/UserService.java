package com.squad20.sistema_climbe.domain.user.service;

import com.squad20.sistema_climbe.domain.user.dto.UserCreateRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserPatchRequest;

import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import com.squad20.sistema_climbe.domain.document.repository.DocumentRepository;
import com.squad20.sistema_climbe.domain.notification.repository.NotificationRepository;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.report.repository.ReportRepository;
import com.squad20.sistema_climbe.domain.security.repository.RefreshTokenRepository;
import com.squad20.sistema_climbe.domain.spreadsheet.repository.SpreadsheetRepository;

import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.domain.user.mapper.UserMapper;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.ConflictException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final DocumentRepository documentRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;
    private final ReportRepository reportRepository;
    private final SpreadsheetRepository spreadsheetRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final com.squad20.sistema_climbe.domain.notification.service.EmailSenderService emailSenderService;

    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = findUserOrThrow(id);
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com e-mail: " + email));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findByCpf(String cpf) {
        User user = userRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com CPF: " + cpf));
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO save(UserCreateRequest request) {
        validateEmailCpfUnique(request.getEmail(), request.getCpf(), null);
        User user = userMapper.toEntity(request);
        user.setId(null);
        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO update(Long id, UserPatchRequest patch) {
        User user = findUserOrThrow(id);
        validateEmailCpfUnique(patch.getEmail(), patch.getCpf(), id);
        if (patch.getFullName() != null)
            user.setFullName(patch.getFullName());
        if (patch.getCpf() != null)
            user.setCpf(patch.getCpf());
        if (patch.getEmail() != null)
            user.setEmail(patch.getEmail());
        if (patch.getPhone() != null)
            user.setPhone(patch.getPhone());
        if (patch.getStatus() != null)
            user.setStatus(patch.getStatus());
        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = findUserOrThrow(id);
        // Cascade soft delete: deletar usuário propaga para todos os registros
        // associados.
        // Ordem importa: folhas primeiro, depois pai para evitar inconsistências.
        LocalDateTime now = LocalDateTime.now();
        reportRepository.softDeleteByUserId(id, now);
        spreadsheetRepository.softDeleteByUserId(id, now);
        contractRepository.softDeleteByUserId(id, now);
        proposalRepository.softDeleteByUserId(id, now);
        documentRepository.softDeleteByAnalystId(id, now);
        notificationRepository.softDeleteByUserId(id, now);

        // RefreshToken: hard delete intencional — é dado de sessão, não de negócio.
        refreshTokenRepository.deleteByUser(user);

        user.setDeletedAt(now);
        userRepository.save(user);
    }

    @Transactional
    public void approveUser(Long id) {
        User user = findUserOrThrow(id);
        if ("ATIVO".equals(user.getStatus())) {
            throw new com.squad20.sistema_climbe.exception.BadRequestException("Usuário já está ativo.");
        }
        
        user.setStatus("ATIVO");
        userRepository.save(user);

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            String subject = "Bem-vindo ao Sistema Climbe!";
            String body = "Olá " + user.getFullName() + ",\n\nSeu cadastro foi aprovado pelo administrador! Você já pode acessar o sistema utilizando seu e-mail e as credenciais configuradas.\n\nEquipe Climbe";
            emailSenderService.sendEmail(user.getEmail(), subject, body);
        }
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    private void validateEmailCpfUnique(String email, String cpf, Long excludeUserId) {
        if (email != null && isEmailUsedByOther(email, excludeUserId)) {
            throw new ConflictException("Já existe usuário cadastrado com este e-mail");
        }
        if (cpf != null && isCpfUsedByOther(cpf, excludeUserId)) {
            throw new ConflictException("Já existe usuário cadastrado com este CPF");
        }
    }

    private boolean isEmailUsedByOther(String email, Long excludeUserId) {
        return userRepository.findByEmail(email)
                .map(u -> !u.getId().equals(excludeUserId))
                .orElse(false);
    }

    private boolean isCpfUsedByOther(String cpf, Long excludeUserId) {
        return userRepository.findByCpf(cpf)
                .map(u -> !u.getId().equals(excludeUserId))
                .orElse(false);
    }
}
