package com.squad20.sistema_climbe.domain.user.repository;

import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"permissions"})
    Optional<User> findByEmail(String email);

    Optional<User> findByCpf(String cpf);

    List<User> findByRole(Role role);
}
