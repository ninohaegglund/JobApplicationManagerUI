/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type {
  CreateSavedJobRequest,
  SavedJob,
  SavedJobApiResponse,
} from "../types/savedJobs";

const SAVED_JOBS_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

function normalizeSavedJob(response: SavedJobApiResponse): SavedJob {
  const externalJobId = response.externalJobId || String(response.id);

  return {
    id: response.id,
    externalJobId,
    snapshot: {
      id: externalJobId,
      headline: response.headline,
      employerName: response.employerName,
      location: response.location ?? "",
      region: response.region ?? "",
      description: response.description ?? "",
      employmentType: response.employmentType ?? "",
      workingHoursType: response.workingHoursType ?? "",
      scopeOfWorkMin: response.scopeOfWorkMin,
      scopeOfWorkMax: response.scopeOfWorkMax,
      remote: response.remote ?? false,
      publishedAt: response.publishedAt ?? "",
      applicationDeadline: response.applicationDeadline,
      webpageUrl: response.webpageUrl ?? "",
      applicationUrl: response.applicationUrl,
      matchScore: response.matchScore,
      matchReasons: response.matchReasons ?? [],
    },
    createdAt: response.createdAt,
    isApplied: response.jobApplicationId !== null && response.jobApplicationId !== undefined,
    applicationId: response.jobApplicationId,
  };
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  const response = await apiRequest<SavedJobApiResponse[]>(
    SAVED_JOBS_API_BASE_URL,
    "/api/SavedJobs",
    {
      method: "GET",
      requiresAuth: true,
    }
  );

  return response.map(normalizeSavedJob);
}

export async function createSavedJob(payload: CreateSavedJobRequest): Promise<SavedJob> {
  const response = await apiRequest<SavedJobApiResponse>(
    SAVED_JOBS_API_BASE_URL,
    "/api/SavedJobs",
    {
      method: "POST",
      body: payload,
      requiresAuth: true,
    }
  );

  return normalizeSavedJob(response);
}

export async function deleteSavedJob(id: string | number): Promise<void> {
  await apiRequest<unknown>(SAVED_JOBS_API_BASE_URL, `/api/SavedJobs/${id}`, {
    method: "DELETE",
    requiresAuth: true,
  });
}

export async function applySavedJob(id: string | number): Promise<unknown> {
  return apiRequest<unknown>(SAVED_JOBS_API_BASE_URL, `/api/SavedJobs/${id}/apply`, {
    method: "POST",
    requiresAuth: true,
  });
}
