export type CalendarEventTypeLabel =
  | "Interview"
  | "Follow-up"
  | "Deadline"
  | "Technical test"
  | "Phone call"
  | "Reminder"
  | "Other";

export interface CalendarEventResponse {
  id: number;
  jobApplicationId?: number | null;
  companyName?: string | null;
  jobTitle?: string | null;
  title: string;
  description?: string | null;
  eventType: number;
  startDateTime: string;
  endDateTime?: string | null;
  location?: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CalendarEventCreateRequest {
  jobApplicationId?: number | null;
  title: string;
  description?: string | null;
  eventType: number;
  startDateTime: string;
  endDateTime?: string | null;
  location?: string | null;
}

export interface CalendarEventUpdateRequest {
  jobApplicationId?: number | null;
  title: string;
  description?: string | null;
  eventType: number;
  startDateTime: string;
  endDateTime?: string | null;
  location?: string | null;
  isCompleted: boolean;
}
