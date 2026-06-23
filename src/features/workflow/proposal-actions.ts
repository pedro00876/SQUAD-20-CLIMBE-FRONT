import type { ProposalStatus } from './types';
import type { WorkflowActionContext, WorkflowActionDescriptor } from './types';

export function getAvailableActions(
  status: ProposalStatus | string | undefined,
  context: WorkflowActionContext = {},
): WorkflowActionDescriptor[] {
  const s = (status ?? '').toUpperCase() as ProposalStatus;
  const actions: WorkflowActionDescriptor[] = [];

  switch (s) {
    case 'RECEIVED':
      actions.push({ action: 'startTriage', label: 'Iniciar triagem', variant: 'primary' });
      break;

    case 'IN_TRIAGE':
      actions.push({ action: 'approveTriage', label: 'Aprovar triagem', variant: 'primary' });
      actions.push({
        action: 'requestAdjustments',
        label: 'Solicitar ajustes',
        variant: 'outline',
      });
      break;

    case 'PENDING_ADJUSTMENTS':
      actions.push({ action: 'resumeTriage', label: 'Retomar triagem', variant: 'primary' });
      break;

    case 'ELIGIBLE':
    case 'COMMERCIAL_PROPOSAL_REJECTED':
      actions.push({
        action: 'uploadCommercialProposal',
        label: s === 'COMMERCIAL_PROPOSAL_REJECTED' ? 'Reenviar proposta' : 'Enviar proposta comercial',
        variant: 'primary',
        requiresFile: true,
      });
      break;

    case 'COMMERCIAL_PROPOSAL':
      actions.push({ action: 'approveCommercial', label: 'Aprovar proposta', variant: 'primary' });
      actions.push({
        action: 'rejectCommercial',
        label: 'Reprovar proposta',
        variant: 'danger',
        requiresReason: true,
      });
      break;

    case 'COMMERCIAL_PROPOSAL_APPROVED':
      if (!context.hasAnalyst) {
        actions.push({ action: 'assignAnalyst', label: 'Atribuir analista', variant: 'outline' });
      }
      if (!context.hasContract) {
        actions.push({ action: 'createContract', label: 'Criar contrato', variant: 'primary' });
      } else if (!context.isContractSigned) {
        actions.push({ action: 'signContract', label: 'Assinar contrato', variant: 'primary' });
      }
      break;

    case 'READY_FOR_NEXT_STAGE':
      actions.push({
        action: 'createDocRequirements',
        label: 'Solicitar documentos',
        variant: 'primary',
      });
      actions.push({
        action: 'uploadChecklistDoc',
        label: 'Enviar documento',
        variant: 'outline',
        requiresFile: true,
      });
      actions.push({
        action: 'validateRequirement',
        label: 'Validar documento',
        variant: 'outline',
      });
      if (context.hasContract && context.isContractSigned) {
        actions.push({ action: 'allocateTeam', label: 'Alocar equipe', variant: 'outline' });
      }
      break;

    default:
      break;
  }

  return actions;
}

export function canAssignAnalyst(status?: string): boolean {
  const s = (status ?? '').toUpperCase();
  return s === 'COMMERCIAL_PROPOSAL_APPROVED' || s === 'READY_FOR_NEXT_STAGE';
}

export function canCreateContract(status?: string, hasContract?: boolean): boolean {
  return (status ?? '').toUpperCase() === 'COMMERCIAL_PROPOSAL_APPROVED' && !hasContract;
}

export function canCreateChecklist(status?: string): boolean {
  return (status ?? '').toUpperCase() === 'READY_FOR_NEXT_STAGE';
}

export function canUploadCommercialProposal(status?: string): boolean {
  const s = (status ?? '').toUpperCase();
  return s === 'ELIGIBLE' || s === 'COMMERCIAL_PROPOSAL_REJECTED';
}
