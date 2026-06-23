import type { ProposalStatus } from '@/features/propostas/types';

export type { ProposalStatus };

export type ProposalWorkflowAction =
  | 'startTriage'
  | 'approveTriage'
  | 'requestAdjustments'
  | 'resumeTriage'
  | 'uploadCommercialProposal'
  | 'approveCommercial'
  | 'rejectCommercial'
  | 'resubmitCommercialProposal'
  | 'assignAnalyst'
  | 'createContract'
  | 'signContract'
  | 'createDocRequirements'
  | 'uploadChecklistDoc'
  | 'validateRequirement'
  | 'allocateTeam';

export interface WorkflowActionDescriptor {
  action: ProposalWorkflowAction;
  label: string;
  variant?: 'primary' | 'danger' | 'outline';
  requiresFile?: boolean;
  requiresReason?: boolean;
}

export interface WorkflowActionContext {
  hasContract?: boolean;
  isContractSigned?: boolean;
  hasAnalyst?: boolean;
  userRole?: string;
}
