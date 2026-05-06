export interface Proposta {
  id: string;
  empresaId: string;
  valor: number;
  status: 'Pendente' | 'Aprovada' | 'Recusada';
}
