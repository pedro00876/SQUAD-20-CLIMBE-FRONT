package com.squad20.sistema_climbe.domain.enterprise.repository;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnterpriseRepository extends JpaRepository<Enterprise, Long> {

    Optional<Enterprise> findByEmail(String email);

    Optional<Enterprise> findByCnpj(String cnpj);
}
