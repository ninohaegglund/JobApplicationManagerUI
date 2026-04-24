export type ApplicationStatus = "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";

export interface CreateJobApplicationRequest {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  notes: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}

export interface JobApplication {
  id: string | number;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
