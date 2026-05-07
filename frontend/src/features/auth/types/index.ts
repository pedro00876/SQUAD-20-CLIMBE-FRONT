export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string | number;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  status?: 'ACTIVE' | 'ATIVO' | 'PENDING' | 'PENDENTE' | 'DISABLED';
  active?: boolean;
}

export interface LoginResponse {
  // O token agora é gerenciado via cookie HttpOnly
}
export interface Permission {
  id: number;
  nome: string;
  descricao: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  cargoId?: number;
  roleId?: number;
}
