import { api } from '@/services/api';

export interface DocumentRequirement {
  id: number;
  proposalId: number;
  documentType: string;
  status: 'PENDING' | 'SUBMITTED' | 'NON_COMPLIANT' | 'APPROVED';
  deadline?: string;
  documentId?: number;
  rejectionReason?: string;
  validatedBy?: number;
  validatedAt?: string;
  createdAt: string;
}

export interface DocumentRequirementCreate {
  documentType: string;
  deadline?: string;
}

export interface DocumentRequirementUpdate {
  status: string;
  rejectionReason?: string;
  documentId?: number;
}

export const requirementService = {
  create: async (proposalId: number, data: DocumentRequirementCreate): Promise<DocumentRequirement> => {
    const res = await api.post<DocumentRequirement>(`/api/proposals/${proposalId}/documents/requirements`, data);
    return res.data;
  },

  listByProposal: async (proposalId: number): Promise<DocumentRequirement[]> => {
    const res = await api.get<DocumentRequirement[]>(`/api/proposals/${proposalId}/documents/requirements`);
    return res.data;
  },

  update: async (id: number, data: DocumentRequirementUpdate): Promise<DocumentRequirement> => {
    const res = await api.patch<DocumentRequirement>(`/api/documents/requirements/${id}`, data);
    return res.data;
  }
};
