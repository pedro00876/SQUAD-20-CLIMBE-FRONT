package com.squad20.sistema_climbe.domain.service.repository;

import com.squad20.sistema_climbe.domain.service.entity.OfferedService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<OfferedService, Long> {
}

