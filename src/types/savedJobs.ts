import type { JobTechJob } from "./jobTech";

export interface SavedJobApiResponse {
  id: string | number;
  externalJobId: string;
  headline: string;
  employerName: string;
  location: string | null;
  region: string | null;
  description: string | null;
  descriptionFormatted?: string | null;
  employmentType: string | null;
  workingHoursType: string | null;
  scopeOfWorkMin: number | null;
  scopeOfWorkMax: number | null;
  remote: boolean | null;
  publishedAt: string | null;
  applicationDeadline: string | null;
  webpageUrl: string | null;
  applicationUrl: string | null;
  matchScore: number;
  matchReasons: string[];
  jobApplicationId: string | number | null;
  createdAt?: string;
}

export interface SavedJob {
  id: string | number;
  externalJobId: string;
  snapshot: JobTechJob;
  createdAt?: string;
  isApplied?: boolean;
  applicationId?: string | number | null;
  appliedAt?: string | null;
}

export interface CreateSavedJobRequest {
  externalJobId: string;
  snapshot: JobTechJob;
}
