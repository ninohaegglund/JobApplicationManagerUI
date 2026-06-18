export type ApplicationStatus = "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";

export enum ApplicationQuality {
  Unrated = 0,
  Strong = 1,
  Moderate = 2,
  Stretch = 3,
}

export interface CreateJobApplicationRequest {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  applicationQuality: ApplicationQuality;
  notes: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  applicationQuality?: ApplicationQuality;
}

export interface JobApplication {
  id: string | number;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  applicationQuality: ApplicationQuality;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
