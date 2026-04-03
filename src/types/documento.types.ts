export interface Documento {
  id?: string;
  nome: string;
  url?: string;
  tipo: string;
  empresaId?: string;
  descricao?: string;
}

export interface DocumentoFormValues {
  nome: string;
  tipo: string;
  empresaId: string;
  descricao: string;
  url: string;
}
