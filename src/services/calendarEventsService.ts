/// <reference types="vite/client" />

import { apiRequest } from "./httpClient";
import type {
  CalendarEventCreateRequest,
  CalendarEventResponse,
  CalendarEventUpdateRequest,
} from "../types/calendarEvents";

const CALENDAR_API_BASE_URL =
  import.meta.env.VITE_JOB_APPLICATION_API_BASE_URL ?? "https://localhost:7269";

const CALENDAR_EVENTS_ROOT = "/api/CalendarEvents";

export async function getCalendarEvents(): Promise<CalendarEventResponse[]> {
  return apiRequest<CalendarEventResponse[]>(
    CALENDAR_API_BASE_URL,
    CALENDAR_EVENTS_ROOT,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function getUpcomingCalendarEvents(): Promise<CalendarEventResponse[]> {
  return apiRequest<CalendarEventResponse[]>(
    CALENDAR_API_BASE_URL,
    `${CALENDAR_EVENTS_ROOT}/upcoming`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function getCalendarEventById(
  id: number | string
): Promise<CalendarEventResponse> {
  return apiRequest<CalendarEventResponse>(
    CALENDAR_API_BASE_URL,
    `${CALENDAR_EVENTS_ROOT}/${id}`,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

export async function createCalendarEvent(
  payload: CalendarEventCreateRequest
): Promise<CalendarEventResponse> {
  return apiRequest<CalendarEventResponse>(
    CALENDAR_API_BASE_URL,
    CALENDAR_EVENTS_ROOT,
    {
      method: "POST",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function updateCalendarEvent(
  id: number | string,
  payload: CalendarEventUpdateRequest
): Promise<CalendarEventResponse> {
  return apiRequest<CalendarEventResponse>(
    CALENDAR_API_BASE_URL,
    `${CALENDAR_EVENTS_ROOT}/${id}`,
    {
      method: "PUT",
      body: payload,
      requiresAuth: true,
    }
  );
}

export async function deleteCalendarEvent(id: number | string): Promise<void> {
  await apiRequest<unknown>(
    CALENDAR_API_BASE_URL,
    `${CALENDAR_EVENTS_ROOT}/${id}`,
    {
      method: "DELETE",
      requiresAuth: true,
    }
  );
}
