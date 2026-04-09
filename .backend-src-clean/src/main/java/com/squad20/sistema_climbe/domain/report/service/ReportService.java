package com.squad20.sistema_climbe.domain.report.service;

import com.squad20.sistema_climbe.domain.report.dto.ReportDTO;
import com.squad20.sistema_climbe.domain.report.entity.Report;
import com.squad20.sistema_climbe.domain.report.mapper.ReportMapper;
import com.squad20.sistema_climbe.domain.report.repository.ReportRepository;
import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ContractRepository contractRepository;
    private final ReportMapper reportMapper;

    @Transactional(readOnly = true)
    public Page<ReportDTO> findAll(Pageable pageable) {
        return reportRepository.findAll(pageable).map(reportMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ReportDTO> findByContractId(Long contractId) {
        return reportRepository.findByContract_Id(contractId).stream()
                .map(reportMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportDTO findById(Long id) {
        Report report = findReportOrThrow(id);
        return reportMapper.toDTO(report);
    }

    @Transactional
    public ReportDTO save(ReportDTO dto) {
        Contract contract = contractRepository.findById(dto.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado com id: " + dto.getContractId()));

        Report report = reportMapper.toEntity(dto);
        report.setContract(contract);
        report = reportRepository.save(report);
        return reportMapper.toDTO(report);
    }

    @Transactional
    public ReportDTO update(Long id, ReportDTO dto) {
        Report existing = findReportOrThrow(id);

        if (dto.getPdfUrl() != null) existing.setPdfUrl(dto.getPdfUrl());
        if (dto.getSentAt() != null) existing.setSentAt(dto.getSentAt());

        if (dto.getContractId() != null) {
            Contract contract = contractRepository.findById(dto.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado com id: " + dto.getContractId()));
            existing.setContract(contract);
        }

        existing = reportRepository.save(existing);
        return reportMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Report report = findReportOrThrow(id);
        reportRepository.delete(report);
    }

    private Report findReportOrThrow(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relatório não encontrado com id: " + id));
    }
}

