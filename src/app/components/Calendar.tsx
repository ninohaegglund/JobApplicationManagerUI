import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ApiError } from "../../services/httpClient";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  getUpcomingCalendarEvents,
  updateCalendarEvent,
} from "../../services/calendarEventsService";
import { getAllApplications } from "../../services/jobApplicationService";
import type {
  CalendarEventCreateRequest,
  CalendarEventResponse,
  CalendarEventTypeLabel,
  CalendarEventUpdateRequest,
} from "../../types/calendarEvents";
import type { JobApplication } from "../../types/jobApplications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxEventsPerDay = 2;
const eventTypeOptions: CalendarEventTypeLabel[] = [
  "Interview",
  "Follow-up",
  "Deadline",
  "Technical test",
  "Phone call",
  "Reminder",
  "Other",
];
const eventTypeLabelToValue: Record<CalendarEventTypeLabel, number> = {
  Interview: 0,
  "Follow-up": 1,
  Deadline: 2,
  "Technical test": 3,
  "Phone call": 4,
  Reminder: 5,
  Other: 6,
};
const eventTypeValueToLabel: Record<number, CalendarEventTypeLabel> = {
  0: "Interview",
  1: "Follow-up",
  2: "Deadline",
  3: "Technical test",
  4: "Phone call",
  5: "Reminder",
  6: "Other",
};
const defaultStartTime = "09:00";

type CalendarEventFormMode = "create" | "edit";

interface CalendarEventFormState {
  mode: CalendarEventFormMode;
  eventId?: number;
  title: string;
  type: CalendarEventTypeLabel;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  applicationId?: number | null;
  applicationLabel?: string;
  isCompleted?: boolean;
}

interface CalendarEvent {
  id: number;
  title: string;
  type: CalendarEventTypeLabel;
  startsAt: string;
  endsAt?: string;
  application?: {
    id?: number | null;
    company: string;
    role?: string;
  };
  location?: string;
  notes?: string;
  isCompleted: boolean;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function getIsoWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return weekNumber;
}

function getEventTypeLabel(value: number): CalendarEventTypeLabel {
  return eventTypeValueToLabel[value] ?? "Other";
}

function buildApplicationLabel(application: JobApplication): string {
  const role = application.roleTitle?.trim();

  return role ? `${application.companyName} • ${role}` : application.companyName;
}

function normalizeCalendarEvent(item: CalendarEventResponse): CalendarEvent {
  const companyName = item.companyName?.trim();
  const jobTitle = item.jobTitle?.trim();
  const jobApplicationId = item.jobApplicationId ?? undefined;
  const hasApplicationInfo = Boolean(jobApplicationId || companyName || jobTitle);

  return {
    id: item.id,
    title: item.title,
    type: getEventTypeLabel(item.eventType),
    startsAt: item.startDateTime,
    endsAt: item.endDateTime ?? undefined,
    application: hasApplicationInfo
      ? {
          id: jobApplicationId,
          company: companyName || "Linked application",
          role: jobTitle ?? undefined,
        }
      : undefined,
    location: item.location ?? undefined,
    notes: item.description ?? undefined,
    isCompleted: item.isCompleted,
  };
}

function deriveUpcomingEvents(sourceEvents: CalendarEvent[]): CalendarEvent[] {
  const now = new Date().getTime();

  return [...sourceEvents]
    .filter((event) => new Date(event.startsAt).getTime() >= now)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
    )
    .slice(0, 5);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const response = await getCalendarEvents();
  return response.map(normalizeCalendarEvent);
}

async function fetchUpcomingEvents(
  fallbackEvents: CalendarEvent[]
): Promise<CalendarEvent[]> {
  try {
    const response = await getUpcomingCalendarEvents();
    return response.map(normalizeCalendarEvent);
  } catch {
    return deriveUpcomingEvents(fallbackEvents);
  }
}

function formatEventTimeRange(startsAt: string, endsAt?: string): string {
  const start = new Date(startsAt);

  if (Number.isNaN(start.getTime())) {
    return startsAt;
  }

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const startLabel = start.toLocaleTimeString([], timeOptions);

  if (!endsAt) {
    return startLabel;
  }

  const end = new Date(endsAt);

  if (Number.isNaN(end.getTime())) {
    return startLabel;
  }

  const endLabel = end.toLocaleTimeString([], timeOptions);
  return `${startLabel} - ${endLabel}`;
}

function formatEventDateTime(event: CalendarEvent): string {
  const start = new Date(event.startsAt);

  if (Number.isNaN(start.getTime())) {
    return event.startsAt;
  }

  const dateLabel = start.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = formatEventTimeRange(event.startsAt, event.endsAt);
  return `${dateLabel} • ${timeLabel}`;
}

