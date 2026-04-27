export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  // O token agora é gerenciado via cookie HttpOnly
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
