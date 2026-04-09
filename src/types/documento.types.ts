export interface Documento {
  id?: number;
  enterpriseId: number;
  enterpriseName?: string;
  documentType: string;
  url: string;
  validated?: boolean;
  analystId?: number | null;
  analystName?: string;
}

export interface DocumentoFormValues {
  enterpriseId: string;
  documentType: string;
  url: string;
  validated: boolean;
  analystId: string;
}
