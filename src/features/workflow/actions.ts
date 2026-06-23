import { documentService } from '@/services/document.service';
import { proposalService } from '@/services/proposal.service';
import { canPatchStatus } from './proposal-transitions';

export async function submitCommercialProposal(
  proposalId: number,
  enterpriseId: number,
  file: File,
) {
  await documentService.upload(
    {
      enterpriseId,
      proposalId,
      documentType: 'COMMERCIAL_PROPOSAL',
    },
    file,
  );
}

export async function patchProposalStatus(
  proposalId: number,
  fromStatus: string | undefined,
  toStatus: string,
) {
  if (!canPatchStatus(fromStatus, toStatus)) {
    throw new Error(
      `Transição de status inválida: não é possível alterar de ${fromStatus} para ${toStatus}.`,
    );
  }
  return proposalService.updateStatus(proposalId, toStatus);
}

export async function assignResponsibleAnalyst(
  proposalId: number,
  responsibleAnalystId: number,
) {
  return proposalService.update(proposalId, { responsibleAnalystId });
}
