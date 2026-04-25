/// <reference types="vite/client" />

import { ApiError, getStoredToken, handleUnauthorizedResponse } from "./httpClient";
import type { CVDocument, DownloadCVDocumentResult } from "../types/cvDocuments";

const CV_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

const CV_API_ROOT = "/api/CvDocuments";

function getAuthToken(): string {
  const token = getStoredToken();

  if (!token) {
    handleUnauthorizedResponse(401);
    throw new ApiError("Authentication required.", 401);
  }

  return token;
}

function parseJsonErrorPayload(data: unknown, fallbackStatus: number): ApiError {
  let message = `Request failed with status ${fallbackStatus}`;

  if (data && typeof data === "object") {
    if ("message" in data && typeof data.message === "string" && data.message) {
      message = data.message;
    } else if ("title" in data && typeof data.title === "string" && data.title) {
      message = data.title;
    }
  }

  return new ApiError(message, fallbackStatus);
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

const contentTypeToFormat: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "text/plain": "TXT",
  "application/rtf": "RTF",
};

const knownFormats = new Set<string>(["PDF", "DOC", "DOCX", "TXT", "RTF"]);

function getFileExtensionFromName(fileName: string): string | null {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex < 0 || dotIndex === fileName.length - 1) {
    return null;
  }

  const extension = fileName.slice(dotIndex + 1).toUpperCase();

  if (!knownFormats.has(extension)) {
    return null;
  }

  return extension;
}

function normalizeFormat(item: Record<string, unknown>, fileName: string): string {
  if (typeof item.extension === "string" && item.extension.trim()) {
    const extension = item.extension.toUpperCase().replace(".", "");
    if (knownFormats.has(extension)) {
      return extension;
    }
  }

  const extensionFromFileName = getFileExtensionFromName(fileName);
  if (extensionFromFileName) {
    return extensionFromFileName;
  }

  if (typeof item.contentType === "string" && item.contentType.trim()) {
    const normalizedContentType = item.contentType.toLowerCase();
    if (normalizedContentType in contentTypeToFormat) {
      return contentTypeToFormat[normalizedContentType];
    }
  }

  if (typeof item.format === "string" && item.format.trim()) {
    const normalizedFormat = item.format.toUpperCase().replace(".", "");
    if (knownFormats.has(normalizedFormat)) {
      return normalizedFormat;
    }
  }

  return "PDF";
}

function normalizeDocument(raw: unknown): CVDocument {
  const item = raw as Record<string, unknown>;

  const id = item.id ?? item.cvDocumentId;
  const name =
    (typeof item.name === "string" && item.name) ||
    (typeof item.fileName === "string" && item.fileName) ||
    "CV Document";

  const fileName = typeof item.fileName === "string" ? item.fileName : "";

  const version =
    (typeof item.version === "string" && item.version) ||
    (typeof item.versionTag === "string" && item.versionTag) ||
    "v1.0";

  const uploadDate =
    (typeof item.uploadDate === "string" && item.uploadDate) ||
    (typeof item.createdAt === "string" && item.createdAt) ||
    new Date().toISOString();

  const fileSize =
    (typeof item.fileSize === "number" && formatBytes(item.fileSize)) ||
    (typeof item.fileSize === "string" && item.fileSize) ||
    (typeof item.fileSizeInBytes === "number" && formatBytes(item.fileSizeInBytes)) ||
  "Unknown";

  const format = normalizeFormat(item, fileName);

  const isDefault =
    (typeof item.isDefault === "boolean" && item.isDefault) ||
    (typeof item.default === "boolean" && item.default) ||
    false;

  return {
    id: typeof id === "string" || typeof id === "number" ? id : "",
    name,
    version,
    uploadDate,
    fileSize,
    format,
    isDefault,
    contentType: typeof item.contentType === "string" ? item.contentType : "application/pdf",
  };
}

function parseContentDispositionFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^\";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return null;
}

export async function getCVDocuments(): Promise<CVDocument[]> {
  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }

  if (Array.isArray(payload)) {
    return payload.map(normalizeDocument);
  }

  if (payload && typeof payload === "object" && "items" in payload && Array.isArray(payload.items)) {
    return payload.items.map(normalizeDocument);
  }

  return [];
}

export async function uploadCVDocument(file: File): Promise<CVDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }

  return normalizeDocument(payload);
}

export async function downloadCVDocument(
  id: string | number
): Promise<DownloadCVDocumentResult> {
  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}/${id}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : null;
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }

  const contentDisposition = response.headers.get("content-disposition");
  const fileName =
    parseContentDispositionFileName(contentDisposition) || `cv-document-${id}.pdf`;

  return {
    blob: await response.blob(),
    fileName,
  };
}

export async function previewCVDocument(id: string | number): Promise<Blob> {
  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}/${id}/preview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : null;
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }

  return response.blob();
}

export async function markCVDocumentAsDefault(id: string | number): Promise<void> {
  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}/${id}/set-default`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : null;
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }
}

export async function deleteCVDocument(id: string | number): Promise<void> {
  const response = await fetch(`${CV_API_BASE_URL}${CV_API_ROOT}/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : null;
    handleUnauthorizedResponse(response.status);
    throw parseJsonErrorPayload(payload, response.status);
  }
}