function getEventTypeStyles(type: CalendarEventTypeLabel): string {
  switch (type) {
    case "Interview":
      return "bg-green-50 text-green-700 border-green-200";
    case "Follow-up":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Deadline":
      return "bg-red-50 text-red-700 border-red-200";
    case "Technical test":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Phone call":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Reminder":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

interface CalendarDayCellProps {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  onCreate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

function CalendarDayCell({
  date,
  events,
  isToday,
  onCreate,
  onSelectEvent,
}: CalendarDayCellProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCreate(date)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCreate(date);
        }
      }}
      className={`min-h-[110px] rounded-lg border border-border p-2 space-y-2 cursor-pointer transition-colors hover:border-muted-foreground ${
        isToday ? "bg-blue-50/70 border-blue-200" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${isToday ? "text-blue-900" : "text-foreground"}`}>
          {date.getDate()}
        </span>
        {events.length > 0 && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              isToday
                ? "border-blue-200 text-blue-700"
                : "border-border text-muted-foreground"
            }`}
          >
            {events.length} event{events.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {events.slice(0, maxEventsPerDay).map((eventItem) => (
          <button
            key={eventItem.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelectEvent(eventItem);
            }}
            className={`text-[10px] px-2 py-1 rounded border truncate w-full text-left ${getEventTypeStyles(eventItem.type)}`}
            title={eventItem.title}
          >
            {eventItem.title}
          </button>
        ))}
        {events.length > maxEventsPerDay && (
          <div
            className={`text-[10px] ${
              isToday ? "text-blue-700" : "text-muted-foreground"
            }`}
          >
            +{events.length - maxEventsPerDay} more
          </div>
        )}
      </div>
    </div>
  );
}

interface UpcomingEventsListProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

function UpcomingEventsList({ events, isLoading }: UpcomingEventsListProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading upcoming events...</p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatEventDateTime(event)}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded border ${getEventTypeStyles(event.type)}`}>
              {event.type}
            </span>
          </div>
          {event.application && (
            <p className="text-xs text-muted-foreground">
              {event.application.company}
              {event.application.role ? ` • ${event.application.role}` : ""}
            </p>
          )}
          {event.location && (
            <p className="text-xs text-muted-foreground">{event.location}</p>
          )}
        </div>
      ))}

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
      )}
    </div>
  );
}

interface CalendarEventFormModalProps {
  open: boolean;
  formState: CalendarEventFormState | null;
  applications: JobApplication[];
  error: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: Partial<CalendarEventFormState>) => void;
  onSubmit: () => void;
}

