export interface Service {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
}

export interface ServiceRequest {
  nome: string;
  preco: number;
  descricao: string;
}
