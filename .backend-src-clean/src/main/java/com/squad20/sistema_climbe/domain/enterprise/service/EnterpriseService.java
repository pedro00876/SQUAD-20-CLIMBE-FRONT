package com.squad20.sistema_climbe.domain.enterprise.service;

import com.squad20.sistema_climbe.domain.enterprise.entity.Address;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.dto.AddressDTO;
import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseDTO;
import com.squad20.sistema_climbe.domain.enterprise.mapper.EnterpriseMapper;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.exception.ConflictException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;
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
    public EnterpriseDTO save(EnterpriseDTO dto) {
        if (enterpriseRepository.findByCnpj(dto.getCnpj()).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este CNPJ");
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && enterpriseRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este e-mail");
        }

        Enterprise enterprise = enterpriseMapper.toEntity(dto);
        enterprise = enterpriseRepository.save(enterprise);
        return enterpriseMapper.toDTO(enterprise);
    }

    @Transactional
    public EnterpriseDTO update(Long id, EnterpriseDTO dto) {
        Enterprise existing = findEnterpriseOrThrow(id);

        if (dto.getCnpj() != null && !dto.getCnpj().equals(existing.getCnpj())
                && enterpriseRepository.findByCnpj(dto.getCnpj())
                .filter(e -> !e.getId().equals(id)).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este CNPJ");
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank() && !dto.getEmail().equals(existing.getEmail())
                && enterpriseRepository.findByEmail(dto.getEmail())
                .filter(e -> !e.getId().equals(id)).isPresent()) {
            throw new ConflictException("Já existe empresa cadastrada com este e-mail");
        }

        if (dto.getLegalName() != null) existing.setLegalName(dto.getLegalName());
        if (dto.getTradeName() != null) existing.setTradeName(dto.getTradeName());
        if (dto.getCnpj() != null) existing.setCnpj(dto.getCnpj());
        if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
        if (dto.getAddress() != null) updateAddress(existing, dto.getAddress());
        if (dto.getPhone() != null) existing.setPhone(dto.getPhone());
        if (dto.getRepresentativeName() != null) existing.setRepresentativeName(dto.getRepresentativeName());
        if (dto.getRepresentativeCpf() != null) existing.setRepresentativeCpf(dto.getRepresentativeCpf());
        if (dto.getRepresentativePhone() != null) existing.setRepresentativePhone(dto.getRepresentativePhone());

        existing = enterpriseRepository.save(existing);
        return enterpriseMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Enterprise enterprise = findEnterpriseOrThrow(id);
        enterpriseRepository.delete(enterprise);
    }

    private Enterprise findEnterpriseOrThrow(Long id) {
        return enterpriseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada"));
    }

    private void updateAddress(Enterprise existing, AddressDTO dto) {
        Address address = existing.getAddress() != null ? existing.getAddress() : new Address();

        if (dto.getStreet() != null) address.setStreet(dto.getStreet());
        if (dto.getNumber() != null) address.setNumber(dto.getNumber());
        if (dto.getNeighborhood() != null) address.setNeighborhood(dto.getNeighborhood());
        if (dto.getCity() != null) address.setCity(dto.getCity());
        if (dto.getState() != null) address.setState(dto.getState());
        if (dto.getZipCode() != null) address.setZipCode(dto.getZipCode());

        existing.setAddress(address);
    }
}
