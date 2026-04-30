package com.squad20.sistema_climbe.domain.document.service;

import com.squad20.sistema_climbe.domain.document.dto.DocumentCreateRequest;
import com.squad20.sistema_climbe.domain.document.dto.DocumentDTO;
import com.squad20.sistema_climbe.domain.document.dto.DocumentPatchRequest;
import com.squad20.sistema_climbe.domain.document.entity.Document;
import com.squad20.sistema_climbe.domain.document.mapper.DocumentMapper;
import com.squad20.sistema_climbe.domain.document.repository.DocumentRepository;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.proposal.service.ProposalService;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.BadRequestException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import com.squad20.sistema_climbe.service.GoogleCloudStorageService;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final String COMMERCIAL_PROPOSAL_DOCUMENT_TYPE = "COMMERCIAL_PROPOSAL";

    private final DocumentRepository documentRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ProposalRepository proposalRepository;
    private final UserRepository userRepository;
    private final ProposalService proposalService;
    private final DocumentMapper documentMapper;
    private final GoogleCloudStorageService storageService;

    @Transactional(readOnly = true)
    public Page<DocumentDTO> findAll(Pageable pageable) {
        return documentRepository.findAll(pageable).map(documentMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findByEnterpriseId(Long enterpriseId) {
        return documentRepository.findByEnterprise_Id(enterpriseId).stream()
                .map(documentMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findByAnalystId(Long analystId) {
        return documentRepository.findByAnalyst_Id(analystId).stream()
                .map(documentMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDTO findById(Long id) {
        Document document = findDocumentOrThrow(id);
        return documentMapper.toDTO(document);
    }

    @Transactional
    public DocumentDTO save(DocumentCreateRequest request) {
        Enterprise enterprise = findEnterpriseOrThrow(request.getEnterpriseId());
        Proposal proposal = request.getProposalId() != null ? findProposalOrThrow(request.getProposalId()) : null;
        User analyst = request.getAnalystId() != null ? findAnalystOrThrow(request.getAnalystId()) : null;

        validateProposalEnterpriseRelation(enterprise, proposal);
        validateCommercialProposalRequirements(request.getDocumentType(), proposal);

        Document document = documentMapper.toEntity(request);
        document.setId(null);
        document.setEnterprise(enterprise);
        document.setProposal(proposal);
        document.setAnalyst(analyst);
        document = documentRepository.save(document);

        if (isCommercialProposalDocument(document.getDocumentType()) && proposal != null) {
            proposalService.markCommercialProposalSubmitted(proposal.getId());
        }

        return documentMapper.toDTO(document);
    }

    @Transactional
    public DocumentDTO saveWithFile(DocumentCreateRequest request, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            try {
                String internalPath = storageService.uploadPrivateFile(file, "documentos_empresa_" + request.getEnterpriseId());
                request.setUrl(internalPath); // Salva o caminho interno no GCP
            } catch (IOException e) {
                throw new com.squad20.sistema_climbe.exception.BadRequestException("Erro ao fazer upload do arquivo para o GCP: " + e.getMessage());
            }
        }
        return save(request);
    }

    @Transactional(readOnly = true)
    public String generateViewUrl(Long id) {
        Document document = findDocumentOrThrow(id);
        if (document.getUrl() == null || document.getUrl().isEmpty()) {
            throw new ResourceNotFoundException("Este documento não possui um arquivo anexado.");
        }
        
        try {
            // Se for uma URL antiga externa, devolve direto. Se for path do bucket, assina.
            if (document.getUrl().startsWith("http")) {
                return document.getUrl();
            }
            return storageService.generateSignedUrl(document.getUrl());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar link seguro de visualização", e);
        }
    }

    @Transactional
    public DocumentDTO update(Long id, DocumentPatchRequest patch) {
        Document existing = findDocumentOrThrow(id);

        if (patch.getDocumentType() != null) existing.setDocumentType(patch.getDocumentType());
        if (patch.getUrl() != null) existing.setUrl(patch.getUrl());
        if (patch.getValidated() != null) existing.setValidated(patch.getValidated());

        Enterprise enterprise = existing.getEnterprise();
        if (patch.getEnterpriseId() != null) {
            enterprise = findEnterpriseOrThrow(patch.getEnterpriseId());
            existing.setEnterprise(enterprise);
        }

        Proposal proposal = existing.getProposal();
        if (patch.getProposalId() != null) {
            proposal = findProposalOrThrow(patch.getProposalId());
            existing.setProposal(proposal);
        }

        if (patch.getAnalystId() != null) {
            existing.setAnalyst(findAnalystOrThrow(patch.getAnalystId()));
        }

        validateProposalEnterpriseRelation(enterprise, proposal);
        validateCommercialProposalRequirements(existing.getDocumentType(), proposal);

        existing = documentRepository.save(existing);
        return documentMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Document document = findDocumentOrThrow(id);
        document.setDeletedAt(java.time.LocalDateTime.now());
        documentRepository.save(document);
    }

    private Enterprise findEnterpriseOrThrow(Long enterpriseId) {
        return enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa nao encontrada com id: " + enterpriseId));
    }

    private Proposal findProposalOrThrow(Long proposalId) {
        return proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta nao encontrada com id: " + proposalId));
    }

    private User findAnalystOrThrow(Long analystId) {
        return userRepository.findById(analystId)
                .orElseThrow(() -> new ResourceNotFoundException("Analista nao encontrado com id: " + analystId));
    }

    private void validateProposalEnterpriseRelation(Enterprise enterprise, Proposal proposal) {
        if (proposal == null) {
            return;
        }

        if (!proposal.getEnterprise().getId().equals(enterprise.getId())) {
            throw new BadRequestException("A proposta informada nao pertence a empresa do documento.");
        }
    }

    private void validateCommercialProposalRequirements(String documentType, Proposal proposal) {
        if (isCommercialProposalDocument(documentType) && proposal == null) {
            throw new BadRequestException("Um documento de proposta comercial exige uma proposta vinculada.");
        }
    }

    private boolean isCommercialProposalDocument(String documentType) {
        return documentType != null
                && COMMERCIAL_PROPOSAL_DOCUMENT_TYPE.equals(documentType.trim().toUpperCase(Locale.ROOT));
    }

    private Document findDocumentOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento nao encontrado com id: " + id));
    }
}
