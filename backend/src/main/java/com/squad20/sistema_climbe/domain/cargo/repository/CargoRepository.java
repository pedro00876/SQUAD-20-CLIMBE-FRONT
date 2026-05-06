package com.squad20.sistema_climbe.domain.cargo.repository;

import com.squad20.sistema_climbe.domain.cargo.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
}
