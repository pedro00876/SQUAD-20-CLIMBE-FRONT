package com.squad20.sistema_climbe.domain.service.service;

import com.squad20.sistema_climbe.domain.service.dto.ServiceCreateRequest;
import com.squad20.sistema_climbe.domain.service.dto.ServicePatchRequest;
import com.squad20.sistema_climbe.domain.service.entity.OfferedService;
import com.squad20.sistema_climbe.domain.service.dto.ServiceDTO;
import com.squad20.sistema_climbe.domain.service.mapper.OfferedServiceMapper;
import com.squad20.sistema_climbe.domain.service.repository.ServiceRepository;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final OfferedServiceMapper offeredServiceMapper;

    @Transactional(readOnly = true)
    public Page<ServiceDTO> findAll(Pageable pageable) {
        return serviceRepository.findAll(pageable).map(offeredServiceMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public ServiceDTO findById(Long id) {
        OfferedService entity = findServiceOrThrow(id);
        return offeredServiceMapper.toDTO(entity);
    }

    @Transactional
    public ServiceDTO save(ServiceCreateRequest request) {
        OfferedService entity = offeredServiceMapper.toEntity(request);
        entity.setId(null);
        entity = serviceRepository.save(entity);
        return offeredServiceMapper.toDTO(entity);
    }

    @Transactional
    public ServiceDTO update(Long id, ServicePatchRequest patch) {
        OfferedService entity = findServiceOrThrow(id);
        if (patch.getName() != null) entity.setName(patch.getName());
        entity = serviceRepository.save(entity);
        return offeredServiceMapper.toDTO(entity);
    }

    @Transactional
    public void delete(Long id) {
        OfferedService entity = findServiceOrThrow(id);
        entity.setDeletedAt(java.time.LocalDateTime.now());
        serviceRepository.save(entity);
    }

    private OfferedService findServiceOrThrow(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com id: " + id));
    }
}

