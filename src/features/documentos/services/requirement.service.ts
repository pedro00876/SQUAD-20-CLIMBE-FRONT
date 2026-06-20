import { api } from '@/services/api';
import type {
  DocumentRequirement,
  CreateDocumentRequirementRequest,
  UpdateDocumentRequirementRequest,
} from '../types';
export type { DocumentRequirement, CreateDocumentRequirementRequest, UpdateDocumentRequirementRequest } from '../types';

export const requirementService = {
  create: async (proposalId: number, data: CreateDocumentRequirementRequest): Promise<DocumentRequirement[]> => {
    const res = await api.post<DocumentRequirement[]>(`/api/proposals/${proposalId}/documents/requirements`, data);
    return res.data;
  },

  listByProposal: async (proposalId: number): Promise<DocumentRequirement[]> => {
    const res = await api.get<DocumentRequirement[]>(`/api/proposals/${proposalId}/documents/requirements`);
    return res.data;
  },

  update: async (id: number, data: UpdateDocumentRequirementRequest): Promise<DocumentRequirement> => {
    const res = await api.patch<DocumentRequirement>(`/api/documents/requirements/${id}`, data);
    return res.data;
  },
};
