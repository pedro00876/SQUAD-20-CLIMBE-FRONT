package com.squad20.sistema_climbe.config;

import com.squad20.sistema_climbe.domain.cargo.entity.Cargo;
import com.squad20.sistema_climbe.domain.cargo.repository.CargoRepository;
import com.squad20.sistema_climbe.domain.permission.entity.Permission;
import com.squad20.sistema_climbe.domain.permission.repository.PermissionRepository;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CargoRepository cargoRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (cargoRepository.count() == 0) {
            Cargo admin = Cargo.builder().name("ADMINISTRADOR").build();
            Cargo gerente = Cargo.builder().name("GERENTE").build();
            Cargo colab = Cargo.builder().name("COLABORADOR").build();
            
            cargoRepository.saveAll(Arrays.asList(admin, gerente, colab));
            System.out.println("Cargos iniciais cadastrados.");
        }

        if (permissionRepository.count() == 0) {
            Permission read = Permission.builder().description("LEITURA").build();
            Permission write = Permission.builder().description("ESCRITA").build();
            Permission delete = Permission.builder().description("EXCLUSAO").build();
            
            permissionRepository.saveAll(Arrays.asList(read, write, delete));
            System.out.println("Permissões iniciais cadastradas.");
        }

        if (userRepository.findByEmail("admin@climbe.com.br").isEmpty()) {
            User admin = User.builder()
                    .fullName("Administrador Sistema")
                    .email("admin@climbe.com.br")
                    .cpf("00000000000")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.CEO)
                    .status("ATIVO")
                    .build();
            
            userRepository.save(admin);
            System.out.println("Usuário administrador padrão criado: admin@climbe.com.br / admin123");
        }
    }
}
