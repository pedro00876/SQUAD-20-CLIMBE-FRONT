package com.squad20.sistema_climbe.api;

import com.squad20.sistema_climbe.domain.user.entity.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes da API /api/proposals. GET lista e GET 404; POST exige enterpriseId e userId. */
class ProposalApiTest extends ApiTestBase {

    @Override
    protected String getBasePath() {
        return "/api/proposals";
    }

    @Override
    protected String getMinimalPostBody() {
        try {
            String enterpriseId = createEnterprise();
            UserFixture user = createUser();
            return "{\"enterpriseId\":" + enterpriseId + ",\"userId\":" + user.id() + ",\"createdAt\":\"2026-03-20T10:15:30\"}";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getPatchBody() {
        return "{\"status\":\"IN_TRIAGE\"}";
    }

    @Test
    @DisplayName("POST creates proposal with initial RECEIVED status")
    void postCreatesProposalWithReceivedStatus() throws Exception {
        String enterpriseId = createEnterprise();
        UserFixture user = createUser();

        mockMvc.perform(post(getBasePath())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"enterpriseId\":" + enterpriseId + ",\"userId\":" + user.id() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }

    @Test
    @DisplayName("PATCH allows advancing from RECEIVED to IN_TRIAGE")
    void patchAllowsReceivedToInTriage() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_TRIAGE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRIAGE"));
    }

    @Test
    @DisplayName("PATCH blocks direct advance from RECEIVED to ELIGIBLE")
    void patchBlocksDirectAdvanceToEligible() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"ELIGIBLE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("PATCH blocks ELIGIBLE when enterprise still has missing data")
    void patchBlocksEligibleWithMissingEnterpriseData() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_TRIAGE\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"ELIGIBLE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Dados iniciais incompletos")));
    }

    @Test
    @DisplayName("PATCH allows PENDING_ADJUSTMENTS and returning to IN_TRIAGE")
    void patchAllowsPendingAdjustmentsAndReturnToInTriage() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_TRIAGE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRIAGE"));

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"PENDING_ADJUSTMENTS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_ADJUSTMENTS"));

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_TRIAGE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRIAGE"));
    }

    @Test
    @DisplayName("PATCH allows advancing to ELIGIBLE when enterprise minimum data is complete")
    void patchAllowsEligibleWithMinimumEnterpriseData() throws Exception {
        ProposalFixture proposal = createEligibleProposal();

        mockMvc.perform(get(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ELIGIBLE"));
    }

    @Test
    @DisplayName("Creating a commercial proposal document moves proposal to COMMERCIAL_PROPOSAL")
    void creatingCommercialProposalDocumentMovesProposalToCommercialProposal() throws Exception {
        ProposalFixture proposal = createEligibleProposal();

        createCommercialProposalDocument(proposal.id(), proposal.enterpriseId());

        mockMvc.perform(get(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMMERCIAL_PROPOSAL"));
    }

    @Test
    @DisplayName("Approving the commercial proposal notifies compliance")
    void approvingCommercialProposalNotifiesCompliance() throws Exception {
        ProposalFixture proposal = createEligibleProposal();
        UserFixture complianceUser = createUser(Role.COMPLIANCE);
        createCommercialProposalDocument(proposal.id(), proposal.enterpriseId());

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMMERCIAL_PROPOSAL_APPROVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMMERCIAL_PROPOSAL_APPROVED"));

        mockMvc.perform(get("/api/notifications/user/" + complianceUser.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("CONTRACT_CREATION_REQUIRED"))
                .andExpect(jsonPath("$[0].message").value(containsString("Proposal " + proposal.id())));
    }

    @Test
    @DisplayName("Rejecting the commercial proposal allows a new submission")
    void rejectingCommercialProposalAllowsNewSubmission() throws Exception {
        ProposalFixture proposal = createEligibleProposal();
        createCommercialProposalDocument(proposal.id(), proposal.enterpriseId());

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMMERCIAL_PROPOSAL_REJECTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMMERCIAL_PROPOSAL_REJECTED"));

        createCommercialProposalDocument(proposal.id(), proposal.enterpriseId());

        mockMvc.perform(get(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMMERCIAL_PROPOSAL"));
    }

    @Test
    @DisplayName("Assigning the responsible analyst notifies the analyst")
    void assigningResponsibleAnalystNotifiesAnalyst() throws Exception {
        ProposalFixture proposal = createApprovedCommercialProposal();
        UserFixture analyst = createUser(Role.ANALISTA_VALORES_IMOBILIARIOS);

        mockMvc.perform(patch(getBasePath() + "/" + proposal.id())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"responsibleAnalystId\":" + analyst.id() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responsibleAnalystId").value(Integer.parseInt(analyst.id())))
                .andExpect(jsonPath("$.status").value("COMMERCIAL_PROPOSAL_APPROVED"));

        mockMvc.perform(get("/api/notifications/user/" + analyst.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RESPONSIBLE_ANALYST_ASSIGNED"))
                .andExpect(jsonPath("$[0].message").value(containsString("proposal " + proposal.id())));
    }

    @Test
    @DisplayName("Digitally signed contract moves proposal to the next stage")
    void digitallySignedContractMovesProposalToNextStage() throws Exception {
        ProposalFixture proposal = createApprovedCommercialProposal();

        String contractId = createResource("/api/contracts",
                "{\"proposalId\":" + proposal.id() + ",\"startDate\":\"2026-03-20\",\"endDate\":\"2026-12-20\",\"status\":\"PENDING_SIGNATURE\"}");

        mockMvc.perform(patch("/api/contracts/" + contractId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DIGITALLY_SIGNED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DIGITALLY_SIGNED"));

        mockMvc.perform(get(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY_FOR_NEXT_STAGE"));
    }

    @Test
    @DisplayName("GET by enterprise returns created proposals")
    void getByEnterpriseReturnsCreatedProposal() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "/enterprise/" + proposal.enterpriseId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enterpriseId").value(Integer.parseInt(proposal.enterpriseId())));
    }

    @Test
    @DisplayName("GET by user returns created proposals")
    void getByUserReturnsCreatedProposal() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "/user/" + proposal.userId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(Integer.parseInt(proposal.userId())));
    }

    @Test
    @DisplayName("Soft delete hides proposal from the paged listing")
    void softDeleteHidesProposalFromPagedListing() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "?size=200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + proposal.id() + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get(getBasePath() + "?size=200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + proposal.id() + ")]").isEmpty());
    }

    @Test
    @DisplayName("Soft delete hides proposal from enterprise listing")
    void softDeleteHidesProposalFromEnterpriseListing() throws Exception {
        ProposalFixture proposal = createProposal();

        mockMvc.perform(get(getBasePath() + "/enterprise/" + proposal.enterpriseId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + proposal.id() + ")]").isNotEmpty());

        mockMvc.perform(delete(getBasePath() + "/" + proposal.id()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(getBasePath() + "/enterprise/" + proposal.enterpriseId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + proposal.id() + ")]").isEmpty());
    }

    @Test
    @DisplayName("Soft delete on proposal hides the associated contract")
    void softDeleteCascadeHidesAssociatedContract() throws Exception {
        ContractFixture contract = createContract();

        mockMvc.perform(delete(getBasePath() + "/" + contract.proposalId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/contracts/" + contract.id()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Soft delete on proposal hides the associated contract report")
    void softDeleteCascadeHidesAssociatedReport() throws Exception {
        ContractFixture contract = createContract();
        String reportId = createReport(contract.id());

        mockMvc.perform(delete(getBasePath() + "/" + contract.proposalId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/reports/" + reportId))
                .andExpect(status().isNotFound());
    }
}
