package com.squad20.sistema_climbe.domain.proposal.service;

import com.squad20.sistema_climbe.domain.enterprise.entity.Address;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.notification.entity.Notification;
import com.squad20.sistema_climbe.domain.notification.repository.NotificationRepository;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalCreateRequest;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalDTO;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalPatchRequest;
import com.squad20.sistema_climbe.domain.proposal.entity.ProposalStatus;
import com.squad20.sistema_climbe.domain.user.entity.Role;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProposalWorkflowSimulationIT {

    @Autowired
    private ProposalService proposalService;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    public void simulateBusinessWorkflow() {
        System.out.println("\n------------------------------------------------");
        System.out.println("--- INICIANDO SIMULAÇÃO DO FLUXO BPMN ---");
        System.out.println("------------------------------------------------\n");

        // 1. Setup inicial de atores do sistema
        System.out.println("[1] Criando usuários: Solicitante, Analista e Compliance...");
        User requester = userRepository.save(User.builder().fullName("João Solicitante").email("joao@test.com").cpf("11111111111").role(Role.CEO).build());
        User analyst = userRepository.save(User.builder().fullName("Maria Analista").email("maria@test.com").cpf("22222222222").role(Role.ANALISTA_BPO_FINANCEIRO).build());
        User compliance = userRepository.save(User.builder().fullName("Carlos Compliance").email("carlos@test.com").cpf("33333333333").role(Role.COMPLIANCE).build());

        // 2. Cadastro da Empresa (com erro de validação de Triage proposital primeiro)
        System.out.println("[2] Cadastrando Empresa com dados iniciais vazios...");
        Enterprise enterprise = enterpriseRepository.save(Enterprise.builder()
                .legalName("Empresa Fake LTDA")
                .cnpj("00000000000000")
                .email("contato@empresa.com")
                .build());

        // 3. Criação da Proposta
        System.out.println("[3] Criando Proposta Comercial Inicial...");
        ProposalCreateRequest createReq = new ProposalCreateRequest(enterprise.getId(), requester.getId(), null);
        ProposalDTO proposal = proposalService.save(createReq);
        assertEquals(ProposalStatus.RECEIVED.name(), proposal.getStatus());

        // Avança para Triagem
        proposal = proposalService.update(proposal.getId(), ProposalPatchRequest.builder().status(ProposalStatus.IN_TRIAGE).build());

        // 4. Tentativa de avançar para ELIGIBLE (Deve falhar)
        System.out.println("[4] Tentando avançar proposta para ELIGIBLE (Barreira de Triagem)...");
        try {
            proposalService.update(proposal.getId(), ProposalPatchRequest.builder().status(ProposalStatus.ELIGIBLE).build());
            fail("Deveria ter bloqueado por falta de dados da empresa!");
        } catch (Exception e) {
            System.out.println("    -> Sucesso na barreira! O sistema bloqueou com erro: " + e.getMessage());
        }

        // 5. Atualizando dados da empresa para satisfazer a barreira
        System.out.println("\n[5] Preenchendo todos os dados necessários da Empresa...");
        enterprise.setCnpj("12.345.678/0001-00");
        enterprise.setEmail("contato@empresafake.com");
        enterprise.setPhone("11999999999");
        enterprise.setRepresentativeName("Sr. Representante");
        enterprise.setRepresentativeCpf("44444444444");
        enterprise.setRepresentativePhone("11888888888");
        Address address = new Address();
        address.setStreet("Rua 1"); address.setNumber("123"); address.setNeighborhood("Bairro"); 
        address.setCity("Cidade"); address.setState("SP"); address.setZipCode("12345-678");
        enterprise.setAddress(address);
        enterpriseRepository.save(enterprise);

        // 6. Agora avança para ELIGIBLE
        System.out.println("[6] Avançando proposta para ELIGIBLE com sucesso...");
        proposal = proposalService.update(proposal.getId(), ProposalPatchRequest.builder().status(ProposalStatus.ELIGIBLE).build());
        assertEquals(ProposalStatus.ELIGIBLE.name(), proposal.getStatus());

        // 7. Avançando para Proposta Comercial
        System.out.println("[7] Elaborando Documento de Proposta Comercial...");
        proposalService.markCommercialProposalSubmitted(proposal.getId());
        proposal = proposalService.findById(proposal.getId());
        assertEquals(ProposalStatus.COMMERCIAL_PROPOSAL.name(), proposal.getStatus());

        // 8. Aprovação da Proposta
        System.out.println("[8] Cliente aceitou! Aprovando Proposta Comercial...");
        proposal = proposalService.update(proposal.getId(), ProposalPatchRequest.builder().status(ProposalStatus.COMMERCIAL_PROPOSAL_APPROVED).build());
        
        // 9. Seleção de Elenco (Analista)
        System.out.println("[9] Selecionando o Analista Responsável...");
        proposal = proposalService.update(proposal.getId(), ProposalPatchRequest.builder().responsibleAnalystId(analyst.getId()).build());
        assertEquals(analyst.getId(), proposal.getResponsibleAnalystId());

        // 10. Verificando as Notificações geradas automaticamente
        System.out.println("\n[10] Auditando Notificações Automáticas...");
        
        List<Notification> analystNotifications = notificationRepository.findAll().stream()
            .filter(n -> n.getUser().getId().equals(analyst.getId())).toList();
        assertFalse(analystNotifications.isEmpty(), "Notificação não enviada para Analista");
        System.out.println("    -> Notificação pro Analista disparada com Sucesso: " + analystNotifications.get(0).getMessage());

        List<Notification> complianceNotifications = notificationRepository.findAll().stream()
            .filter(n -> n.getUser().getId().equals(compliance.getId())).toList();
        assertFalse(complianceNotifications.isEmpty(), "Notificação não enviada para Compliance");
        System.out.println("    -> Notificação pra Compliance disparada com Sucesso: " + complianceNotifications.get(0).getMessage());

        System.out.println("\n------------------------------------------------");
        System.out.println("--- SIMULAÇÃO BEM SUCEDIDA! O FLUXO ESTÁ FUNCIONANDO PERFEITAMENTE ---");
        System.out.println("------------------------------------------------\n");
    }
}
