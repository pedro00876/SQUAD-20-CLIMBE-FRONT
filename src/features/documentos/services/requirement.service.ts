/** @deprecated Use documentRequirementService from @/services/document.service */
import { documentRequirementService } from '@/services/document.service';

export const requirementService = {
  ...documentRequirementService,
  create: documentRequirementService.createForProposal,
};

export {
  documentRequirementService,
} from '@/services/document.service';

export type {
  DocumentRequirement,
  CreateDocumentRequirementRequest,
  UpdateDocumentRequirementRequest,
} from '@/features/documentos/types';
