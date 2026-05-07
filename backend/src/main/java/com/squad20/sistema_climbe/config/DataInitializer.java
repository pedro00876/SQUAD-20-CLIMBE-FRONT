package com.squad20.sistema_climbe.config;

import com.squad20.sistema_climbe.domain.cargo.entity.Cargo;
import com.squad20.sistema_climbe.domain.cargo.repository.CargoRepository;
import com.squad20.sistema_climbe.domain.permission.entity.Permission;
import com.squad20.sistema_climbe.domain.permission.repository.PermissionRepository;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import com.squad20.sistema_climbe.domain.meeting.entity.Meeting;
import com.squad20.sistema_climbe.domain.meeting.repository.MeetingRepository;
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
    private final EnterpriseRepository enterpriseRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;
    private final MeetingRepository meetingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCargos();
        seedPermissions();
        User admin = seedAdminUser();
        
        if (enterpriseRepository.count() == 0) {
            seedInitialData(admin);
        }
    }

    private void seedCargos() {
        if (cargoRepository.count() == 0) {
            Cargo admin = Cargo.builder().name("ADMINISTRADOR").build();
            Cargo gerente = Cargo.builder().name("GERENTE").build();
            Cargo colab = Cargo.builder().name("COLABORADOR").build();
            
            cargoRepository.saveAll(Arrays.asList(admin, gerente, colab));
            System.out.println("Cargos iniciais cadastrados.");
        }
    }

    private void seedPermissions() {
        if (permissionRepository.count() == 0) {
            Permission read = Permission.builder().description("LEITURA").build();
            Permission write = Permission.builder().description("ESCRITA").build();
            Permission delete = Permission.builder().description("EXCLUSAO").build();
            
            permissionRepository.saveAll(Arrays.asList(read, write, delete));
            System.out.println("Permissões iniciais cadastradas.");
        }
    }

    private User seedAdminUser() {
        return userRepository.findByEmail("admin@climbe.com.br")
                .orElseGet(() -> {
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
                    return admin;
                });
    }

    private void seedInitialData(User admin) {
        // Enterprises
        Enterprise ent1 = Enterprise.builder()
                .legalName("Tech Solutions Ltda")
                .tradeName("Tech Solutions")
                .cnpj("12.345.678/0001-90")
                .email("contato@techsolutions.com")
                .phone("(11) 98888-7777")
                .build();

        Enterprise ent2 = Enterprise.builder()
                .legalName("Global Logistics S.A.")
                .tradeName("Global Log")
                .cnpj("98.765.432/0001-10")
                .email("financeiro@globallog.com")
                .phone("(21) 3333-4444")
                .build();

        Enterprise ent3 = Enterprise.builder()
                .legalName("Inova Marketing Digital")
                .tradeName("Inova")
                .cnpj("45.678.912/0001-33")
                .email("admin@inova.com")
                .build();

        enterpriseRepository.saveAll(Arrays.asList(ent1, ent2, ent3));

        // Proposals
        Proposal p1 = Proposal.builder()
                .enterprise(ent1)
                .user(admin)
                .status("ACEITA")
                .build();

        Proposal p2 = Proposal.builder()
                .enterprise(ent2)
                .user(admin)
                .status("PENDENTE")
                .build();

        Proposal p3 = Proposal.builder()
                .enterprise(ent3)
                .user(admin)
                .status("ACEITA")
                .build();

        Proposal p4 = Proposal.builder()
                .enterprise(ent1)
                .user(admin)
                .status("RECUSADA")
                .build();

        proposalRepository.saveAll(Arrays.asList(p1, p2, p3, p4));

        // Contracts
        Contract c1 = Contract.builder()
                .proposal(p1)
                .startDate(java.time.LocalDate.now().minusMonths(1))
                .endDate(java.time.LocalDate.now().plusMonths(11))
                .status("ATIVO")
                .build();

        Contract c2 = Contract.builder()
                .proposal(p3)
                .startDate(java.time.LocalDate.now())
                .endDate(java.time.LocalDate.now().plusYears(1))
                .status("ATIVO")
                .build();

        contractRepository.saveAll(Arrays.asList(c1, c2));

        // Meetings
        Meeting m1 = Meeting.builder()
                .title("Reunião de Alinhamento - Tech Solutions")
                .enterprise(ent1)
                .date(java.time.LocalDate.now().plusDays(1))
                .time(java.time.LocalTime.of(10, 0))
                .status("AGENDADA")
                .inPerson(false)
                .build();

        Meeting m2 = Meeting.builder()
                .title("Apresentação de Resultados - Global Log")
                .enterprise(ent2)
                .date(java.time.LocalDate.now().plusDays(3))
                .time(java.time.LocalTime.of(14, 30))
                .status("AGENDADA")
                .inPerson(true)
                .location("Escritório Central")
                .build();

        meetingRepository.saveAll(Arrays.asList(m1, m2));

        System.out.println("Dados de demonstração semeados com sucesso.");
    }
}
