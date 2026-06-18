import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, UserCircle, TrendingUp } from "lucide-react";
import { ApiError } from "../../services/httpClient";
import { getUpcomingCalendarEvents } from "../../services/calendarEventsService";
import { getAllApplications } from "../../services/jobApplicationService";
import { useLanguage } from "../../context/LanguageContext";
import type {
  CalendarEventResponse,
  CalendarEventTypeLabel,
} from "../../types/calendarEvents";
import { ApplicationQuality, type JobApplication } from "../../types/jobApplications";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

interface WeekBucket {
  start: Date;
  count: number;
}

function parseValidDate(value: string): Date | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getStartOfWeek(date: Date, weekStartsOn = 1): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function formatWeekKey(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startLabel = weekStart.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const endLabel = weekEnd.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  if (weekStart.getFullYear() === weekEnd.getFullYear()) {
    return `${startLabel} - ${endLabel}`;
  }

  return `${startLabel} ${weekStart.getFullYear()} - ${endLabel} ${weekEnd.getFullYear()}`;
}

function groupApplicationsByWeek(applications: JobApplication[]): WeekBucket[] {
  const buckets = new Map<string, WeekBucket>();

  applications.forEach((application) => {
    const createdAt = parseValidDate(application.createdAt);

    if (!createdAt) {
      return;
    }

    const weekStart = getStartOfWeek(createdAt);
    const key = formatWeekKey(weekStart);
    const existing = buckets.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { start: weekStart, count: 1 });
    }
  });

  return Array.from(buckets.values()).sort(
    (left, right) => left.start.getTime() - right.start.getTime()
  );
}

function formatAverage(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const rounded = Math.round(value * 10) / 10;

  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const rounded = Math.round(value * 10) / 10;
  const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);

  return `${formatted}%`;
}

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

function getApplicationQualityLabel(
  quality: ApplicationQuality | undefined,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  switch (quality ?? ApplicationQuality.Unrated) {
    case ApplicationQuality.Strong:
      return t("applicationQuality.strong");
    case ApplicationQuality.Moderate:
      return t("applicationQuality.moderate");
    case ApplicationQuality.Stretch:
      return t("applicationQuality.stretch");
    case ApplicationQuality.Unrated:
    default:
      return t("applicationQuality.unrated");
  }
}

function getApplicationQualityStyles(quality: ApplicationQuality | undefined): string {
  switch (quality ?? ApplicationQuality.Unrated) {
    case ApplicationQuality.Strong:
      return "bg-green-50 text-green-700 border-green-200";
    case ApplicationQuality.Moderate:
      return "bg-blue-50 text-blue-700 border-blue-200";
    case ApplicationQuality.Stretch:
      return "bg-amber-50 text-amber-700 border-amber-200";
    case ApplicationQuality.Unrated:
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
  const { t } = useLanguage();
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
    const offer = applications.filter((application) => application.status === "Offer").length;
    const rejected = applications.filter((application) => application.status === "Rejected").length;
    const strong = applications.filter(
      (application) => application.applicationQuality === ApplicationQuality.Strong
    ).length;
    const moderate = applications.filter(
      (application) => application.applicationQuality === ApplicationQuality.Moderate
    ).length;
    const stretch = applications.filter(
      (application) => application.applicationQuality === ApplicationQuality.Stretch
    ).length;
    const unrated = applications.filter(
      (application) =>
        (application.applicationQuality ?? ApplicationQuality.Unrated) ===
        ApplicationQuality.Unrated
    ).length;
    const appliedTotal = total - draft;
    const responded = interview + offer + rejected;
    const responseRate = appliedTotal > 0 ? (responded / appliedTotal) * 100 : 0;

    const now = new Date();
    const thisWeekStart = getStartOfWeek(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const weeklyBuckets = groupApplicationsByWeek(applications);
    const weeklyBucketMap = new Map(
      weeklyBuckets.map((bucket) => [formatWeekKey(bucket.start), bucket])
    );

    const createdThisWeek =
      weeklyBucketMap.get(formatWeekKey(thisWeekStart))?.count ?? 0;
    const createdLastWeek =
      weeklyBucketMap.get(formatWeekKey(lastWeekStart))?.count ?? 0;

    const createdDates = applications
      .map((application) => parseValidDate(application.createdAt))
      .filter((date): date is Date => date !== null);
    const totalCreated = createdDates.length;

    let averagePerWeek = 0;

    if (totalCreated > 0) {
      const earliestDate = new Date(
        Math.min(...createdDates.map((date) => date.getTime()))
      );
      const rangeStart = getStartOfWeek(earliestDate);
      const rangeEnd = getStartOfWeek(now);
      const weeksInRange =
        Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / MS_PER_WEEK) + 1;

      averagePerWeek = weeksInRange > 0 ? totalCreated / weeksInRange : totalCreated;
    }

    let bestWeekCount = 0;
    let bestWeekLabel = "No data";

    if (weeklyBuckets.length > 0) {
      const bestBucket = weeklyBuckets.reduce((best, current) =>
        current.count > best.count ? current : best
      );

      bestWeekCount = bestBucket.count;
      bestWeekLabel = `Week of ${formatWeekRange(bestBucket.start)}`;
    }

    return [
      {
        label: "Total Applications",
        value: String(total),
        change: "Live data",
        color: "text-foreground",
        breakdown: [
          { label: t("applicationQuality.strongShort"), value: strong, className: "text-green-700" },
          { label: t("applicationQuality.moderateShort"), value: moderate, className: "text-blue-700" },
          { label: t("applicationQuality.stretchShort"), value: stretch, className: "text-amber-700" },
          { label: t("applicationQuality.unratedShort"), value: unrated, className: "text-gray-700" },
        ],
      },
      { label: "Draft", value: String(draft), change: "Current", color: "text-muted-foreground" },
      { label: "Applied", value: String(applied), change: "Current", color: "text-blue-600" },
      { label: "Interviews", value: String(interview), change: "Current", color: "text-green-600" },
      { label: "Rejected", value: String(rejected), change: "Current", color: "text-muted-foreground" },
      {
        label: "Applications Created This Week",
        value: String(createdThisWeek),
        change: `Week of ${formatWeekRange(thisWeekStart)}`,
        color: "text-foreground",
      },
      {
        label: "Applications Created Last Week",
        value: String(createdLastWeek),
        change: `Week of ${formatWeekRange(lastWeekStart)}`,
        color: "text-foreground",
      },
      {
        label: "Average Applications Per Week",
        value: formatAverage(averagePerWeek),
        change: "Since first application",
        color: "text-foreground",
      },
      {
        label: "Best Week By Applications",
        value: String(bestWeekCount),
        change: bestWeekLabel,
        color: "text-foreground",
      },
      {
        label: "Response Rate",
        value: formatPercentage(responseRate),
        change: "Interview/Offer/Rejected vs applied",
        color: "text-foreground",
      },
    ];
  }, [applications, t]);

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
        <h1 className="text-[28px] font-medium mb-1">{t("nav.dashboard")}</h1>
        <p className="text-muted-foreground">{t("pages.dashboard.subtitle")}</p>
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
            {"breakdown" in stat && stat.breakdown ? (
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-border pt-3 text-xs">
                {stat.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-medium ${item.className}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
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
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getApplicationQualityStyles(
                        app.applicationQuality
                      )}`}
                    >
                      {getApplicationQualityLabel(app.applicationQuality, t)}
                    </span>
                  </div>
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
