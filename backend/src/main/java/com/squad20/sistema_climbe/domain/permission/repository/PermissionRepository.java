package com.squad20.sistema_climbe.domain.permission.repository;

import com.squad20.sistema_climbe.domain.permission.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
}

