export type DocumentType =
  | 'BALANCO_PATRIMONIAL'
  | 'DRE'
  | 'CONTRATO_SOCIAL'
  | 'CNPJ'
  | 'PLANILHA_GERENCIAL';

export type DocumentRequirementStatus = 'PENDING' | 'SUBMITTED' | 'NON_COMPLIANT' | 'APPROVED';

export interface Document {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
  proposalId?: number;
  documentType?: string;
  url: string;
  validated?: boolean;
  analystId?: number;
  analystName?: string;
}

export interface CreateDocumentRequest {
  enterpriseId: number;
  proposalId?: number;
  documentType?: string;
  validated?: boolean;
  analystId?: number;
}

export interface UpdateDocumentRequest {
  enterpriseId?: number;
  proposalId?: number;
  documentType?: string;
  url?: string;
  validated?: boolean;
  analystId?: number;
}

export interface DocumentRequirement {
  id: number;
  proposalId: number;
  documentType: DocumentType;
  status: DocumentRequirementStatus;
  deadline?: string;
  documentId?: number;
  rejectionReason?: string;
  validatedById?: number;
  validatedAt?: string;
  createdAt: string;
}

export interface CreateDocumentRequirementRequest {
  documentTypes?: DocumentType[];
  deadline?: string;
}

export interface UpdateDocumentRequirementRequest {
  status?: DocumentRequirementStatus;
  deadline?: string;
  rejectionReason?: string;
  validatedById?: number;
}
