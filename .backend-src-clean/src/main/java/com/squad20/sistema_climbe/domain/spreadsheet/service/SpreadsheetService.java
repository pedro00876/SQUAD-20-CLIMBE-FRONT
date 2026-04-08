package com.squad20.sistema_climbe.domain.spreadsheet.service;

import com.squad20.sistema_climbe.domain.spreadsheet.dto.SpreadsheetDTO;
import com.squad20.sistema_climbe.domain.spreadsheet.entity.Spreadsheet;
import com.squad20.sistema_climbe.domain.spreadsheet.mapper.SpreadsheetMapper;
import com.squad20.sistema_climbe.domain.spreadsheet.repository.SpreadsheetRepository;
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
public class SpreadsheetService {

    private final SpreadsheetRepository spreadsheetRepository;
    private final ContractRepository contractRepository;
    private final SpreadsheetMapper spreadsheetMapper;

    @Transactional(readOnly = true)
    public Page<SpreadsheetDTO> findAll(Pageable pageable) {
        return spreadsheetRepository.findAll(pageable).map(spreadsheetMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<SpreadsheetDTO> findByContractId(Long contractId) {
        return spreadsheetRepository.findByContract_Id(contractId).stream()
                .map(spreadsheetMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SpreadsheetDTO findById(Long id) {
        Spreadsheet spreadsheet = findSpreadsheetOrThrow(id);
        return spreadsheetMapper.toDTO(spreadsheet);
    }

    @Transactional
    public SpreadsheetDTO save(SpreadsheetDTO dto) {
        Contract contract = contractRepository.findById(dto.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado com id: " + dto.getContractId()));

        Spreadsheet spreadsheet = spreadsheetMapper.toEntity(dto);
        spreadsheet.setContract(contract);
        spreadsheet = spreadsheetRepository.save(spreadsheet);
        return spreadsheetMapper.toDTO(spreadsheet);
    }

    @Transactional
    public SpreadsheetDTO update(Long id, SpreadsheetDTO dto) {
        Spreadsheet existing = findSpreadsheetOrThrow(id);

        if (dto.getGoogleSheetsUrl() != null) existing.setGoogleSheetsUrl(dto.getGoogleSheetsUrl());
        if (dto.getLocked() != null) existing.setLocked(dto.getLocked());
        if (dto.getViewPermission() != null) existing.setViewPermission(dto.getViewPermission());

        if (dto.getContractId() != null) {
            Contract contract = contractRepository.findById(dto.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado com id: " + dto.getContractId()));
            existing.setContract(contract);
        }

        existing = spreadsheetRepository.save(existing);
        return spreadsheetMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Spreadsheet spreadsheet = findSpreadsheetOrThrow(id);
        spreadsheetRepository.delete(spreadsheet);
    }

    private Spreadsheet findSpreadsheetOrThrow(Long id) {
        return spreadsheetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Planilha não encontrada com id: " + id));
    }
}

