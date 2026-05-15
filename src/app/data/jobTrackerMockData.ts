export type CalendarEventType =
  | "Interview"
  | "Follow-up"
  | "Deadline"
  | "Technical test"
  | "Phone call"
  | "Reminder"
  | "Other";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startsAt: string;
  endsAt?: string;
  application?: {
    id: number;
    company: string;
    role?: string;
  };
  location?: string;
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: "evt-001",
    title: "Acme Corp - Frontend Interview",
    type: "Interview",
    startsAt: "2026-05-16T10:00:00",
    endsAt: "2026-05-16T10:45:00",
    application: { id: 101, company: "Acme Corp", role: "Frontend Engineer" },
    location: "Teams",
  },
  {
    id: "evt-002",
    title: "Follow-up: Nova Labs",
    type: "Follow-up",
    startsAt: "2026-05-18T09:30:00",
    application: { id: 102, company: "Nova Labs", role: "Product Designer" },
    location: "Email",
  },
  {
    id: "evt-003",
    title: "Apply before deadline - Helix Health",
    type: "Deadline",
    startsAt: "2026-05-20T23:59:00",
    application: { id: 103, company: "Helix Health", role: "Frontend Engineer" },
    location: "Online submission",
  },
  {
    id: "evt-004",
    title: "Technical test kickoff - PixelForge",
    type: "Technical test",
    startsAt: "2026-05-21T13:00:00",
    endsAt: "2026-05-21T14:00:00",
    application: { id: 104, company: "PixelForge", role: "Full Stack Engineer" },
    location: "Remote",
  },
  {
    id: "evt-005",
    title: "Phone screen - Summit AI",
    type: "Phone call",
    startsAt: "2026-05-22T15:30:00",
    endsAt: "2026-05-22T16:00:00",
    application: { id: 105, company: "Summit AI", role: "ML Engineer" },
    location: "Phone",
  },
  {
    id: "evt-006",
    title: "Update portfolio for new applications",
    type: "Reminder",
    startsAt: "2026-05-24T10:00:00",
    location: "Personal",
  },
  {
    id: "evt-007",
    title: "Local Tech Meetup - Career fair",
    type: "Other",
    startsAt: "2026-05-28T17:30:00",
    endsAt: "2026-05-28T19:00:00",
    location: "Downtown Office",
  },
];

export type NotificationType =
  | "Follow-up reminder"
  | "Interview reminder"
  | "Deadline soon"
  | "Application updated"
  | "Old draft reminder";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  application?: {
    id: number;
    company: string;
    role?: string;
  };
}

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "Interview tomorrow",
    message: "Your Acme Corp interview is scheduled for tomorrow at 10:00 AM.",
    type: "Interview reminder",
    createdAt: "2026-05-15T09:00:00",
    read: false,
    application: { id: 101, company: "Acme Corp", role: "Frontend Engineer" },
  },
  {
    id: "notif-002",
    title: "Follow-up due today",
    message: "Send a follow-up email to Nova Labs after last week's screening.",
    type: "Follow-up reminder",
    createdAt: "2026-05-15T08:20:00",
    read: false,
    application: { id: 102, company: "Nova Labs", role: "Product Designer" },
  },
  {
    id: "notif-003",
    title: "Deadline in 48 hours",
    message: "The Helix Health application deadline is approaching soon.",
    type: "Deadline soon",
    createdAt: "2026-05-14T16:10:00",
    read: false,
    application: { id: 103, company: "Helix Health", role: "Frontend Engineer" },
  },
  {
    id: "notif-004",
    title: "Application updated",
    message: "PixelForge moved your application to the technical test stage.",
    type: "Application updated",
    createdAt: "2026-05-13T14:40:00",
    read: true,
    application: { id: 104, company: "PixelForge", role: "Full Stack Engineer" },
  },
  {
    id: "notif-005",
    title: "Draft aging",
    message: "You have a draft application for Orion Systems with no activity.",
    type: "Old draft reminder",
    createdAt: "2026-05-12T10:05:00",
    read: true,
  },
  {
    id: "notif-006",
    title: "Interview details added",
    message: "Summit AI confirmed a phone screen for May 22 at 3:30 PM.",
    type: "Interview reminder",
    createdAt: "2026-05-12T09:15:00",
    read: false,
    application: { id: 105, company: "Summit AI", role: "ML Engineer" },
  },
];
