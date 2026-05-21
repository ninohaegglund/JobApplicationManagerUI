export enum EmailType {
  General = 0,
  Interview = 1,
  Rejection = 2,
  Offer = 3,
  FollowUp = 4,
}

export interface ApplicationEmailDto {
  id: number;
  jobApplicationId: number;
  subject: string;
  sender: string;
  body: string;
  receivedAt: string;
  type: EmailType;
  createdAt: string;
}

export interface CreateApplicationEmailDto {
  subject: string;
  sender: string;
  body: string;
  receivedAt: string;
  type: EmailType;
}

export interface UpdateApplicationEmailDto {
  subject: string;
  sender: string;
  body: string;
  receivedAt: string;
  type: EmailType;
}
