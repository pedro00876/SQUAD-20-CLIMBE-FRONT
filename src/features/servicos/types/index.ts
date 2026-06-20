export interface Service {
  id: number;
  name: string;
}

export interface CreateServiceRequest {
  name: string;
}

export interface UpdateServiceRequest {
  name?: string;
}
