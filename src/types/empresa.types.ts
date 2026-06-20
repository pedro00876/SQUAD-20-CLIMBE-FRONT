// Alias local — preferir importar Enterprise de @/features/empresas/types
export interface Empresa {
  id: number;
  cnpj: string;
  legalName: string;
  tradeName: string | null;
}
