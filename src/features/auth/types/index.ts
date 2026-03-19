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
  token: string;
  user: User;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  roleId: number;
}
