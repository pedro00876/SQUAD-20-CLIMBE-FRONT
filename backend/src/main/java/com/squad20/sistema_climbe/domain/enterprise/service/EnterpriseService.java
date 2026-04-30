package com.squad20.sistema_climbe.domain.enterprise.service;

import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import com.squad20.sistema_climbe.domain.document.repository.DocumentRepository;
import com.squad20.sistema_climbe.domain.enterprise.entity.Address;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.dto.AddressPatchRequest;
import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseCreateRequest;
import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseDTO;
import com.squad20.sistema_climbe.domain.enterprise.dto.EnterprisePatchRequest;
import com.squad20.sistema_climbe.domain.enterprise.mapper.EnterpriseMapper;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.meeting.repository.MeetingRepository;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.report.repository.ReportRepository;
import com.squad20.sistema_climbe.domain.spreadsheet.repository.SpreadsheetRepository;
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
public class EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;
    private final DocumentRepository documentRepository;
    private final MeetingRepository meetingRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;
    private final ReportRepository reportRepository;
    private final SpreadsheetRepository spreadsheetRepository;
    private final EnterpriseMapper enterpriseMapper;

    @Transactional(readOnly = true)
    public Page<EnterpriseDTO> findAll(Pageable pageable) {
        return enterpriseRepository.findAll(pageable).map(enterpriseMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public EnterpriseDTO findById(Long id) {
        Enterprise enterprise = findEnterpriseOrThrow(id);
        return enterpriseMapper.toDTO(enterprise);
    }

    @Transactional(readOnly = true)
    public EnterpriseDTO findByEmail(String email) {
        Enterprise enterprise = enterpriseRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada"));
        return enterpriseMapper.toDTO(enterprise);
    }

    @Transactional(readOnly = true)
    public EnterpriseDTO findByCnpj(String cnpj) {
        Enterprise enterprise = enterpriseRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada"));
        return enterpriseMapper.toDTO(enterprise);
    }

    @Transactional
    public EnterpriseDTO save(EnterpriseCreateRequest request) {
        if (enterpriseRepository.findByCnpj(request.getCnpj()).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este CNPJ");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && enterpriseRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este e-mail");
        }

        Enterprise enterprise = enterpriseMapper.toEntity(request);
        enterprise.setId(null);
        enterprise = enterpriseRepository.save(enterprise);
        return enterpriseMapper.toDTO(enterprise);
    }

    @Transactional
    public EnterpriseDTO update(Long id, EnterprisePatchRequest patch) {
        Enterprise existing = findEnterpriseOrThrow(id);

        if (patch.getCnpj() != null && !patch.getCnpj().equals(existing.getCnpj())
                && enterpriseRepository.findByCnpj(patch.getCnpj())
                .filter(e -> !e.getId().equals(id)).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este CNPJ");
        }

        if (patch.getEmail() != null && !patch.getEmail().isBlank() && !patch.getEmail().equals(existing.getEmail())
                && enterpriseRepository.findByEmail(patch.getEmail())
                .filter(e -> !e.getId().equals(id)).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este e-mail");
        }

        if (patch.getLegalName() != null) existing.setLegalName(patch.getLegalName());
        if (patch.getTradeName() != null) existing.setTradeName(patch.getTradeName());
        if (patch.getCnpj() != null) existing.setCnpj(patch.getCnpj());
        if (patch.getEmail() != null) existing.setEmail(patch.getEmail());
        if (patch.getAddress() != null) updateAddress(existing, patch.getAddress());
        if (patch.getPhone() != null) existing.setPhone(patch.getPhone());
        if (patch.getRepresentativeName() != null) existing.setRepresentativeName(patch.getRepresentativeName());
        if (patch.getRepresentativeCpf() != null) existing.setRepresentativeCpf(patch.getRepresentativeCpf());
        if (patch.getRepresentativePhone() != null) existing.setRepresentativePhone(patch.getRepresentativePhone());

        existing = enterpriseRepository.save(existing);
        return enterpriseMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Enterprise enterprise = findEnterpriseOrThrow(id);
        // Cascade soft delete: deletar empresa propaga para todos os registros associados.
        // Ordem importa: filhos antes do pai para evitar inconsistências.
        LocalDateTime now = LocalDateTime.now();
        reportRepository.softDeleteByEnterpriseId(id, now);
        spreadsheetRepository.softDeleteByEnterpriseId(id, now);
        contractRepository.softDeleteByEnterpriseId(id, now);
        proposalRepository.softDeleteByEnterpriseId(id, now);
        documentRepository.softDeleteByEnterpriseId(id, now);
        meetingRepository.softDeleteByEnterpriseId(id, now);

        enterprise.setDeletedAt(now);
        enterpriseRepository.save(enterprise);
    }

    private Enterprise findEnterpriseOrThrow(Long id) {
        return enterpriseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada"));
    }

    private void updateAddress(Enterprise existing, AddressPatchRequest patch) {
        Address address = existing.getAddress() != null ? existing.getAddress() : new Address();

        if (patch.getStreet() != null) address.setStreet(patch.getStreet());
        if (patch.getNumber() != null) address.setNumber(patch.getNumber());
        if (patch.getNeighborhood() != null) address.setNeighborhood(patch.getNeighborhood());
        if (patch.getCity() != null) address.setCity(patch.getCity());
        if (patch.getState() != null) address.setState(patch.getState());
        if (patch.getZipCode() != null) address.setZipCode(patch.getZipCode());

        existing.setAddress(address);
    }
}
