import { PaginatedResponse } from '@/types/pagination';
export type { PaginatedResponse };

export interface User {
  id: number;
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  status?: string;
  role: string | null;
}

export interface UserPatchRequest {
  fullName?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
}

export interface CreateUserRequest {
  fullName: string;
  cpf: string;
  email: string;
  phone?: string;
  status?: string;
  role?: string;
}

export interface UserApproveRequest {
  role: string;
}

export interface UserProfileCompletionRequest {
  cpf: string;
  phone: string;
}

export interface Cargo {
  id: number;
  name: string;
}

export interface CargoRequest {
  name: string;
}
