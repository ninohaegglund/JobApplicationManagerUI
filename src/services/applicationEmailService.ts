/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type {
  ApplicationEmailDto,
  CreateApplicationEmailDto,
  UpdateApplicationEmailDto,
} from "../types/applicationEmails";

const JOB_APPLICATION_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

const JOB_APPLICATIONS_ROOT = "/api/jobapplications";
const APPLICATION_EMAILS_ROOT = "/api/applicationemails";

export async function getApplicationEmails(
  jobApplicationId: number | string
): Promise<ApplicationEmailDto[]> {
  return apiRequest<ApplicationEmailDto[]>(
    JOB_APPLICATION_API_BASE_URL,
    `${JOB_APPLICATIONS_ROOT}/${jobApplicationId}/emails`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function getApplicationEmailById(
  id: number | string
): Promise<ApplicationEmailDto> {
  return apiRequest<ApplicationEmailDto>(
    JOB_APPLICATION_API_BASE_URL,
    `${APPLICATION_EMAILS_ROOT}/${id}`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function createApplicationEmail(
  jobApplicationId: number | string,
  payload: CreateApplicationEmailDto
): Promise<ApplicationEmailDto> {
  return apiRequest<ApplicationEmailDto>(
    JOB_APPLICATION_API_BASE_URL,
    `${JOB_APPLICATIONS_ROOT}/${jobApplicationId}/emails`,
    {
      method: "POST",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function updateApplicationEmail(
  id: number | string,
  payload: UpdateApplicationEmailDto
): Promise<void> {
  await apiRequest<unknown>(
    JOB_APPLICATION_API_BASE_URL,
    `${APPLICATION_EMAILS_ROOT}/${id}`,
    {
      method: "PUT",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function deleteApplicationEmail(id: number | string): Promise<void> {
  await apiRequest<unknown>(
    JOB_APPLICATION_API_BASE_URL,
    `${APPLICATION_EMAILS_ROOT}/${id}`,
    {
      method: "DELETE",
      requiresAuth: true,
    }
  );
}
