/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type {
  CreateJobApplicationRequest,
  JobApplication,
  UpdateApplicationStatusRequest,
} from "../types/jobApplications";

const JOB_APPLICATION_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

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

export async function getAllApplications(): Promise<JobApplication[]> {
  return apiRequest<JobApplication[]>(
    JOB_APPLICATION_API_BASE_URL,
    "/api/JobApplications",
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
