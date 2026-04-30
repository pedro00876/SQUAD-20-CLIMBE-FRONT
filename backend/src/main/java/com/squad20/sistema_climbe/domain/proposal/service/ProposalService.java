package com.squad20.sistema_climbe.domain.proposal.service;

import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import com.squad20.sistema_climbe.domain.enterprise.entity.Address;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.notification.service.EmailSenderService;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationCreateRequest;
import com.squad20.sistema_climbe.domain.notification.service.NotificationService;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalCreateRequest;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalDTO;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalPatchRequest;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import com.squad20.sistema_climbe.domain.proposal.entity.ProposalStatus;
import com.squad20.sistema_climbe.domain.proposal.mapper.ProposalMapper;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.report.repository.ReportRepository;
import com.squad20.sistema_climbe.domain.spreadsheet.repository.SpreadsheetRepository;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.BadRequestException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private static final EnumSet<Role> ANALYST_ROLES = EnumSet.of(
            Role.ANALISTA_VALORES_IMOBILIARIOS,
            Role.ANALISTA_BPO_FINANCEIRO);

    private final ProposalRepository proposalRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ReportRepository reportRepository;
    private final SpreadsheetRepository spreadsheetRepository;
    private final NotificationService notificationService;
    private final EmailSenderService emailSenderService;
    private final ProposalMapper proposalMapper;

    @Transactional(readOnly = true)
    public Page<ProposalDTO> findAll(Pageable pageable) {
        return proposalRepository.findAll(pageable).map(proposalMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ProposalDTO> findByEnterpriseId(Long enterpriseId) {
        return proposalRepository.findByEnterprise_Id(enterpriseId).stream()
                .map(proposalMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProposalDTO> findByUserId(Long userId) {
        return proposalRepository.findByUser_Id(userId).stream()
                .map(proposalMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProposalDTO findById(Long id) {
        Proposal proposal = findProposalOrThrow(id);
        return proposalMapper.toDTO(proposal);
    }

    @Transactional
    public ProposalDTO save(ProposalCreateRequest request) {
        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + request.getEnterpriseId()));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + request.getUserId()));

        Proposal proposal = proposalMapper.toEntity(request);
        proposal.setId(null);
        proposal.setEnterprise(enterprise);
        proposal.setUser(user);
        proposal.setStatus(ProposalStatus.RECEIVED.name());

        proposal = proposalRepository.save(proposal);
        return proposalMapper.toDTO(proposal);
    }

    @Transactional
    public ProposalDTO update(Long id, ProposalPatchRequest patch) {
        Proposal existing = findProposalOrThrow(id);

        if (patch.getEnterpriseId() != null) {
            Enterprise enterprise = enterpriseRepository.findById(patch.getEnterpriseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + patch.getEnterpriseId()));
            existing.setEnterprise(enterprise);
        }

        if (patch.getUserId() != null) {
            User user = userRepository.findById(patch.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + patch.getUserId()));
            existing.setUser(user);
        }

        if (patch.getStatus() != null) {
            applyWorkflowStatus(existing, patch.getStatus());
        }

        if (patch.getResponsibleAnalystId() != null) {
            assignResponsibleAnalyst(existing, patch.getResponsibleAnalystId());
        }

        existing = proposalRepository.save(existing);
        return proposalMapper.toDTO(existing);
    }

    @Transactional
    public void markCommercialProposalSubmitted(Long proposalId) {
        Proposal proposal = findProposalOrThrow(proposalId);
        ProposalStatus currentStatus = normalizeProposalStatus(proposal.getStatus());

        if (currentStatus == ProposalStatus.COMMERCIAL_PROPOSAL) {
            return;
        }

        if (currentStatus != ProposalStatus.ELIGIBLE
                && currentStatus != ProposalStatus.COMMERCIAL_PROPOSAL_REJECTED) {
            throw new BadRequestException(
                    "A proposta comercial só pode ser registrada após a proposta ficar ELIGIBLE ou ser reprovada.");
        }

        proposal.setResponsibleAnalyst(null);
        proposal.setStatus(ProposalStatus.COMMERCIAL_PROPOSAL.name());
        proposalRepository.save(proposal);
    }

    @Transactional
    public void markReadyForNextStage(Long proposalId) {
        Proposal proposal = findProposalOrThrow(proposalId);
        ProposalStatus currentStatus = normalizeProposalStatus(proposal.getStatus());

        if (currentStatus == ProposalStatus.READY_FOR_NEXT_STAGE) {
            return;
        }

        if (currentStatus != ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED) {
            throw new BadRequestException(
                    "A proposta só pode avançar para a próxima etapa após a aprovação da proposta comercial.");
        }

        proposal.setStatus(ProposalStatus.READY_FOR_NEXT_STAGE.name());
        proposalRepository.save(proposal);
    }

    @Transactional
    public void delete(Long id) {
        Proposal proposal = findProposalOrThrow(id);
        LocalDateTime now = LocalDateTime.now();

        reportRepository.softDeleteByProposalId(id, now);
        spreadsheetRepository.softDeleteByProposalId(id, now);
        contractRepository.softDeleteByProposalId(id, now);

        proposal.setDeletedAt(now);
        proposalRepository.save(proposal);
    }

    private Proposal findProposalOrThrow(Long id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada com id: " + id));
    }

    private void applyWorkflowStatus(Proposal proposal, ProposalStatus newStatus) {
        ProposalStatus currentStatus = normalizeProposalStatus(proposal.getStatus());

        if (currentStatus == newStatus) {
            proposal.setStatus(newStatus.name());
            return;
        }

        boolean transitionAllowed = switch (currentStatus) {
            case RECEIVED -> newStatus == ProposalStatus.IN_TRIAGE;
            case IN_TRIAGE -> newStatus == ProposalStatus.ELIGIBLE || newStatus == ProposalStatus.PENDING_ADJUSTMENTS;
            case PENDING_ADJUSTMENTS -> newStatus == ProposalStatus.IN_TRIAGE;
            case COMMERCIAL_PROPOSAL -> newStatus == ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED
                    || newStatus == ProposalStatus.COMMERCIAL_PROPOSAL_REJECTED;
            default -> false;
        };

        if (!transitionAllowed) {
            throw new BadRequestException(
                    "Transição de status inválida no fluxo da proposta: " + currentStatus + " -> " + newStatus);
        }

        if (newStatus == ProposalStatus.ELIGIBLE) {
            validateTriageGate(proposal.getEnterprise());
        }

        if (newStatus == ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED) {
            notifyComplianceAboutContractCreation(proposal);
            notifyEnterpriseAboutProposalApproval(proposal);
        }

        if (newStatus == ProposalStatus.COMMERCIAL_PROPOSAL_REJECTED) {
            proposal.setResponsibleAnalyst(null);
        }

        proposal.setStatus(newStatus.name());
    }

    private void assignResponsibleAnalyst(Proposal proposal, Long analystId) {
        ProposalStatus currentStatus = normalizeProposalStatus(proposal.getStatus());
        if (currentStatus != ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED
                && currentStatus != ProposalStatus.READY_FOR_NEXT_STAGE) {
            throw new BadRequestException(
                    "O analista responsável só pode ser definido após a aprovação da proposta comercial.");
        }

        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new ResourceNotFoundException("Analista não encontrado com id: " + analystId));

        if (analyst.getRole() == null || !ANALYST_ROLES.contains(analyst.getRole())) {
            throw new BadRequestException("O usuário informado não possui um papel de analista.");
        }

        if (proposal.getResponsibleAnalyst() != null && proposal.getResponsibleAnalyst().getId().equals(analyst.getId())) {
            return;
        }

        proposal.setResponsibleAnalyst(analyst);
        notifyResponsibleAnalyst(proposal, analyst);
    }

    private ProposalStatus normalizeProposalStatus(String status) {
        if (status == null || status.isBlank()) {
            return ProposalStatus.RECEIVED;
        }

        try {
            return ProposalStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Status atual da proposta não é compatível com o fluxo configurado: " + status);
        }
    }

    private void validateTriageGate(Enterprise enterprise) {
        if (enterprise == null) {
            throw new BadRequestException(
                    "Dados iniciais incompletos para avançar a proposta para ELIGIBLE: empresa");
        }

        List<String> pendingFields = new ArrayList<>();

        if (!hasText(enterprise.getLegalName())) pendingFields.add("razaoSocial");
        if (!hasText(enterprise.getCnpj())) pendingFields.add("cnpj");
        if (!hasText(enterprise.getEmail())) pendingFields.add("email");
        if (!hasText(enterprise.getPhone())) pendingFields.add("telefone");
        if (!hasText(enterprise.getRepresentativeName())) pendingFields.add("representanteNome");
        if (!hasText(enterprise.getRepresentativeCpf())) pendingFields.add("representanteCpf");
        if (!hasText(enterprise.getRepresentativePhone())) pendingFields.add("representanteContato");

        Address address = enterprise.getAddress();
        if (address == null) {
            pendingFields.add("endereco");
        } else {
            if (!hasText(address.getStreet())) pendingFields.add("endereco.logradouro");
            if (!hasText(address.getNumber())) pendingFields.add("endereco.numero");
            if (!hasText(address.getNeighborhood())) pendingFields.add("endereco.bairro");
            if (!hasText(address.getCity())) pendingFields.add("endereco.cidade");
            if (!hasText(address.getState())) pendingFields.add("endereco.uf");
            if (!hasText(address.getZipCode())) pendingFields.add("endereco.cep");
        }

        if (!pendingFields.isEmpty()) {
            throw new BadRequestException(
                    "Dados iniciais incompletos para avançar a proposta para ELIGIBLE: " + String.join(", ", pendingFields));
        }
    }

    private void notifyComplianceAboutContractCreation(Proposal proposal) {
        for (User complianceUser : userRepository.findByRole(Role.COMPLIANCE)) {
            notificationService.save(NotificationCreateRequest.builder()
                    .userId(complianceUser.getId())
                    .type("CONTRACT_CREATION_REQUIRED")
                    .message("Proposta " + proposal.getId() + " foi aprovada e requer criação de contrato.")
                    .build());
        }
    }

    private void notifyEnterpriseAboutProposalApproval(Proposal proposal) {
        if (proposal.getEnterprise() != null && hasText(proposal.getEnterprise().getEmail())) {
            String subject = "Sua proposta foi aceita! - Sistema Climbe";
            String body = String.format("Olá %s,\n\nTemos o prazer de informar que sua proposta comercial '%s' foi APROVADA com sucesso e avançará para as próximas etapas de criação de contrato.\n\nEquipe Climbe",
                    proposal.getEnterprise().getTradeName() != null ? proposal.getEnterprise().getTradeName() : proposal.getEnterprise().getLegalName(),
                    proposal.getId());
            emailSenderService.sendEmail(proposal.getEnterprise().getEmail(), subject, body);
        }
    }

    private void notifyResponsibleAnalyst(Proposal proposal, User analyst) {
        notificationService.save(NotificationCreateRequest.builder()
                .userId(analyst.getId())
                .type("RESPONSIBLE_ANALYST_ASSIGNED")
                .message("Você foi designado como analista responsável para a proposta " + proposal.getId() + ".")
                .build());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
