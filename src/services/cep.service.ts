import { unmask } from '@/utils/masks';

export interface CepAddress {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export class CepNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.');
    this.name = 'CepNotFoundError';
  }
}

export const cepService = {
  async lookup(cep: string): Promise<CepAddress> {
    const digits = unmask(cep);
    if (digits.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos.');
    }

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) {
      throw new Error('Não foi possível consultar o CEP. Tente novamente.');
    }

    const data: ViaCepResponse = await response.json();
    if (data.erro) {
      throw new CepNotFoundError();
    }

    return {
      zipCode: data.cep ?? `${digits.slice(0, 5)}-${digits.slice(5)}`,
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  },
};
