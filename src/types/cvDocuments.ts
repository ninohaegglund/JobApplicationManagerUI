export interface CVDocument {
  id: string | number;
  name: string;
  version: string;
  uploadDate: string;
  fileSize: string;
  format: string;
  isDefault: boolean;
  contentType: string;
}

export interface CVDocumentsListResponse {
  items: CVDocument[];
}

export interface DownloadCVDocumentResult {
  blob: Blob;
  fileName: string;
}
