/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type {
  DeletedNotificationsResponse,
  NotificationItem,
  UnreadNotificationsResponse,
} from "../types/notifications";

const NOTIFICATIONS_API_BASE_URL =
  import.meta.env.VITE_NOTIFICATIONS_API_BASE_URL ??
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ??
  "https://localhost:7269";

export async function getNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>(NOTIFICATIONS_API_BASE_URL, "/api/notifications", {
    method: "GET",
    requiresAuth: true,
  });
}

export async function getUnreadNotificationsCount(): Promise<UnreadNotificationsResponse> {
  return apiRequest<UnreadNotificationsResponse>(
    NOTIFICATIONS_API_BASE_URL,
    "/api/notifications/unread-count",
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await apiRequest<unknown>(NOTIFICATIONS_API_BASE_URL, `/api/notifications/${id}/read`, {
    method: "PATCH",
    requiresAuth: true,
  });
}

export async function markAllNotificationsAsRead(): Promise<UnreadNotificationsResponse> {
  return apiRequest<UnreadNotificationsResponse>(
    NOTIFICATIONS_API_BASE_URL,
    "/api/notifications/read-all",
    {
      method: "PATCH",
      requiresAuth: true,
    }
  );
}

export async function deleteAllNotifications(): Promise<DeletedNotificationsResponse> {
  return apiRequest<DeletedNotificationsResponse>(NOTIFICATIONS_API_BASE_URL, "/api/notifications", {
    method: "DELETE",
    requiresAuth: true,
  });
}

export async function clearNotifications(): Promise<DeletedNotificationsResponse> {
  return deleteAllNotifications();
}
