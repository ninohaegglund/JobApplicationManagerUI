import { useMemo } from "react";
import { Link } from "react-router";
import { useNotifications } from "../../context/NotificationsContext";
import { useLanguage } from "../../context/LanguageContext";
import type { NotificationItem, NotificationType } from "../data/jobTrackerMockData";

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationTypeStyles(type: NotificationType): string {
  switch (type) {
    case "Interview reminder":
      return "bg-green-50 text-green-700 border-green-200";
    case "Follow-up reminder":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Deadline soon":
      return "bg-red-50 text-red-700 border-red-200";
    case "Application updated":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function getApplicationLink(notification: NotificationItem): string | null {
  if (!notification.application) {
    return null;
  }

  return `/applications/${notification.application.id}/edit`;
}

export function Notifications() {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [notifications]
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">{t("nav.notifications")}</h1>
          <p className="text-muted-foreground">{t("pages.notifications.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm disabled:opacity-60"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border divide-y">
        {sortedNotifications.map((notification) => {
          const applicationLink = getApplicationLink(notification);

          return (
            <div
              key={notification.id}
              className={`p-6 flex items-start justify-between gap-6 ${
                notification.read
                  ? "bg-white"
                  : "bg-[#fafafa] border-l-4 border-blue-500 pl-5"
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  {!notification.read && (
                    <span className="text-[11px] text-blue-600 font-medium">Unread</span>
                  )}
                  <span className={`text-[11px] px-2 py-0.5 rounded border ${getNotificationTypeStyles(notification.type)}`}>
                    {notification.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                  <span>{formatNotificationDate(notification.createdAt)}</span>
                  {notification.application && (
                    <span>
                      {notification.application.company}
                      {notification.application.role ? ` • ${notification.application.role}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="px-3 py-2 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                  >
                    Mark as read
                  </button>
                )}
                {applicationLink && (
                  <Link
                    to={applicationLink}
                    className="px-3 py-2 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                  >
                    View application
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {sortedNotifications.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">No notifications yet.</div>
        )}
      </div>
    </div>
  );
}
