import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, UserCircle, TrendingUp } from "lucide-react";
import { ApiError } from "../../services/httpClient";
import { getUpcomingCalendarEvents } from "../../services/calendarEventsService";
import { getAllApplications } from "../../services/jobApplicationService";
import type {
  CalendarEventResponse,
  CalendarEventTypeLabel,
} from "../../types/calendarEvents";
import type { JobApplication } from "../../types/jobApplications";

const eventTypeValueToLabel: Record<number, CalendarEventTypeLabel> = {
  0: "Interview",
  1: "Follow-up",
  2: "Deadline",
  3: "Technical test",
  4: "Phone call",
  5: "Reminder",
  6: "Other",
};

interface DashboardCalendarEvent {
  id: number;
  title: string;
  type: CalendarEventTypeLabel;
  startsAt: string;
  application?: {
    id?: number | null;
    company: string;
    role?: string;
  };
  location?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Interview":
      return "bg-green-50 text-green-700 border-green-200";
    case "Applied":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Draft":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
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

function getEventTypeLabel(value: number): CalendarEventTypeLabel {
  return eventTypeValueToLabel[value] ?? "Other";
}

function normalizeCalendarEvent(item: CalendarEventResponse): DashboardCalendarEvent {
  const companyName = item.companyName?.trim();
  const jobTitle = item.jobTitle?.trim();
  const jobApplicationId = item.jobApplicationId ?? undefined;
  const hasApplicationInfo = Boolean(jobApplicationId || companyName || jobTitle);

  return {
    id: item.id,
    title: item.title,
    type: getEventTypeLabel(item.eventType),
    startsAt: item.startDateTime,
    application: hasApplicationInfo
      ? {
          id: jobApplicationId,
          company: companyName || "Linked application",
          role: jobTitle ?? undefined,
        }
      : undefined,
    location: item.location ?? undefined,
  };
}

function formatEventDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Dashboard() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAllApplications();

        if (isMounted) {
          setApplications(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Unable to load dashboard data.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    async function loadUpcomingEvents() {
      setIsUpcomingLoading(true);
      setUpcomingError(null);

      try {
        const data = await getUpcomingCalendarEvents();

        if (isMounted) {
          setUpcomingEvents(data.map(normalizeCalendarEvent).slice(0, 3));
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setUpcomingError(err.message);
          } else {
            setUpcomingError("Unable to load upcoming events.");
          }
          setUpcomingEvents([]);
        }
      } finally {
        if (isMounted) {
          setIsUpcomingLoading(false);
        }
      }
    }

    void loadDashboardData();
    void loadUpcomingEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const draft = applications.filter((application) => application.status === "Draft").length;
    const applied = applications.filter((application) => application.status === "Applied").length;
    const interview = applications.filter((application) => application.status === "Interview").length;
    const rejected = applications.filter((application) => application.status === "Rejected").length;

    return [
      { label: "Total Applications", value: String(total), change: "Live data", color: "text-foreground" },
      { label: "Draft", value: String(draft), change: "Current", color: "text-muted-foreground" },
      { label: "Applied", value: String(applied), change: "Current", color: "text-blue-600" },
      { label: "Interviews", value: String(interview), change: "Current", color: "text-green-600" },
      { label: "Rejected", value: String(rejected), change: "Current", color: "text-muted-foreground" },
    ];
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [applications]);

  const recentActivity = useMemo(() => {
    return recentApplications.slice(0, 4).map((application) => ({
      action: `Updated ${application.companyName} (${application.status})`,
      time: formatDate(application.updatedAt),
    }));
  }, [recentApplications]);

  function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job application progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
            <div className={`text-[32px] font-medium leading-none mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          to="/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Application
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          Manage Profile
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="col-span-2 bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-[17px] font-medium">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{app.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{app.roleTitle}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                  <span>Created {formatDate(app.createdAt)}</span>
                  <span>Updated {formatDate(app.updatedAt)}</span>
                </div>
              </div>
            ))}

            {!isLoading && !error && recentApplications.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No applications yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-[17px] font-medium">Upcoming Events</h2>
              <Link to="/calendar" className="text-sm text-muted-foreground hover:text-foreground">
                View calendar
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {isUpcomingLoading && (
                <div className="text-sm text-muted-foreground">Loading upcoming events...</div>
              )}

              {upcomingError && (
                <div className="text-sm text-red-600">{upcomingError}</div>
              )}

              {!isUpcomingLoading && !upcomingError &&
                upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatEventDateTime(event.startsAt)}
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

              {!isUpcomingLoading && !upcomingError && upcomingEvents.length === 0 && (
                <div className="text-sm text-muted-foreground">No upcoming events yet.</div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-[17px] font-medium">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}

              {!isLoading && !error && recentActivity.length === 0 && (
                <div className="text-sm text-muted-foreground">No recent activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
