export interface Permission {
  id: number;
  description: string;
}

export interface CreatePermissionRequest {
  description: string;
}

export interface UpdatePermissionRequest {
  description?: string;
}
