export type NotificationType = string;

export interface NotificationApplication {
  id: number;
  company: string;
  role: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
  dueAt?: string | null;
  jobApplicationId?: number | null;
  application?: NotificationApplication | null;
}

export interface UnreadNotificationsResponse {
  unreadCount: number;
}
