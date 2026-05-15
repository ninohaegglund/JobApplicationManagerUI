import { useMemo } from "react";
import { Link } from "react-router";
import {
  calendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from "../data/jobTrackerMockData";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxEventsPerDay = 2;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function getEventTypeStyles(type: CalendarEventType): string {
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

export function Calendar() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthLabel = monthStart.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
  const startDayIndex = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const todayKey = toDateKey(today);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    calendarEvents.forEach((event) => {
      const date = new Date(event.startsAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = toDateKey(date);
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    });

    map.forEach((events) =>
      events.sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
      )
    );

    return map;
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date().getTime();

    return [...calendarEvents]
      .filter((event) => new Date(event.startsAt).getTime() >= now)
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
      )
      .slice(0, 5);
  }, []);

  const dayCells: Array<Date | null> = [];

  for (let i = 0; i < startDayIndex; i += 1) {
    dayCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(new Date(today.getFullYear(), today.getMonth(), day));
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Calendar</h1>
        <p className="text-muted-foreground">Track interviews, deadlines, and follow-ups</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-medium">{monthLabel}</h2>
              <p className="text-xs text-muted-foreground">Monthly overview</p>
            </div>
            <div className="text-xs text-muted-foreground">Job search schedule</div>
          </div>

          <div className="grid grid-cols-7 text-xs text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day} className="px-2 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayCells.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[110px] rounded-lg border border-dashed border-border bg-[#fafafa]"
                  />
                );
              }

              const dateKey = toDateKey(date);
              const events = eventsByDate.get(dateKey) ?? [];
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`min-h-[110px] rounded-lg border border-border p-2 space-y-2 ${
                    isToday ? "bg-foreground text-background" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isToday ? "text-background" : "text-foreground"}`}>
                      {date.getDate()}
                    </span>
                    {events.length > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          isToday
                            ? "border-background/30 text-background"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {events.length} event{events.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, maxEventsPerDay).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-2 py-1 rounded border truncate ${
                          isToday
                            ? "border-background/30 text-background"
                            : getEventTypeStyles(event.type)
                        }`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > maxEventsPerDay && (
                      <div
                        className={`text-[10px] ${
                          isToday ? "text-background/80" : "text-muted-foreground"
                        }`}
                      >
                        +{events.length - maxEventsPerDay} more
                      </div>
                    )}
                  </div>
                </div>
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
          <div className="p-6 space-y-4">
            {upcomingEvents.map((event) => (
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

            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
