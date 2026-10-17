export type JobTechEmploymentType = "part-time" | "full-time" | "temporary";

export interface JobTechSearchRequest {
  q?: string;
  roles?: string[];
  keywords?: string[];
  locations?: string[];
  excludedKeywords?: string[];
  employmentType?: JobTechEmploymentType;
  remote?: boolean;
  sort?: string;
  publishedAfter?: string;
  offset?: number;
  limit?: number;
}

export interface JobTechJob {
  id: string;
  headline: string;
  employerName: string;
  location: string;
  region: string;
  description: string;
  employmentType: string;
  workingHoursType: string;
  scopeOfWorkMin: number | null;
  scopeOfWorkMax: number | null;
  remote: boolean;
  publishedAt: string;
  applicationDeadline: string | null;
  webpageUrl: string;
  applicationUrl: string | null;
  matchScore: number;
  matchReasons: string[];
}

export interface JobTechSearchResponse {
  total: number;
  returned: number;
  jobs: JobTechJob[];
}
