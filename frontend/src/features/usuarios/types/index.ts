import { PaginatedResponse } from '@/types/pagination';
export type { PaginatedResponse };

export interface User {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  status?: string;
  active?: boolean;
  role?: string | Cargo;
  cargo?: Cargo;
}

export interface UserPatchRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
  cargoId?: number;
  active?: boolean;
}

export interface Cargo {
  id: number;
  nome: string;
  descricao: string;
}

export interface CargoRequest {
  nome: string;
  descricao: string;
}

