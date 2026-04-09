export interface User {
  id?: number;
  fullName: string;
  cpf: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface UserFormValues {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  status: string;
}
