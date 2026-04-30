package com.squad20.sistema_climbe.domain.contract.service;

import com.squad20.sistema_climbe.domain.contract.dto.ContractCreateRequest;
import com.squad20.sistema_climbe.domain.contract.dto.ContractDTO;
import com.squad20.sistema_climbe.domain.contract.dto.ContractPatchRequest;
import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import com.squad20.sistema_climbe.domain.contract.mapper.ContractMapper;
import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import com.squad20.sistema_climbe.domain.proposal.entity.ProposalStatus;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.proposal.service.ProposalService;
import com.squad20.sistema_climbe.domain.report.repository.ReportRepository;
import com.squad20.sistema_climbe.domain.spreadsheet.repository.SpreadsheetRepository;
import com.squad20.sistema_climbe.exception.BadRequestException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContractService {

    private static final String DIGITALLY_SIGNED_STATUS = "DIGITALLY_SIGNED";

    private final ContractRepository contractRepository;
    private final ProposalRepository proposalRepository;
    private final ReportRepository reportRepository;
    private final SpreadsheetRepository spreadsheetRepository;
    private final ProposalService proposalService;
    private final ContractMapper contractMapper;

    @Transactional(readOnly = true)
    public Page<ContractDTO> findAll(Pageable pageable) {
        return contractRepository.findAll(pageable).map(contractMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ContractDTO> findByProposalId(Long proposalId) {
        return contractRepository.findByProposal_Id(proposalId).stream()
                .map(contractMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContractDTO findById(Long id) {
        Contract contract = findContractOrThrow(id);
        return contractMapper.toDTO(contract);
    }

    @Transactional
    public ContractDTO save(ContractCreateRequest request) {
        Proposal proposal = findProposalOrThrow(request.getProposalId());
        validateProposalCanCreateContract(proposal);

        Contract contract = contractMapper.toEntity(request);
        contract.setId(null);
        contract.setProposal(proposal);
        contract = contractRepository.save(contract);

        updateProposalIfContractWasSigned(contract);
        return contractMapper.toDTO(contract);
    }

    @Transactional
    public ContractDTO update(Long id, ContractPatchRequest patch) {
        Contract existing = findContractOrThrow(id);

        if (patch.getStartDate() != null) existing.setStartDate(patch.getStartDate());
        if (patch.getEndDate() != null) existing.setEndDate(patch.getEndDate());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());

        if (patch.getProposalId() != null) {
            Proposal proposal = findProposalOrThrow(patch.getProposalId());
            validateProposalCanCreateContract(proposal);
            existing.setProposal(proposal);
        }

        existing = contractRepository.save(existing);
        updateProposalIfContractWasSigned(existing);
        return contractMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Contract contract = findContractOrThrow(id);
        LocalDateTime now = LocalDateTime.now();
        reportRepository.softDeleteByContractId(id, now);
        spreadsheetRepository.softDeleteByContractId(id, now);

        contract.setDeletedAt(now);
        contractRepository.save(contract);
    }

    private Proposal findProposalOrThrow(Long proposalId) {
        return proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada com id: " + proposalId));
    }

    private void validateProposalCanCreateContract(Proposal proposal) {
        ProposalStatus status = normalizeProposalStatus(proposal.getStatus());
        if (status != ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED) {
            throw new BadRequestException(
                    "O contrato só pode ser criado quando a proposta comercial estiver aprovada.");
        }
    }

    private void updateProposalIfContractWasSigned(Contract contract) {
        if (isDigitallySigned(contract.getStatus())) {
            proposalService.markReadyForNextStage(contract.getProposal().getId());
        }
    }

    private boolean isDigitallySigned(String status) {
        return status != null && DIGITALLY_SIGNED_STATUS.equals(status.trim().toUpperCase(Locale.ROOT));
    }

    private ProposalStatus normalizeProposalStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("A proposta vinculada ao contrato não possui um status válido.");
        }

        try {
            return ProposalStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Status da proposta não é compatível com o fluxo de contrato: " + status);
        }
    }

    private Contract findContractOrThrow(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado com id: " + id));
    }
}
