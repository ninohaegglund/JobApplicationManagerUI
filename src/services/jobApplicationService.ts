/// <reference types="vite/client" />

import { ApiError, apiRequest, getStoredToken, handleUnauthorizedResponse } from "./httpClient";
import type {
  CreateJobApplicationRequest,
  JobApplication,
  UpdateApplicationStatusRequest,
} from "../types/jobApplications";

const JOB_APPLICATION_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

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

function parseContentDispositionFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return null;
}

export async function createApplication(
  payload: CreateJobApplicationRequest
): Promise<JobApplication> {
  return apiRequest<JobApplication>(
    JOB_APPLICATION_API_BASE_URL,
    "/api/JobApplications",
    {
      method: "POST",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function getAllApplications(search?: string): Promise<JobApplication[]> {
  const trimmedSearch = search?.trim();
  const endpoint = trimmedSearch
    ? `/api/JobApplications?${new URLSearchParams({ search: trimmedSearch }).toString()}`
    : "/api/JobApplications";

  return apiRequest<JobApplication[]>(
    JOB_APPLICATION_API_BASE_URL,
    endpoint,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function getApplicationById(id: string | number): Promise<JobApplication> {
  return apiRequest<JobApplication>(
    JOB_APPLICATION_API_BASE_URL,
    `/api/JobApplications/${id}`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function deleteApplication(id: string | number): Promise<void> {
  await apiRequest<unknown>(
    JOB_APPLICATION_API_BASE_URL,
    `/api/JobApplications/${id}`,
    {
      method: "DELETE",
      requiresAuth: true,
    }
  );
}

export async function updateApplicationStatus(
  id: string | number,
  payload: UpdateApplicationStatusRequest
): Promise<void> {
  await apiRequest<unknown>(
    JOB_APPLICATION_API_BASE_URL,
    `/api/JobApplications/${id}/status`,
    {
      method: "PATCH",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function exportJobApplications(): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${JOB_APPLICATION_API_BASE_URL}/api/JobApplications/export`, {
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
    parseContentDispositionFileName(contentDisposition) || "job-applications.xlsx";

  return {
    blob: await response.blob(),
    fileName,
  };
}
