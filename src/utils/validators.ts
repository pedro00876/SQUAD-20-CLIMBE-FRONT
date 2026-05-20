export const validators = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidCPF: (cpf: string) => cpf.length === 11,
};
