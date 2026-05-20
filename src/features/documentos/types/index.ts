export interface DocumentMetadata {
  id: string;
  nomeOriginal: string;
  url: string;
  ownerId: string;
  dataUpload: string;
}

export interface DocumentUploadResponse {
  id: string;
  url: string;
}

export interface DocumentViewResponse {
  url: string;
}