function CalendarEventFormModal({
  open,
  formState,
  applications,
  error,
  isSubmitting,
  onOpenChange,
  onChange,
  onSubmit,
}: CalendarEventFormModalProps) {
  if (!formState) {
    return null;
  }

  const isEdit = formState.mode === "edit";
  const inputClassName = "w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border";
  const applicationValue =
    formState.applicationId !== null && formState.applicationId !== undefined
      ? String(formState.applicationId)
      : "";
  const applicationOptions = applications.map((application) => ({
    value: String(application.id),
    label: buildApplicationLabel(application),
  }));
  const applicationOptionValues = new Set(
    applicationOptions.map((option) => option.value)
  );
  const fallbackApplicationOption =
    applicationValue && !applicationOptionValues.has(applicationValue)
      ? {
          value: applicationValue,
          label:
            formState.applicationLabel ?? `Linked application #${applicationValue}`,
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this calendar event."
              : "Add a new event to your job search calendar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(event) => onChange({ title: event.target.value })}
                className={inputClassName}
                placeholder="e.g., Interview with Acme"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Event type</label>
              <select
                value={formState.type}
                onChange={(event) =>
                  onChange({ type: event.target.value as CalendarEventTypeLabel })
                }
                className={inputClassName}
              >
                {eventTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Date</label>
              <input
                type="date"
                value={formState.date}
                onChange={(event) => onChange({ date: event.target.value })}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Start time</label>
              <input
                type="time"
                value={formState.startTime}
                onChange={(event) => onChange({ startTime: event.target.value })}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End time</label>
              <input
                type="time"
                value={formState.endTime}
                onChange={(event) => onChange({ endTime: event.target.value })}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Related application/company</label>
              <select
                value={applicationValue}
                onChange={(event) => {
                  const value = event.target.value;

                  if (!value) {
                    onChange({ applicationId: null, applicationLabel: undefined });
                    return;
                  }

                  const numericValue = Number(value);
                  const selectedApplication = applications.find(
                    (application) => String(application.id) === value
                  );

                  onChange({
                    applicationId: Number.isNaN(numericValue) ? null : numericValue,
                    applicationLabel: selectedApplication
                      ? buildApplicationLabel(selectedApplication)
                      : `Linked application #${value}`,
                  });
                }}
                className={inputClassName}
              >
                <option value="">Not linked</option>
                {fallbackApplicationOption && (
                  <option value={fallbackApplicationOption.value}>
                    {fallbackApplicationOption.label}
                  </option>
                )}
                {applicationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Location / meeting type</label>
              <input
                type="text"
                value={formState.location}
                onChange={(event) => onChange({ location: event.target.value })}
                className={inputClassName}
                placeholder="Teams, phone, office"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Description / notes</label>
            <textarea
              rows={4}
              value={formState.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              className={`${inputClassName} resize-none`}
              placeholder="Add any notes or prep details..."
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save changes"
                : "Add event"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CalendarEventDetailsModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  isDeleting: boolean;
}

function CalendarEventDetailsModal({
  event,
  onClose,
  onEdit,
  onDelete,
  isDeleting,
}: CalendarEventDetailsModalProps) {
  if (!event) {
    return null;
  }

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>Event details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded border ${getEventTypeStyles(event.type)}`}>
              {event.type}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatEventDateTime(event)}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Related application/company</p>
            <p className="text-sm">
              {event.application
                ? `${event.application.company}${event.application.role ? ` • ${event.application.role}` : ""}`
                : "Not linked"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Location / meeting type</p>
            <p className="text-sm">{event.location || "Not set"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Description / notes</p>
            <p className="text-sm text-muted-foreground">
              {event.notes && event.notes.trim().length > 0
                ? event.notes
                : "No notes added."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onDelete(event)}
            disabled={isDeleting}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
              isDeleting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Calendar() {
  const [visibleDate, setVisibleDate] = useState<Date>(
    () => new Date()
  );
  const realToday = new Date();
  const monthStart = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const monthEnd = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0);
  const monthLabel = monthStart.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
  const startDayIndex = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const todayKey = toDateKey(realToday);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [formState, setFormState] = useState<CalendarEventFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCalendarData() {
      setIsLoading(true);
      setIsUpcomingLoading(true);
      setCalendarError(null);

      try {
        const loadedEvents = await fetchCalendarEvents();

        if (!isMounted) {
          return;
        }

        setEvents(loadedEvents);

        const loadedUpcoming = await fetchUpcomingEvents(loadedEvents);

        if (!isMounted) {
          return;
        }

        setUpcomingEvents(loadedUpcoming);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCalendarError(getErrorMessage(error, "Failed to load calendar events."));
        setEvents([]);
        setUpcomingEvents([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsUpcomingLoading(false);
        }
      }
    }

    async function loadApplications() {
      try {
        const response = await getAllApplications();

        if (isMounted) {
          setApplications(response);
        }
      } catch {
        if (isMounted) {
          setApplications([]);
        }
      }
    }

    void loadCalendarData();
    void loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const date = new Date(event.startsAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = toDateKey(date);
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    });

    map.forEach((calendarEventsForDay) =>
      calendarEventsForDay.sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
      )
    );

    return map;
  }, [events]);

  const dayCells: Array<Date | null> = [];

  for (let i = 0; i < startDayIndex; i += 1) {
    dayCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), day));
  }

  const dayRows: Array<Array<Date | null>> = [];

  for (let index = 0; index < dayCells.length; index += 7) {
    dayRows.push(dayCells.slice(index, index + 7));
  }

  function handlePreviousMonth() {
    setVisibleDate((previous) =>
      new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
    );
  }

  function handleNextMonth() {
    setVisibleDate((previous) =>
      new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
    );
  }

  function handleToday() {
    const today = new Date();
    setVisibleDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function openCreateModal(date: Date) {
    setFormError(null);
    setFormState({
      mode: "create",
      title: "",
      type: "Interview",
      date: toDateKey(date),
      startTime: defaultStartTime,
      endTime: "",
      location: "",
      notes: "",
      applicationId: null,
      applicationLabel: undefined,
      isCompleted: false,
    });
    setIsFormOpen(true);
  }

  function openEditModal(event: CalendarEvent) {
    const relatedApplicationLabel = event.application?.role
      ? `${event.application.company} • ${event.application.role}`
      : event.application?.company;

    setFormError(null);
    setFormState({
      mode: "edit",
      eventId: event.id,
      title: event.title,
      type: event.type,
      date: toDateKey(new Date(event.startsAt)),
      startTime: formatTimeInput(event.startsAt) || defaultStartTime,
      endTime: event.endsAt ? formatTimeInput(event.endsAt) : "",
      location: event.location ?? "",
      notes: event.notes ?? "",
      applicationId: event.application?.id ?? null,
      applicationLabel: relatedApplicationLabel,
      isCompleted: event.isCompleted,
    });
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    if (!open) {
      setIsFormOpen(false);
      setFormState(null);
      setFormError(null);
    } else {
      setIsFormOpen(true);
    }
  }

  function updateForm(next: Partial<CalendarEventFormState>) {
    setFormState((previous) => (previous ? { ...previous, ...next } : previous));
  }

  async function refreshCalendarEvents() {
    setCalendarError(null);
    setIsUpcomingLoading(true);

    try {
      const loadedEvents = await fetchCalendarEvents();
      setEvents(loadedEvents);

      const loadedUpcoming = await fetchUpcomingEvents(loadedEvents);
      setUpcomingEvents(loadedUpcoming);
    } catch (error) {
      setCalendarError(getErrorMessage(error, "Failed to refresh calendar events."));
      setEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsUpcomingLoading(false);
    }
  }

  async function handleSaveEvent() {
    if (!formState) {
      return;
    }

    if (isSaving) {
      return;
    }

    const trimmedTitle = formState.title.trim();
    const trimmedDate = formState.date.trim();

    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    if (!trimmedDate) {
      setFormError("Date is required.");
      return;
    }

    const startTime = formState.startTime || defaultStartTime;
    const startDateTime = buildDateTime(trimmedDate, startTime);
    const endDateTime = formState.endTime
      ? buildDateTime(trimmedDate, formState.endTime)
      : null;
    const location = formState.location.trim();
    const notes = formState.notes.trim();
    const jobApplicationId = formState.applicationId ?? null;

    const basePayload = {
      jobApplicationId,
      title: trimmedTitle,
      description: notes ? notes : null,
      eventType: eventTypeLabelToValue[formState.type],
      startDateTime,
      endDateTime,
      location: location ? location : null,
    };

    setIsSaving(true);
    setFormError(null);

    try {
      if (formState.mode === "edit" && formState.eventId !== undefined) {
        const payload: CalendarEventUpdateRequest = {
          ...basePayload,
          isCompleted: formState.isCompleted ?? false,
        };

        await updateCalendarEvent(formState.eventId, payload);
      } else {
        const payload: CalendarEventCreateRequest = basePayload;
        await createCalendarEvent(payload);
      }

      await refreshCalendarEvents();
      setIsFormOpen(false);
      setFormState(null);
    } catch (error) {
      setFormError(getErrorMessage(error, "Failed to save event."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEvent(event: CalendarEvent) {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setCalendarError(null);

    try {
      await deleteCalendarEvent(event.id);
      setSelectedEvent(null);
      await refreshCalendarEvents();
    } catch (error) {
      setCalendarError(getErrorMessage(error, "Failed to delete event."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Calendar</h1>
        <p className="text-muted-foreground">Track interviews, deadlines, and follow-ups</p>
      </div>

      {calendarError && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {calendarError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-medium">{monthLabel}</h2>
              <p className="text-xs text-muted-foreground">Monthly overview</p>
              {isLoading && (
                <p className="text-xs text-muted-foreground">Loading events...</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">Job search schedule</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-8 text-xs text-muted-foreground">
            <div className="px-2 py-1 text-[10px]">v.</div>
            {weekDays.map((day) => (
              <div key={day} className="px-2 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 gap-2">
            {dayRows.map((week, rowIndex) => {
              const firstDate = week.find((date) => date !== null);
              const weekNumber = firstDate ? getIsoWeekNumber(firstDate) : null;

              return (
                <Fragment key={`week-${rowIndex}`}>
                  <div className="min-h-[110px] rounded-lg border border-dashed border-border bg-[#fafafa] flex items-start justify-center pt-2 text-[10px] text-muted-foreground">
                    {weekNumber ? `v.${weekNumber}` : ""}
                  </div>
                  {week.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${rowIndex}-${index}`}
                          className="min-h-[110px] rounded-lg border border-dashed border-border bg-[#fafafa]"
                        />
                      );
                    }

                    const dateKey = toDateKey(date);
                    const eventsForDay = eventsByDate.get(dateKey) ?? [];
                    const isToday = dateKey === todayKey;

                    return (
                      <CalendarDayCell
                        key={dateKey}
                        date={date}
                        events={eventsForDay}
                        isToday={isToday}
                        onCreate={openCreateModal}
                        onSelectEvent={(event) => setSelectedEvent(event)}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-[17px] font-medium">Upcoming Events</h2>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
          <div className="p-6">
            <UpcomingEventsList
              events={upcomingEvents}
              isLoading={isLoading || isUpcomingLoading}
            />
          </div>
        </div>
      </div>

      <CalendarEventFormModal
        open={isFormOpen}
        formState={formState}
        applications={applications}
        error={formError}
        isSubmitting={isSaving}
        onOpenChange={handleFormOpenChange}
        onChange={updateForm}
        onSubmit={handleSaveEvent}
      />

      <CalendarEventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(event) => {
          setSelectedEvent(null);
          openEditModal(event);
        }}
        onDelete={handleDeleteEvent}
        isDeleting={isDeleting}
      />
    </div>
  );
}
