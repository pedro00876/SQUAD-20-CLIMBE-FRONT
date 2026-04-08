package com.squad20.sistema_climbe.domain.cargo.service;

import com.squad20.sistema_climbe.domain.cargo.dto.CargoCreateRequest;
import com.squad20.sistema_climbe.domain.cargo.dto.CargoPatchRequest;
import com.squad20.sistema_climbe.domain.cargo.entity.Cargo;
import com.squad20.sistema_climbe.domain.cargo.dto.CargoDTO;
import com.squad20.sistema_climbe.domain.cargo.mapper.CargoMapper;
import com.squad20.sistema_climbe.domain.cargo.repository.CargoRepository;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository cargoRepository;
    private final CargoMapper cargoMapper;

    @Transactional(readOnly = true)
    public Page<CargoDTO> findAll(Pageable pageable) {
        return cargoRepository.findAll(pageable).map(cargoMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public CargoDTO findById(Long id) {
        Cargo role = findRoleOrThrow(id);
        return cargoMapper.toDTO(role);
    }

    @Transactional
    public CargoDTO save(CargoCreateRequest request) {
        Cargo role = cargoMapper.toEntity(request);
        role.setId(null); 
        role = cargoRepository.save(role);
        return cargoMapper.toDTO(role);
    }

    @Transactional
    public CargoDTO update(Long id, CargoPatchRequest patch) {
        Cargo role = findRoleOrThrow(id);
        if (patch.getName() != null) {
            role.setName(patch.getName());
        }
        role = cargoRepository.save(role);
        return cargoMapper.toDTO(role);
    }

    @Transactional
    public void delete(Long id) {
        Cargo role = findRoleOrThrow(id);
        cargoRepository.delete(role);
    }

    private Cargo findRoleOrThrow(Long id) {
        return cargoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo não encontrado com id: " + id));
    }

}
