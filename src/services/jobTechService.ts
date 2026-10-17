/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type { JobTechSearchRequest, JobTechSearchResponse } from "../types/jobTech";

const JOB_TECH_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

function appendValues(params: URLSearchParams, key: string, values?: string[]) {
  values?.forEach((value) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.append(key, trimmedValue);
    }
  });
}

export async function searchJobTech(
  request: JobTechSearchRequest
): Promise<JobTechSearchResponse> {
  const params = new URLSearchParams();

  if (request.q?.trim()) {
    params.set("q", request.q.trim());
  }

  appendValues(params, "roles", request.roles);
  appendValues(params, "keywords", request.keywords);
  appendValues(params, "locations", request.locations);
  appendValues(params, "excludedKeywords", request.excludedKeywords);

  if (request.employmentType) {
    params.set("employmentType", request.employmentType);
  }

  if (request.remote !== undefined) {
    params.set("remote", String(request.remote));
  }

  if (request.sort) {
    params.set("sort", request.sort);
  }

  if (request.publishedAfter) {
    params.set("publishedAfter", request.publishedAfter);
  }

  if (request.offset !== undefined) {
    params.set("offset", String(request.offset));
  }

  if (request.limit !== undefined) {
    params.set("limit", String(request.limit));
  }

  return apiRequest<JobTechSearchResponse>(
    JOB_TECH_API_BASE_URL,
    `/api/Jobs/search?${params.toString()}`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}
